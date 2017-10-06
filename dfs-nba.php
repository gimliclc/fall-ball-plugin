<?php
/**
 * Plugin Name: FTA+ DFS NBA
 * Plugin URI: http://fantasyteamadvice.com/
 * Description: Provides real time DFS NBA data to FTA+ users
 * Version: 1.0.0
 * Author: Kyle Johnson
 * Author URI: http://fantasyteamadvice.com/
 * License: Informal license
 */

defined( 'ABSPATH' ) or die( 'Error: Plugin cannot be called directly!' );

define('DFS_NBA_URL',plugin_dir_url( __FILE__ ) );
define('DFS_NBA_DIR',plugin_dir_path( __FILE__ ) );

register_activation_hook( __FILE__, array('DFS_NBA','plugin_activation'));
register_deactivation_hook( __FILE__, array('DFS_NBA','plugin_deactivation'));

require_once(DFS_NBA_DIR . 'class-dfs-nba.php');
require_once(DFS_NBA_DIR . 'class-dfs-nba-cron.php');

add_action('init', array('DFS_NBA', 'init'));
