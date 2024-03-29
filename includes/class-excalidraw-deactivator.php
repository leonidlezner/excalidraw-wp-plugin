<?php

class Excalidraw_Deactivator
{
  private static function drop_database_table()
  {
    global $wpdb;
    $table_name = Excalidraw::getDBTableName();
    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }

  public static function deactivate()
  {
    self::drop_database_table();
  }
}
