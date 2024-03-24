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
      if (is_array(wp_remote_get('http://localhost:5173/'))) { // TODO: change this check so something more performant
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
      // Add this script according to the Vite docs: https://vitejs.dev/guide/backend-integration.html
      $script[] = '<script type="module">';
      $script[] = '  import RefreshRuntime from \'http://localhost:5173/@react-refresh\'';
      $script[] = '  RefreshRuntime.injectIntoGlobalHook(window)';
      $script[] = '  window.$RefreshReg$ = () => {}';
      $script[] = '  window.$RefreshSig$ = () => (type) => type';
      $script[] = '  window.__vite_plugin_react_preamble_installed__ = true';
      $script[] = '</script>';
      $script[] = '<script type="module" src="' . esc_url($src) . '" defer></script>';
      return join("\n", $script);
    }

    return $tag;
  }

  public function admin_menu()
  {
    add_menu_page('Drawings', 'Excalidraw', 'manage_options', 'excalidraw', array($this, 'admin_menu_display'), '', 11);
  }

  public function admin_menu_display()
  {
    if (self::isView('edit')) {
      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-edit.php';
    } else if (self::isView('new')) {
      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-new.php';
    } else {
      require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-list.php';
    }
  }
}
