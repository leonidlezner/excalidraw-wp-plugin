<?php

class Excalidraw
{
  protected $loader;
  protected static $plugin_name = 'excalidraw';
  protected static $version = EXCALIDRAW_VERSION;
  protected static $db_version = '2';

  public function __construct()
  {
    $this->load_dependencies();
    $this->set_locale();
    $this->define_admin_hooks();
    $this->define_public_hooks();
  }

  public static function get_db_table_name()
  {
    global $wpdb;
    return $wpdb->prefix . self::$plugin_name;
  }

  public static function get_db_version()
  {
    return self::$db_version;
  }

  public function check_and_upgrade_db()
  {
    $currentVersion = get_option(self::get_db_table_name() . '_db_version', 1);

    if ($currentVersion && ($currentVersion !== self::get_db_version())) {
      require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-excalidraw-activator.php';
      Excalidraw_Activator::upgrade();
    }
  }

  public static function get_document_from_db($docId)
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

  public static function get_public_assets_url()
  {
    return EXCALIDRAW_ROOT_URL . 'public/assets/';
  }

  private function load_dependencies()
  {
    require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-excalidraw-loader.php';

    require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-excalidraw-i18n.php';

    require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-excalidraw-admin.php';

    require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-excalidraw-public.php';

    $this->loader = new Excalidraw_Loader();
  }

  private function set_locale()
  {
    $plugin_i18n = new Excalidraw_i18n($this->get_plugin_name());
    $this->loader->add_action('plugins_loaded', $plugin_i18n, 'load_plugin_textdomain');
  }

  private function define_admin_hooks()
  {
    $plugin_admin = new Excalidraw_Admin($this->get_plugin_name(), $this->get_version());
    $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
    $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');
    $this->loader->add_action('script_loader_tag', $plugin_admin, 'script_loader_tag', 10, 3);
    $this->loader->add_action('admin_menu', $plugin_admin, 'admin_menu');
    $this->loader->add_action('wp_ajax_excalidraw_save', $plugin_admin, 'admin_ajax_handler_save');
    $this->loader->add_action('init', $plugin_admin, 'register_block');
    $this->loader->add_action('plugins_loaded', $this, 'check_and_upgrade_db');
    $this->loader->add_action('admin_post_excalidraw_delete', $plugin_admin, 'admin_handler_delete');
    $this->loader->add_action('rest_api_init', $plugin_admin, 'admin_register_rest_api');
  }

  private function define_public_hooks()
  {
    $plugin_public = new Excalidraw_Public($this->get_plugin_name(), $this->get_version());
    $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_styles');
    $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_scripts');
  }

  public function run()
  {
    $this->loader->run();
  }

  public function get_plugin_name()
  {
    return self::$plugin_name;
  }

  public function get_loader()
  {
    return $this->loader;
  }

  public function get_version()
  {
    return self::$version;
  }
}
