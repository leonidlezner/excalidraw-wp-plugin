<?php

class Excalidraw_DocTable extends WP_List_Table
{
  private $plugin_name;
  private $plugin_version;
  private $delete_nonce;

  public function __construct($plugin_name, $plugin_version)
  {
    $this->plugin_name = $plugin_name;
    $this->plugin_version = $plugin_version;

    $this->delete_nonce = wp_create_nonce($this->plugin_name . '_delete');

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

    $table_name = Excalidraw::get_db_table_name();

    // Use this later for sorting etc.
    //$sql = $wpdb->prepare("SELECT * FROM $table_name");

    $sql = "SELECT * FROM $table_name";

    $results = $wpdb->get_results($sql);

    return $results;
  }

  private function render_item($item, $url)
  {
    $delete_url = admin_url(sprintf('?action=excalidraw_delete&docId=%s&_wpnonce=%s', $item->uuid, $this->delete_nonce));

    $actions = array(
      'edit'      => sprintf('<a href="%s">' . __('Edit', $this->plugin_name) . '</a>', $url),
      'delete'    => sprintf('<a href="%s" onclick="return showNotice.warn();">' . __('Delete', $this->plugin_name) . '</a>', $delete_url),
    );

    $actions = $this->row_actions($actions);

    require plugin_dir_path(dirname(__FILE__)) . 'admin/partials/excalidraw-admin-table-item.php';
  }

  public function column_default($item, $column_name)
  {
    $url = admin_url(sprintf('admin.php?page=excalidraw&view=edit&docId=%s', $item->uuid));
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

  function column_cb($item)
  {
    return sprintf(
      '<input type="checkbox" name="element[]" value="%s" />',
      $item->id
    );
  }

  public function prepare_items()
  {
    $columns = $this->get_columns();
    $hidden = array();
    $sortable = array();

    $this->_column_headers = array($columns, $hidden, $sortable);

    $this->items = $this->get_table_data();
  }

  /*   function get_bulk_actions()
  {
    $actions = array(
      'delete_all'    => __('Delete', $this->plugin_name),
    );

    return $actions;
  } */
}
