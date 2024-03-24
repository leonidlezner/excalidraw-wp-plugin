<?php

class Excalidraw_Activator
{
  private static function create_database_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'excalidraw';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
    	`id` INT NOT NULL AUTO_INCREMENT,
    	`uuid` TINYTEXT NOT NULL,
    	`source` LONGTEXT NOT NULL,
    	`full` LONGTEXT NOT NULL,
    	`thumbnail` LONGTEXT NOT NULL,
    	`title` TEXT,
    	`description` TEXT,
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
  }
}
