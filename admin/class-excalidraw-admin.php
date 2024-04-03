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
    $icon = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="100%" height="100%" viewBox="0 0 75 74" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;"><path d="M3.756,58.856l13.867,12.64l50.085,-46.561l4.279,-22.323l-24.126,3.549l-44.591,51.876l0.486,0.819Zm52.647,-43.748c2.298,0 4.164,1.866 4.164,4.165c0,2.298 -1.866,4.164 -4.164,4.164c-2.299,0 -4.165,-1.866 -4.165,-4.164c-0,-2.299 1.866,-4.165 4.165,-4.165Z" style="fill:#fff;"/><path d="M3.176,57.472c2.92,2.81 6.001,6.547 13.075,13.205m-12.935,-12.25c3.897,3.052 8.669,7.179 14.145,12.297m-0.776,0.371c13.358,-11.79 26.164,-24.118 49.751,-45.772m-49.357,45.606c11.592,-10.598 21.97,-20.751 50.042,-45.58m0.675,-0.201c0.949,-5.689 1.655,-12.187 2.979,-22.992m-3.984,23.152c1.473,-7.822 3.449,-15.539 4.07,-22.239m0.013,-0.011c-4.792,0.298 -11.344,1.43 -23.397,3.968m23.897,-3.78c-7.55,-0.044 -15.685,1.727 -23.779,3.155m-0.325,-0.746c-15.752,19.564 -30.728,37.783 -44.256,52.155m44.719,-51.368c-14.997,17.445 -29.276,34.148 -43.971,51.944m-0.211,-0.276m-0,-0" style="fill:none;stroke:#fff;stroke-width:0.22px;"/><g><g><path d="M58.282,41.238l-14.46,14.154l18.091,16.164l9.824,-11.732l-14.743,-18.077" style="fill:#fff;stroke:#fff;stroke-width:0.11px;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:2;"/><path d="M57.294,41.281c-4.195,4.553 -8.959,8.092 -13.695,13.294m13.542,-12.936c-4.816,5.353 -9.916,10.313 -13.802,13.127m0.375,0.703c6.17,3.969 11.352,9.94 18.081,14.78m-17.894,-15.459c5.886,4.971 13.093,11.234 18.446,15.672m0.41,0.652c2.842,-4.553 6.027,-8.868 10.086,-11.359m-10.597,11.318c3.493,-3.298 5.87,-6.833 9.875,-11.029m0.709,-0.742c-5.646,-5.577 -10.308,-10.553 -15.094,-18.142m14.861,18.295c-3.744,-2.866 -6.601,-6.811 -14.831,-17.859m-0.217,0.332m-0,0" style="fill:#fff;stroke:#fff;stroke-width:0.22px;"/></g></g><g><g><path d="M33.56,17.503l-13.503,16.464l-11.844,-8.76l-5.903,-22.082l19.397,5.016l10.265,8.722" style="fill:#fff;stroke:#fff;stroke-width:0.11px;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:2;"/><path d="M32.6,17.952c-3.755,3.271 -5.918,6.741 -12.588,15.888m12.989,-16.201c-5.144,6.108 -10.764,12.174 -13.537,16.408m0.207,-0.153c-5.247,-2.431 -9.414,-6.662 -11.266,-8.551m10.578,8.611c-3.86,-2.773 -8.594,-6.951 -10.755,-8.236m-0.416,-0.811c-2.099,-7.134 -2.791,-13.177 -5.213,-22.004m5.584,22.718c-2.222,-7.852 -3.951,-15.454 -5.454,-22.621m-0.572,-0.002c6.509,2.603 13.056,2.424 19.52,4.798m-19.404,-4.276c7.605,1.807 15.161,2.933 20.534,3.811m0.155,0.724c0.789,1.066 3.888,2.931 10.382,9.875m-10.568,-10.414c3.781,3.977 7.43,7.19 10.382,9.808m-0.366,0.345m-0,0" style="fill:#fff;stroke:#fff;stroke-width:0.22px;"/></g></g></svg>';
    add_menu_page('Drawings', 'Excalidraw', 'manage_options', 'excalidraw', array($this, 'admin_menu_display'), 'data:image/svg+xml;base64,' . base64_encode($icon), 11);
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

    $message = get_transient($this->plugin_name . '_message');

    if ($message !== false) {
      delete_transient($this->plugin_name . '_message');
    }

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

  private function set_message($message, $type = 'success')
  {
    set_transient($this->plugin_name . '_message', ['type' => 'success', 'message' => $message]);
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
      $this->set_message(sprintf(__("Document '%s' was successfully deleted!"), $doc->title), 'success');
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
    );
  }
}
