<?php

class Excalidraw_Activator
{
  private static function create_database_table()
  {
    global $wpdb;

    $table_name = Excalidraw::getDBTableName();

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
    	`id` INT NOT NULL AUTO_INCREMENT,
    	`uuid` TINYTEXT NOT NULL,
    	`source` LONGTEXT NOT NULL,
    	`files` LONGTEXT NOT NULL,
    	`full` LONGTEXT NOT NULL,
    	`full_dark` LONGTEXT NOT NULL,
    	`thumbnail` LONGTEXT NOT NULL,
    	`title` TEXT,
    	`description` TEXT,
      `author` INT NOT NULL,
    	`created` DATETIME NOT NULL,
    	`updated` DATETIME NOT NULL,
    	PRIMARY KEY (`id`)
    ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
  }

  public static function activate()
  {
    self::create_database_table();
    add_option(Excalidraw::getDBTableName() . '_db_version', Excalidraw::getDBVersion());
  }

  public static function upgrade()
  {
    self::create_database_table();
    update_option(Excalidraw::getDBTableName() . '_db_version', Excalidraw::getDBVersion());
  }
}
