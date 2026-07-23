<?php
namespace WGL_Extensions;

defined( 'ABSPATH' ) || exit;

use WGL_Framework;

if ( ! class_exists( 'WGL_Framework_Global_Variables' ) ) {
    /**
     * Motto Global Variables
     *
     *
     * @package motto\core\class
     * @author WebGeniusLab <webgeniuslab@gmail.com>
     * @since 1.0.0
     */
    class WGL_Framework_Global_Variables
    {
        protected static $theme_slug;
        protected static $theme_version;
        protected static $primary_color;
        protected static $secondary_color;
        protected static $tertiary_color;
        protected static $main_font_color;
        protected static $content_secondary_color;
        protected static $h_font_color;
        protected static $btn_color_idle;
        protected static $btn_bg_idle;
        protected static $btn_border_idle;
        protected static $btn_color_hover;
        protected static $btn_bg_hover;
        protected static $btn_border_hover;
        protected static $comments_form_bg;
        protected static $cursor_point_color;

        function __construct()
        {
            if ( class_exists( '\WGL_Framework' ) ) {
                $this->set_variables();
            }
        }

        protected function set_variables()
        {
            // General
            self::$theme_slug = str_replace( '-child', '', wp_get_theme()->get( 'TextDomain' ) );
            self::$theme_version = wp_get_theme()->get( 'Version' ) ?? false;

            // Colors
            self::$primary_color = esc_attr( WGL_Framework::get_option( 'theme-primary-color' ) );
            self::$secondary_color = esc_attr( WGL_Framework::get_option( 'theme-secondary-color' ) );
            self::$tertiary_color = esc_attr( WGL_Framework::get_option( 'theme-tertiary-color' ) );
            self::$main_font_color = esc_attr( WGL_Framework::get_option( 'theme-content-color' ) );
            self::$content_secondary_color = esc_attr( WGL_Framework::get_option( 'theme-content-secondary-color' ) );
            self::$h_font_color = esc_attr( WGL_Framework::get_option( 'theme-headings-color' ) );
            self::$btn_color_idle = esc_attr( WGL_Framework::get_option( 'button-color-idle' ) );
            self::$btn_bg_idle = esc_attr( WGL_Framework::get_option( 'button-bg-idle' ) );
            self::$btn_border_idle = esc_attr( WGL_Framework::get_option( 'button-border-idle' ) );
            self::$btn_color_hover = esc_attr( WGL_Framework::get_option( 'button-color-hover' ) );
            self::$btn_bg_hover = esc_attr( WGL_Framework::get_option( 'button-bg-hover' ) );
            self::$btn_border_hover = esc_attr( WGL_Framework::get_option( 'button-border-hover' ) );
            self::$comments_form_bg = esc_attr( WGL_Framework::get_option( 'form-bg-color' ) );
            self::$cursor_point_color = isset(WGL_Framework::get_option('cursor_color')['rgba']) ? WGL_Framework::get_option('cursor_color')['rgba'] : '';
        }

        public static function get_theme_slug()
        {
            return self::$theme_slug;
        }

        public static function get_theme_version()
        {
            return self::$theme_version;
        }

        public static function get_primary_color( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$primary_color, $opacity );
            }

            return self::$primary_color;
        }

        public static function get_secondary_color( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$secondary_color, $opacity );
            }

            return self::$secondary_color;
        }

        public static function get_tertiary_color( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$tertiary_color, $opacity );
            }

            return self::$tertiary_color;
        }

        public static function get_main_font_color( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$h_font_color, $opacity );
            }

            return self::$main_font_color;
        }

        public static function get_content_secondary_color( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$content_secondary_color, $opacity );
            }

            return self::$content_secondary_color;
        }

        public static function get_h_font_color( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$h_font_color, $opacity );
            }

            return self::$h_font_color;
        }

        public static function get_btn_color_idle( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$btn_color_idle, $opacity );
            }

            return self::$btn_color_idle;
        }

        public static function get_btn_bg_idle( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$btn_bg_idle, $opacity );
            }

            return self::$btn_bg_idle;
        }

        public static function get_btn_border_idle( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$btn_border_idle, $opacity );
            }

            return self::$btn_border_idle;
        }

        public static function get_btn_color_hover( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$btn_color_hover, $opacity );
            }

            return self::$btn_color_hover;
        }

        public static function get_btn_bg_hover( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$btn_bg_hover, $opacity );
            }

            return self::$btn_bg_hover;
        }

        public static function get_btn_border_hover( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$btn_border_hover, $opacity );
            }

            return self::$btn_border_hover;
        }

        public static function get_comments_form_bg( $opacity = null )
        {
            if ( is_numeric( $opacity ) ) {
                return self::get_opaqued_rgba_color( self::$comments_form_bg, $opacity );
            }

            return self::$comments_form_bg;
        }

        public static function get_cursor_point_color()
        {
            return self::$cursor_point_color;
        }

        protected static function get_opaqued_rgba_color( String $color, $opacity )
        {
            if ( WGL_Framework::is_valid_hex( $color ) ) {
                return 'rgba( ' . WGL_Framework::hex_to_rgb( $color ) . ',' . $opacity . ' )';
            }

            if ( WGL_Framework::is_valid_rgb( $color ) ) {
                $rgb = WGL_Framework::get_bytes_array_from_rgb( $color );

                return 'rgba( ' . implode( ', ', $rgb ) . ', ' . $opacity . ' )';
            }

            if ( WGL_Framework::is_valid_rgba( $color ) ) {
                $rgba = WGL_Framework::get_bytes_array_from_rgba( $color );
                unset( $rgba[ 3 ] );

                return 'rgba( ' . implode( ', ', $rgba) . ', ' . $opacity . ' )';
            }
        }
    }

    new WGL_Framework_Global_Variables();
}
