<?php

class Excalidraw
{
  protected $loader;
  protected $plugin_name;
  protected $version;

  public function __construct()
  {
    $this->version = EXCALIDRAW_VERSION;
    $this->plugin_name = 'excalidraw';

    $this->load_dependencies();
    $this->set_locale();
    $this->define_admin_hooks();
    $this->define_public_hooks();
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
    $plugin_i18n = new Excalidraw_i18n();
    $this->loader->add_action('plugins_loaded', $plugin_i18n, 'load_plugin_textdomain');
  }

  private function define_admin_hooks()
  {
    $plugin_admin = new Excalidraw_Admin($this->get_plugin_name(), $this->get_version());
    $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
    $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');
    $this->loader->add_action('admin_menu', $plugin_admin, 'admin_menu');
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
    return $this->plugin_name;
  }

  public function get_loader()
  {
    return $this->loader;
  }

  public function get_version()
  {
    return $this->version;
  }
}
