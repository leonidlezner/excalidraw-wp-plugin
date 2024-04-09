<?php

class Excalidraw_i18n
{
  private $domain;

  public function __construct($domain)
  {
    $this->domain = $domain;
  }

  public function load_plugin_textdomain()
  {
    load_plugin_textdomain(
      $this->domain,
      false,
      dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
    );
  }
}
