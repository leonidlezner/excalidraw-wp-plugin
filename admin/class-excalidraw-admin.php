<?php


class Excalidraw_Admin
{
  private $plugin_name;
  private $version;

  public function __construct($plugin_name, $version)
  {
    $this->plugin_name = $plugin_name;
    $this->version = $version;
  }

  private static function isView($name)
  {
    return isset($_GET['view']) && $_GET['view'] == $name;
  }

  public function enqueue_styles()
  {
  }

  public function enqueue_scripts()
  {
    if (self::isView('new') || self::isView('edit')) {
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

      $script[] = '<script type="module" src="' . esc_url($src) . '" defer></script>';
      return join("\n", $script);
    }

    return $tag;
  }

  public function admin_menu()
  {
    add_menu_page('Drawings', 'Excalidraw', 'manage_options', 'excalidraw', array($this, 'admin_menu_display'), '', 11);
  }

  private function getUID()
  {
    return uniqid();
  }

  public function admin_menu_display()
  {
    $apiURL = admin_url("admin-ajax.php");
    $nonce = wp_create_nonce("excalidraw_save");

    $table_name = Excalidraw::getDBTableName();

    if (self::isView('edit')) {
      $docId = $_GET['docId'];
      $doc = $this->getDocumentFromDB($docId);

      $docTitle = $doc->title;
      $docId = $doc->uuid;
      $docSource = $doc->source;
      $docFiles = $doc->files;

      $docUrl = admin_url('admin.php?page=excalidraw&view=edit&docId=' . $docId);

      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-edit.php';
    } else if (self::isView('new')) {
      $docTitle = "New Excalidraw Document";
      $docId = "";
      $docUrl = admin_url('admin.php?page=excalidraw&view=new');
      $docSource = "";

      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-edit.php';
    } else {
      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-list.php';
    }
  }

  private function getDocumentFromDB($docId)
  {
    global $wpdb;
    $table_name = Excalidraw::getDBTableName();

    $sql = $wpdb->prepare("SELECT * FROM $table_name WHERE uuid = %s", $docId);

    $results = $wpdb->get_results($sql);

    if (count($results) < 1) {
      return null;
    } else {
      return $results[0];
    }
  }

  function admin_ajax_handler_save()
  {
    global $wpdb;

    check_ajax_referer("excalidraw_save");

    $request_body = file_get_contents('php://input');

    if (!$request_body) {
      wp_send_json_error("Wrong data sent to server.");
    }

    $data = json_decode($request_body);
    $docId = null;
    $existingDocument = null;

    if ($data->docId) {
      $docId = $data->docId;
      $existingDocument = $this->getDocumentFromDB($docId);
    } else {
      $docId = $this->getUID();
    }

    $table_name = Excalidraw::getDBTableName();

    $currentTime = date('Y-m-d H:i:s', time());

    $docData = array(
      'source' => $data->source,
      'files' => $data->files,
      'full' => $data->full,
      'thumbnail' => $data->thumbnail,
      'title' => $data->title,
      'updated' => $currentTime
    );

    if ($existingDocument) {
      $result = $wpdb->update($table_name, $docData, array('uuid' => $docId));

      if ($result === false) {
        wp_send_json_error("Could not update the document.");
      }

      wp_send_json_success();
    } else {
      $docData['created'] = $currentTime;
      $docData['uuid'] = $docId;

      $results = $wpdb->insert($table_name, $docData);

      if (!$results || $results < 1) {
        wp_send_json_error("Could not create the document.");
      }

      wp_send_json_success([
        'redirect' => admin_url('admin.php?page=excalidraw&view=edit&docId=' . $docId)
      ]);
    }
  }
}
