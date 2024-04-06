<?php

class Excalidraw_Public
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
}
