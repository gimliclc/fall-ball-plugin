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



register_activation_hook( __FILE__, array('dfs_nba','plugin_activation'));
register_deactivation_hook( __FILE__, array('dfs_nba','plugin_deactivation'));

require_once(DFS_NBA_DIR . 'class-dfs-nba.php');
require_once(DFS_NBA_DIR . 'class-dfs-nba-cron.php');

add_action('init', array('dfs_nba', 'init'));
