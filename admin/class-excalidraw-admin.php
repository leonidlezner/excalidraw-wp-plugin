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

  public function enqueue_styles()
  {
  }

  public function enqueue_scripts()
  {
  }

  public function admin_menu()
  {
    add_menu_page('Excalidraw', 'Excalidraw', 'manage_options', 'excalidraw', array($this, 'admin_menu_display'), '', 11);
  }

  public function admin_menu_display()
  {
    require_once plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-display.php';
  }
}
