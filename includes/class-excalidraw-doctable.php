<?php

class Excalidraw_DocTable extends WP_List_Table
{
  private $plugin_name;
  private $plugin_version;

  public function __construct($plugin_name, $plugin_version)
  {
    $this->plugin_name = $plugin_name;
    $this->plugin_version = $plugin_version;

    parent::__construct();
  }

  public function get_columns()
  {
    return [
      //'cb' => '<input type="checkbox" />',
      'document' => __('Document', $this->plugin_name),
      'last_updated' => __('Last modified', $this->plugin_name),
    ];
  }

  public function get_table_data()
  {
    global $wpdb;

    $table_name = Excalidraw::getDBTableName();

    //$sql = $wpdb->prepare("SELECT * FROM $table_name");

    $sql = "SELECT * FROM $table_name";

    $results = $wpdb->get_results($sql);

    return $results;
  }

  private function render_item($item, $url)
  {
    require plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-table-item.php';
  }

  public function column_default($item, $column_name)
  {
    $url = admin_url('admin.php?page=excalidraw&view=edit&docId=' . $item->uuid);
    $title = $item->title ? $item->title : $item->uuid;

    switch ($column_name) {
      case 'title':
        return sprintf('<a href="%s">%s</a>', $url, $title);

      case 'document':
        return $this->render_item($item, $url);

      case 'last_updated':
        return $item->updated;

      default:
        $column_name;
    }
  }

  public function prepare_items()
  {
    $columns = $this->get_columns();
    $hidden = array();
    $sortable = array();

    $this->_column_headers = array($columns, $hidden, $sortable);

    $this->items = $this->get_table_data();
  }
}
