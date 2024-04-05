<?php
/*
 * Plugin Name:     Excalidraw
 * Description:     Plugin for editing and displaying Excalidraw diagrams
 * Version:         0.0.1
 * Author:          Leonid Lezner
 * License:         GPLv2
 */

if (!defined('ABSPATH')) {
    exit;
}

define('EXCALIDRAW_VERSION', '0.0.2');

define('EXCALIDRAW_ROOT_URL', plugin_dir_url(__FILE__));

function wp_excalidraw_activate_plugin()
{
    require_once plugin_dir_path(__FILE__) . 'includes/class-excalidraw-activator.php';
    Excalidraw_Activator::activate();
}

function wp_excalidraw_deactivate_plugin()
{
    require_once plugin_dir_path(__FILE__) . 'includes/class-excalidraw-deactivator.php';
    Excalidraw_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'wp_excalidraw_activate_plugin');

register_deactivation_hook(__FILE__, 'wp_excalidraw_deactivate_plugin');

require plugin_dir_path(__FILE__) . 'includes/class-excalidraw.php';

function run_excalidraw()
{
    $plugin = new Excalidraw();
    $plugin->run();
}

run_excalidraw();
