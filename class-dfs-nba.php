<?php

#Prevents hackers from attempting to directly access this file
defined( 'ABSPATH' ) or die( 'Error: Class-DFS-NBA cannot be called directly!' );

class DFS_NBA {
	#We only want the initialization methods to be run once, so initially set this boolean to false and then change it to true once that process has started
	#It defined as static so that this value is shared across every instance of this class.
	private static $initiated = false;

	#This method will run once wordpress has been initialized.  The code here will only run if it hasn't been processed yet.
  public static function init() {
		if(! self::$initiated) {
			self::$initiated = true;

			self::init_hooks();
			self::start_cron();
			self::init_ajax();
			self::init_js();
			self::init_shortcodes();
		}
	}

	#These are wordpress hooks that we want to use.
	#dfs_nba_cron is a custom action that points to the "DFS_NBA_Cron" class in class-dfs-nba-cron.php.  It will run the method "load_stats".
	#wp_head is a wordpress defined action and will run when the <head> tag is being created.  In our case we want to insert some custom JS variables
	#admin_head is pretty much the same thing as above except for admin pages
	#wp_enqueue_scripts will add css files to include in the header
  private static function init_hooks() {
		add_action('dfs_nba_cron', array('DFS_NBA_Cron', 'load_stats'));
		add_action('wp_head',array('DFS_NBA','dfs_nba_ajaxurl'));
		add_action('wp_head',array('DFS_NBA','dfs_nba_url'));
		add_action('admin_head',array('DFS_NBA','dfs_nba_url'));
		add_action( 'wp_enqueue_scripts', array('DFS_NBA','init_css') );
  }

	#Checks to see if a cron job has already been assigned, if not it will set the next one with the supplied interval
	private static function start_cron() {
		if(!wp_next_scheduled('dfs_nba_cron')) {
			wp_schedule_event(time(), 'hourly', 'dfs_nba_cron');
		}
	}

	#Stops the cron job from running in the future
	private static function stop_cron() {
		wp_clear_scheduled_hook('dfs_nba_cron');
	}

	#Defines an ajax call that could be refenced through javascript.
	#The name of the action is defined after "wp_ajax" or "wp_ajax_nopriv".  In our case it is "dfs_nba".
	#It will send ajax requests for the "dfs_nba" action to the method "dfs_nba_ajax_request."
	private static function init_ajax() {
		add_action( 'wp_ajax_nopriv_dfs_nba', array('DFS_NBA','dfs_nba_ajax_request'));
		add_action( 'wp_ajax_dfs_nba',array('DFS_NBA','dfs_nba_ajax_request'));
	}

	#Processes the ajax request for the action "dfs_nba" defined above.
	#It will retrieve the transient "dfs_nba_stats" which is a temporarily cached data created from the cron job
	#This cached data could also further processed if necessary
	public static function dfs_nba_ajax_request(){
		$result_arr =  get_transient('dfs_nba_stats');
		if($result_arr === false){
			$result_arr = array();
		}
		$dvp_arr = get_transient('dfs_nba_dvp');
		if($dvp_arr === false){
			$dvp_arr = array();
		}

		#the echo command will write to the current stream.  In our case echo will output our data
		echo json_encode($result_arr);

		#once the output has been written, you could then kill the process
		wp_die();
	}

	#Tell wordpress to include our custom javascript file.  The url for the javascript file references the DFS_NBA_URL defined
	#in the configuration file
	#jQuery is also listed as a dependency for our javascript file.
	private static function init_js() {
                wp_register_script('DFS_NBA_MAIN',DFS_NBA_URL.'js/dfs-nba.js',array('jquery'), false, true);
                wp_register_script('SORTABLE',DFS_NBA_URL.'js/sorttable.js','', false, false);
                wp_enqueue_script('DFS_NBA_MAIN');
                wp_enqueue_script('SORTABLE');
  }

	#Our plugin will be included on a page through a wordpress shortcode.
	#If you place [dfs-nba] onto a page, it will include our plugin
	#When that shortcode is called, it will then be processed by the "dfs_nba_shortcode" method
  private static function init_shortcodes() {
		add_shortcode('dfs-nba',array('DFS_NBA','dfs_nba_shortcode'));
  }

	#Processes the html for the shortcode.  In our case we are just outputting a simple container to be filled in by javascript
	public static function dfs_nba_shortcode($atts) {
		return '<button class="fanduel-button">Fanduel</button>' . '<button class="draftkings-button">Draftkings</button>' . '<button class="yahoo-button">Yahoo</button>' . '<div id="dfs-nba-table"><h2>Projections Loading</h2></div>';
	}

	#This will let our javascript know where to make a ajax call through wordpress.  We would post our ajax action to get a response
	public static function dfs_nba_ajaxurl() {
		$html = '<script type="text/javascript">';
		$html .= 'var ajaxurl = "' . admin_url( 'admin-ajax.php' ) . '";';
		$html .= '</script>';

		echo $html;
	}

	#Creates a javascript file that will let the client know the url for this plugin
	public static function dfs_nba_url() {
                $user = wp_get_current_user();
                $allowed_roles = array('editor', 'administrator', 'author');
                $user_admin_roles_arr = array_intersect($allowed_roles, $user->roles);
                $is_plugin_admin = !empty($user_admin_roles_arr) ? 'true' : 'false';

                $html = '<script type="text/javascript">';
                $html .= 'var dfsNbaPluginUrl = "' . DFS_NBA_URL . '";';
                $html .= 'var dfsIsPluginAdmin = ' . $is_plugin_admin . ';';
                $html .= '</script>';

                echo $html;
        }

	#Adds css files to be included in pages that reference this plugin
	public static function init_css() {
		wp_register_style('DFS_NBA_MAIN',DFS_NBA_URL.'css/dfs-nba.css');
		wp_enqueue_style('DFS_NBA_MAIN');
	}

	#Method to be run when the plugin in activated.  We will want to start our cron job so that the transient variable is filled
	public static function plugin_activation() {
  	error_log("DFS NBA plugin activated!", 0);
  	self::start_cron();
	}

	#Tears down the plugin when it is deactived.  The cron job will be stopped and the transient deleted
	public static function plugin_deactivation() {
  	error_log("DFS NBA plugin deactivated!", 0);
  	self::stop_cron();
  	delete_transient('dfs_nba_stats');
	}

}
