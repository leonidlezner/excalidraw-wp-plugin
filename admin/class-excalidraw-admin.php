<?php


class Excalidraw_Admin
{
  private $plugin_name;
  private $plugin_version;

  public function __construct($plugin_name, $plugin_version)
  {
    $this->plugin_name = $plugin_name;
    $this->plugin_version = $plugin_version;
  }

  private static function is_view($name)
  {
    return isset($_GET['view']) && $_GET['view'] == $name;
  }

  public function enqueue_styles()
  {
    $file = 'css/excalidraw-admin.css';
    $filePath = plugin_dir_path(__FILE__) . $file;
    $fileUrl = plugin_dir_url(__FILE__) . $file;
    $fileTime = filemtime($filePath);

    if (!self::is_view('new') && !self::is_view('edit')) {
      wp_enqueue_style($this->plugin_name, "$fileUrl", [], $fileTime);
    }
  }

  public function enqueue_scripts()
  {
    if (self::is_view('new') || self::is_view('edit')) {
      if (defined('EXCALIDRAW_DEV') && is_array(wp_remote_get('http://localhost:5173/'))) { // TODO: change this check so something more performant
        wp_enqueue_script('vite', 'http://localhost:5173/@vite/client', [], null);
        wp_enqueue_script($this->plugin_name, 'http://localhost:5173/src/App.tsx', [], null, true);
        wp_enqueue_style($this->plugin_name, 'http://localhost:5173/src/App.css', [], 'null');
      } else {
        $manifestFile = plugin_dir_path(dirname(__FILE__)) . 'admin/excalidraw-editor/dist/.vite/manifest.json';

        if (file_exists($manifestFile)) {
          $manifest = json_decode(file_get_contents($manifestFile), true);
          wp_enqueue_script($this->plugin_name, plugin_dir_url(__FILE__) . 'excalidraw-editor/dist/' . $manifest['src/App.tsx']['file'], [], null, true);
          wp_enqueue_style($this->plugin_name, plugin_dir_url(__FILE__) . 'excalidraw-editor/dist/' . $manifest['src/App.css']['file'], [], null);
        }
      }
    }
  }

  public function script_loader_tag(string $tag, string $handle, string $src)
  {
    if (in_array($handle, ['vite', $this->plugin_name])) {
      $script = [];

      if ($handle == 'vite') {
        // Add this script according to the Vite docs: https://vitejs.dev/guide/backend-integration.html
        $script[] = '<script type="module">';
        $script[] = '  import RefreshRuntime from \'http://localhost:5173/@react-refresh\'';
        $script[] = '  RefreshRuntime.injectIntoGlobalHook(window)';
        $script[] = '  window.$RefreshReg$ = () => {}';
        $script[] = '  window.$RefreshSig$ = () => (type) => type';
        $script[] = '  window.__vite_plugin_react_preamble_installed__ = true';
        $script[] = '</script>';
      }

      if ($handle == $this->plugin_name) {
        $script[] = '<script>';
        $script[] = 'window.EXCALIDRAW_ASSET_PATH = "' . Excalidraw::get_public_assets_url() . '";';
        $script[] = '</script>';
      }

      $script[] = '<script type="module" src="' . esc_url($src) . '" defer></script>';
      return join("\n", $script);
    }

    return $tag;
  }

  public function admin_menu()
  {
    add_menu_page('Drawings', 'Excalidraw', 'manage_options', 'excalidraw', array($this, 'admin_menu_display'), '', 11);
  }

  private function get_uid()
  {
    return uniqid();
  }

  public function admin_menu_display()
  {
    $apiURL = admin_url("admin-ajax.php");
    $nonce = wp_create_nonce("excalidraw_save");
    $table_name = Excalidraw::get_db_table_name();
    $closeUrl = admin_url('admin.php?page=excalidraw');

    if (self::is_view('edit')) {
      $docId = $_GET['docId'];
      $doc = $this->get_document_from_db($docId);

      if (!$doc) {
        echo "<p>" . __("Document not found", $this->plugin_name) . "</p>";
        return;
      }

      $docTitle = $doc->title;
      $docId = $doc->uuid;
      $docSource = $doc->source;
      $docFiles = $doc->files;

      $docUrl = admin_url('admin.php?page=excalidraw&view=edit&docId=' . $docId);

      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-edit.php';
    } else if (self::is_view('new')) {
      $docTitle = __("New Excalidraw Document", $this->plugin_name);
      $docId = "";
      $docUrl = admin_url('admin.php?page=excalidraw&view=new');
      $docSource = "";

      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-edit.php';
    } else {
      require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-excalidraw-doctable.php';

      $table = new Excalidraw_DocTable($this->plugin_name, $this->plugin_version);
      $table->prepare_items();

      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-list.php';
    }
  }

  private function get_document_from_db($docId)
  {
    global $wpdb;
    $table_name = Excalidraw::get_db_table_name();

    $sql = $wpdb->prepare("SELECT * FROM $table_name WHERE uuid = %s", $docId);

    $results = $wpdb->get_results($sql);

    if (count($results) < 1) {
      return null;
    } else {
      return $results[0];
    }
  }

  public function admin_handler_delete()
  {
    global $wpdb;

    $table_name = Excalidraw::get_db_table_name();

    $closeUrl = admin_url('admin.php?page=excalidraw');

    check_admin_referer($this->plugin_name . "_delete");

    $docId = $_GET['docId'];

    $doc = $this->get_document_from_db($docId);

    if ($doc) {
      $wpdb->delete($table_name, array('uuid' => $docId));
    }

    wp_redirect($closeUrl);
  }

  public function admin_ajax_handler_save()
  {
    global $wpdb;

    check_ajax_referer($this->plugin_name . "_save");

    $request_body = file_get_contents('php://input');

    if (!$request_body) {
      wp_send_json_error(__("Wrong data sent to server.", $this->plugin_name));
    }

    $data = json_decode($request_body);
    $docId = null;
    $existingDocument = null;

    if ($data->docId) {
      $docId = $data->docId;
      $existingDocument = $this->get_document_from_db($docId);
    } else {
      $docId = $this->get_uid();
    }

    $table_name = Excalidraw::get_db_table_name();

    $currentTime = date('Y-m-d H:i:s', time());

    $docData = array(
      'source' => $data->source,
      'files' => $data->files,
      'full' => $data->full,
      'full_dark' => $data->full_dark,
      'thumbnail' => $data->thumbnail,
      'title' => $data->title,
      'updated' => $currentTime
    );

    if ($existingDocument) {
      $result = $wpdb->update($table_name, $docData, array('uuid' => $docId));

      if ($result === false) {
        wp_send_json_error(__("Could not update the document.", $this->plugin_name));
      }

      wp_send_json_success([
        'timeUpdated' => $currentTime,
      ]);
    } else {
      $docData['created'] = $currentTime;
      $docData['uuid'] = $docId;
      $docData['author'] = get_current_user_id();

      $results = $wpdb->insert($table_name, $docData);

      if (!$results || $results < 1) {
        wp_send_json_error(__("Could not create the document.", $this->plugin_name));
      }

      wp_send_json_success([
        'redirect' => admin_url('admin.php?page=excalidraw&view=edit&docId=' . $docId),
        'timeUpdated' => $currentTime,
      ]);
    }
  }

  public function register_block()
  {
    register_block_type(
      plugin_dir_path(dirname(__FILE__)) . 'admin/excalidraw-block/build',
      array(
        'render_callback' => 'render_block_core_notice',
      )
    );
  }
}
