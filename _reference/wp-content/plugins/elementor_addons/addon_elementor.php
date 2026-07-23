<?php

/*

	Plugin Name: TLL Plugin

	Plugin URI: 

	Author:  Veronika Udod

	Version: 1.0.0

	Description: elementor plugin developed for addon.it.

	License: GNU General Public License v2 or later

	License URI: http://www.gnu.org/licenses/gpl-2.0.html


	Domain path: /languages/

*/

	if(!defined('ABSPATH')){

		die('Direct access not allowed');

	}

final class Elementor_Addon_Widgets {

	const VERSION = '1.0.0';

	const MINIMUM_ELEMENTOR_VERSION = '2.0.0';

	const MINIMUM_PHP_VERSION = '7.0';

	private static $_instance = null;

	public static function instance() {

		if ( is_null( self::$_instance ) ) {

			self::$_instance = new self();

		}

		return self::$_instance;

	}

	public function __construct() {

		add_action( 'plugins_loaded', [ $this, 'on_plugins_loaded' ] );

	}

	public function i18n() {

		load_plugin_textdomain( 'vinoplugin' );

	}


	public function on_plugins_loaded() {

		if ( $this->is_compatible() ) {

			add_action( 'elementor/init', [ $this, 'init' ] );

		}
		
	}
	
	public function is_compatible() {

		// Check if Elementor installed and activated

		if ( ! did_action( 'elementor/loaded' ) ) {

			add_action( 'admin_notices', [ $this, 'admin_notice_missing_main_plugin' ] );

			return false;

		}

		// Check for required Elementor version

		if ( ! version_compare( ELEMENTOR_VERSION, self::MINIMUM_ELEMENTOR_VERSION, '>=' ) ) {

			add_action( 'admin_notices', [ $this, 'admin_notice_minimum_elementor_version' ] );

			return false;

		}

		// Check for required PHP version

		if ( version_compare( PHP_VERSION, self::MINIMUM_PHP_VERSION, '<' ) ) {

			add_action( 'admin_notices', [ $this, 'admin_notice_minimum_php_version' ] );

			return false;

		}

		return true;

	}

	public function init() {

		$this->i18n();

		// Add Plugin actions

		add_action( 'elementor/widgets/widgets_registered', [ $this, 'init_widgets' ] );

		add_action( 'elementor/controls/controls_registered', [ $this, 'init_controls' ] );

	}

	public function init_widgets() {
		
		//HOMEPAGE
		require_once( __DIR__ . '/widgets/expand-logo/expand-logo.php' );
		require_once( __DIR__ . '/widgets/expand-accordion/expand-accordion.php' );
		require_once( __DIR__ . '/widgets/expand-digit-accordian/expand-digit-accordian.php' );
		require_once( __DIR__ . '/widgets/slides-horizontal/slides-horizontal.php' );
		require_once( __DIR__ . '/widgets/swiper-partners/swiper-partners.php' );

		
		
		//HOMEPAGE
		\Elementor\Plugin::instance()->widgets_manager->register_widget_type( new \Elementor_Widget_Expand_Logo() );
		\Elementor\Plugin::instance()->widgets_manager->register_widget_type( new \Elementor_Widget_Expand_Accordion() );
		\Elementor\Plugin::instance()->widgets_manager->register_widget_type( new \Elementor_Widget_Expand_Digit_Accordian() );
		\Elementor\Plugin::instance()->widgets_manager->register_widget_type( new \Elementor_Widget_Slides_Horizontal() );
		\Elementor\Plugin::instance()->widgets_manager->register_widget_type( new \Elementor_Widget_Swiper_Partners() );

		
	}

	public function init_controls() {

		// Include Control files

		//require_once( __DIR__ . '/controls/test-control.php' );


		// Register control

		//\Elementor\Plugin::$instance->controls_manager->register_control( 'control-type-', new \Test_Control() );

	}

	public function admin_notice_missing_main_plugin() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(

			/* translators: 1: Plugin name 2: Elementor */

			esc_html__( '"%1$s" requires "%2$s" to be installed and activated.', 'eleplugins' ),

			'<strong>' . esc_html__( 'Elementor Addon', 'eleplugins' ) . '</strong>',

			'<strong>' . esc_html__( 'Elementor', 'eleplugins' ) . '</strong>'

		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}

	public function admin_notice_minimum_elementor_version() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(

			/* translators: 1: Plugin name 2: Elementor 3: Required Elementor version */

			esc_html__( '"%1$s" requires "%2$s" version %3$s or greater.', 'eleplugins' ),

			'<strong>' . esc_html__( 'Elementor Addon', 'eleplugins' ) . '</strong>',

			'<strong>' . esc_html__( 'Elementor', 'eleplugins' ) . '</strong>',

			 self::MINIMUM_ELEMENTOR_VERSION

		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}

	public function admin_notice_minimum_php_version() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(

			/* translators: 1: Plugin name 2: PHP 3: Required PHP version */

			esc_html__( '"%1$s" requires "%2$s" version %3$s or greater.', 'eleplugins' ),

			'<strong>' . esc_html__( 'Ele Plugins', 'eleplugins' ) . '</strong>',

			'<strong>' . esc_html__( 'PHP', 'eleplugins' ) . '</strong>',

			 self::MINIMUM_PHP_VERSION

		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}
}
Elementor_Addon_Widgets::instance();

?>