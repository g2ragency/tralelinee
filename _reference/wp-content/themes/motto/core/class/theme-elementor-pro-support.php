<?php

defined( 'ABSPATH' ) || exit;

use ElementorPro\{
    Modules\ThemeBuilder\Classes\Locations_Manager,
    Modules\ThemeBuilder\Module
};

if ( ! class_exists( 'Motto_Theme_ElementorPro_Support' ) ) {
    /**
     * Elementor Pro Support
     *
     *
     * @package motto\core\class
     * @author WebGeniusLab <webgeniuslab@gmail.com>
     * @since 1.0.0
     */
    class Motto_Theme_ElementorPro_Support
    {
        private static $instance;

        public static function get_instance()
        {
            if ( is_null( self::$instance ) ) {
                self::$instance = new self();
            }

            return self::$instance;
        }

        public function __construct()
        {
            add_action( 'init', [ $this, 'motto_init_template' ] );
        }

        /**
         * @param Locations_Manager $manager
         */
        public function register_locations( $manager )
        {
            $manager->register_core_location( 'header' );
            $manager->register_core_location( 'footer' );
        }

        public function do_header()
        {
            $did_location = Module::instance()->get_locations_manager()->do_location( 'header' );
            if ( $did_location ) {
                add_filter( 'wgl/header/enable', '__return_false' );
            }
        }

        public function do_footer()
        {
            $did_location = Module::instance()->get_locations_manager()->do_location( 'footer' );
            if ( $did_location ) {
                add_filter( 'wgl/footer/enable', '__return_false' );
            }
        }

        public function motto_init_template()
        {
            add_action( 'elementor/theme/register_locations', [ $this, 'register_locations' ] );

            add_action( 'wgl/elementor_pro/header', [ $this, 'do_header' ], 0 );
            add_action( 'wgl/elementor_pro/footer', [ $this, 'do_footer' ], 0 );
        }
    }

    new Motto_Theme_ElementorPro_Support();
}
