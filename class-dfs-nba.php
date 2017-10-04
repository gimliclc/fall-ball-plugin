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
}
