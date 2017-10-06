<?php

defined( 'ABSPATH' ) or die( 'Error: Class-DFS-NBA cannot be called directly!' );

class DFS_NBA {
	private static $initiated = false;

  public static function init() {
		if(! self::$initiated) {
			self::init_hooks();
			self::start_cron();
			self::init_ajax();
			self::init_js();
			self::init_shortcodes();
		}
	}

  private static function init_hooks() {
  self::$initiated = true;

  }

  private static function init_ajax() {
  self::$initiated = true;

  }

  private static function init_js() {
  self::$initiated = true;

  }

  private static function init_shortcodes() {
  self::$initiated = true;

  }

  private static function start_cron() {
  if(!wp_next_scheduled('dfs_nba_cron')) {
    wp_schedule_event(time(), 'daily', 'dfs_nba_cron');
    }
  }

private static function stop_cron() {
  wp_clear_scheduled_hook('dfs_nba_cron');
  }

  public static function plugin_activation() {
  error_log("DFS NBA plugin activated!", 0);
  self::start_cron();
  }

public static function plugin_deactivation() {
  error_log("DFS NBA plugin deactivated!", 0);
  self::stop_cron();
  }
}
