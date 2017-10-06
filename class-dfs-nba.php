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

			self::$initiated = true;
		}
	}

  private static function init_hooks() {
		add_action('dfs_nba_cron', array('DFS_NBA_Cron', 'load_stats'));
		add_action('wp_head',array('DFS_NBA','dfs_nba_ajaxurl'));
		add_action('wp_head',array('DFS_NBA','dfs_nba_url'));
		add_action('admin_head',array('DFS_NBA','dfs_nba_url'));
		add_action( 'wp_enqueue_scripts', array('DFS_NBA','init_css') );
  }

	private static function start_cron() {
		if(!wp_next_scheduled('dfs_nba_cron')) {
			wp_schedule_event(time(), 'hourly', 'dfs_nba_cron');
		}
	}

	private static function stop_cron() {
		wp_clear_scheduled_hook('dfs_nba_cron');
	}

	private static function init_ajax() {
		add_action( 'wp_ajax_nopriv_dfs_nba', array('DFS_NBA','dfs_nba_ajax_request'));
		add_action( 'wp_ajax_dfs_nba',array('DFS_NBA','dfs_nba_ajax_request'));
	}

	public static function dfs_nba_ajax_request(){
		$result_arr =  get_transient('dfs_nba_stats');
		if($result_arr === false){
			$result_arr = array();
		}

		echo json_encode($result_arr);
		wp_die();
	}

  private static function init_js() {
		wp_register_script('DFS_NBA_MAIN',DFS_MAIN_URL.'js/dfs-nba.js',array('jquery'), false, true);
		wp_enqueue_script('DFS_NBA_MAIN');
  }

  private static function init_shortcodes() {
		add_shortcode('dfs-nba',array('DFS_NBA','dfs_nba_shortcode'));
  }

	public static function dfs_nba_shortcode($atts) {
		return '<table id="dfs-nba-table" style="display:none;" class="dfs-nba-table"><tr><td>Empty DFS NBA Table</td></tr></table>';
	}

	public static function dfs_nba_ajaxurl() {
		$html = '<script type="text/javascript">';
		$html .= 'var ajaxurl = "' . admin_url( 'admin-ajax.php' ) . '";';
		$html .= '</script>';

		echo $html;
	}

	public static function dfs_nba_url() {
		$html = '<script type="text/javascript">';
		$html .= 'var dfsNbaPluginUrl = "' . DFS_NBA_URL . '";';
		$html .= '</script>';

		echo $html;
	}

	public static function init_css() {
		wp_register_style('DFS_NBA_MAIN',DFS_NBA_URL.'css/dfs-nba.css');
		wp_enqueue_style('DFS_NBA_MAIN');
	}

  public static function plugin_activation() {
  	error_log("DFS NBA plugin activated!", 0);
  	self::start_cron();
	}

	public static function plugin_deactivation() {
  	error_log("DFS NBA plugin deactivated!", 0);
  	self::stop_cron();
  	delete_transient('');
	}
}
