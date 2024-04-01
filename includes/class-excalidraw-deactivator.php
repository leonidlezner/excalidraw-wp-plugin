<?php

class Excalidraw_Deactivator
{
  private static function drop_database_table()
  {
    global $wpdb;

    $table_name = Excalidraw::get_db_table_name();

    $wpdb->query("DROP TABLE IF EXISTS $table_name");

    delete_option($table_name . '_db_version');
  }

  public static function deactivate()
  {
    self::drop_database_table();
  }
}
