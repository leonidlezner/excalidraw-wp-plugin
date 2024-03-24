<?php

class Excalidraw_i18n
{
  public function load_plugin_textdomain()
  {
    load_plugin_textdomain(
      'excalidraw',
      false,
      dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
    );
  }
}
