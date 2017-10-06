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

#This prevents hackers from trying to directly access this file
defined( 'ABSPATH' ) or die( 'Error: Plugin cannot be called directly!' );

#These next two lines will set the plugin's url and local directory to variables that can be accessed in the collator_get_error_code
#The url can be accessed by referencing DFS_NBA_URL while the plugin's directory can be access through DFS_NBA_DIR
define('DFS_NBA_URL',plugin_dir_url( __FILE__ ) );
define('DFS_NBA_DIR',plugin_dir_path( __FILE__ ) );

#Assign methods to be run when the plugin is activated or deactived.
#"DFS_NBA" refers to the class name defined in class-dfs-nba.php while "plugin_activation" refers to the method name in that class
register_activation_hook( __FILE__, array('DFS_NBA','plugin_activation'));
register_deactivation_hook( __FILE__, array('DFS_NBA','plugin_deactivation'));

#Tells PHP which files to include with this plugin.  These files will contain our other php classes
require_once(DFS_NBA_DIR . 'class-dfs-nba.php');
require_once(DFS_NBA_DIR . 'class-dfs-nba-cron.php');

#Assigns a method to run when wordpress has been initialized.  "DFS_NBA" is the class defined in class-dfs-nba.php while "init" is the method
add_action('init', array('DFS_NBA', 'init'));
