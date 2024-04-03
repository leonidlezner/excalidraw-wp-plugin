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
    $file = 'assets/css/excalidraw.css';
    $filePath = plugin_dir_path(__FILE__) . $file;
    $fileUrl = plugin_dir_url(__FILE__) . $file;
    $fileTime = filemtime($filePath);

    wp_enqueue_style($this->plugin_name, "$fileUrl", [], $fileTime);
  }

  public function enqueue_scripts()
  {
  }

  /* 
  public function render_shortcode($atts = [], $content = null, $tag = '')
  {
    if (!$atts || !key_exists('docid', $atts) || !$atts['docid']) {
      return "Please specifiy a correct docId!";
    }

    $docId = $atts['docid'];

    $doc = $this->get_document_from_db($docId);

    if ($doc) {
      return "<div class=\"excalidraw-doc\">" . $doc->full . "</div>";
    } else {
      return sprintf("Document '%s' not found", $docId);
    }
  }

  public function add_shortcodes()
  {
    add_shortcode('excalidraw', array($this, 'render_shortcode'));
  } */
}
