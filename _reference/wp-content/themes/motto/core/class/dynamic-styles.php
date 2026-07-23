<?php

defined( 'ABSPATH' ) || exit;

use WGL_Extensions\Includes\WGL_Elementor_Helper;
use WGL_Extensions\WGL_Framework_Global_Variables;

/**
 * Dynamic Styles
 *
 *
 * @package motto\core\class
 * @author WebGeniusLab <webgeniuslab@gmail.com>
 * @since 1.0.0
 */
class WGL_Framework_Dynamic_Styles
{
    protected static $instance;

    private $template_directory_uri;
    private $use_minified;
    private $enqueued_stylesheets = [];
    private $header_page_id;
    private $header_building_tool;
    private $gradient_enabled;

    public function __construct()
    {
        // do nothing.
    }

    public static function instance()
    {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function construct()
    {
        $this->template_directory_uri = get_template_directory_uri();
        $this->use_minified = WGL_Framework::get_option('use_minified') ? '.min' : '';
        $this->header_building_tool = WGL_Framework::get_option('header_building_tool');
        $this->gradient_enabled = WGL_Framework::get_mb_option('use-gradient', 'mb_page_colors_switch', 'custom');

        $this->enqueue_styles_and_scripts();
        $this->add_body_classes();
    }

    public function enqueue_styles_and_scripts()
    {
        add_action( 'wp_enqueue_scripts', [ $this, 'frontend_stylesheets' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'frontend_scripts' ] );

        //* Elementor Compatibility
        add_action( 'wp_enqueue_scripts', [ $this, 'get_elementor_css_theme_builder' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'elementor_column_fix' ] );

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_stylesheets' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'admin_scripts' ] );
    }

    public function get_elementor_css_theme_builder()
    {
        $current_post_id = get_the_ID();
        $css_files = [];

        $locations[] = $this->get_elementor_css_cache_header();
        $locations[] = $this->get_elementor_css_cache_header_sticky();
        $locations[] = $this->get_elementor_css_cache_footer();
        $locations[] = $this->get_elementor_css_cache_side_panel();

        foreach ($locations as $location) {
            //* Don't enqueue current post here (let the preview/frontend components to handle it)
            if ($location && $current_post_id !== $location) {
                $css_file = new \Elementor\Core\Files\CSS\Post($location);
                $css_files[] = $css_file;
            }
        }

        if (!empty($css_files)) {
            \Elementor\Plugin::$instance->frontend->enqueue_styles();
            foreach ($css_files as $css_file) {
                $css_file->enqueue();
            }
        }
    }

    public function get_elementor_css_cache_header()
    {
        if (
            ! apply_filters( 'wgl/header/enable', true )
            || ! class_exists( '\Elementor\Core\Files\CSS\Post' )
        ) {
            // Bailtout.
            return;
        }

        if (
            $this->RWMB_is_active()
            && 'custom' === rwmb_meta( 'mb_customize_header_layout' )
            && 'default' !== rwmb_meta( 'mb_header_content_type' )
        ) {
            $this->header_building_tool = 'elementor';
            $this->header_page_id = rwmb_meta( 'mb_customize_header' );
        } else {
            $this->header_page_id = WGL_Framework::get_option( 'header_page_select' );
        }

        if ( 'elementor' === $this->header_building_tool ) {
            return $this->multi_language_support( $this->header_page_id, 'header' );
        }
    }

    public function get_elementor_css_cache_header_sticky()
    {
        if (
            ! apply_filters( 'wgl/header/enable', true )
            || 'elementor' !== $this->header_building_tool
            || ! class_exists( '\Elementor\Core\Files\CSS\Post' )
        ) {
            // Bailtout.
            return;
        }

        $header_sticky_page_id = '';

        if (
            $this->RWMB_is_active()
            && 'custom' === rwmb_meta( 'mb_customize_header_layout' )
            && 'default' !== rwmb_meta( 'mb_sticky_header_content_type' )
        ) {
            $header_sticky_page_id = rwmb_meta( 'mb_customize_sticky_header' );
        } elseif ( WGL_Framework::get_option( 'header_sticky' ) ) {
            $header_sticky_page_id = WGL_Framework::get_option( 'header_sticky_page_select' );
        }

        return $this->multi_language_support( $header_sticky_page_id, 'header' );
    }

    public function get_elementor_css_cache_footer()
    {
        $footer = apply_filters( 'wgl/footer/enable', true );
        $footer_switch = $footer[ 'footer_switch' ] ?? '';

        if (
            ! $footer_switch
            || 'elementor' !== WGL_Framework::get_mb_option( 'footer_building_tool', 'mb_footer_switch', 'on' )
            || ! class_exists( '\Elementor\Core\Files\CSS\Post' )
        ) {
            // Bailout.
            return;
        }

        $footer_page_id = WGL_Framework::get_mb_option( 'footer_page_select', 'mb_footer_switch', 'on' );

        return $this->multi_language_support( $footer_page_id, 'footer' );
    }

    public function get_elementor_css_cache_side_panel()
    {
        if (
            !WGL_Framework::get_option('side_panel_enabled')
            || 'elementor' !== WGL_Framework::get_mb_option('side_panel_building_tool', 'mb_customize_side_panel', 'custom')
            || !class_exists('\Elementor\Core\Files\CSS\Post')
        ) {
            // Bailout.
            return;
        }

        $sp_page_id = WGL_Framework::get_mb_option('side_panel_page_select', 'mb_customize_side_panel', 'custom');

        return $this->multi_language_support($sp_page_id, 'side_panel');
    }

    public function multi_language_support($page_id, $page_type)
    {
        if (!$page_id) {
            // Bailout.
            return;
        }

        $page_id = intval($page_id);

        if (class_exists('Polylang') && function_exists('pll_current_language')) {
            $currentLanguage = pll_current_language();
            $translations = PLL()->model->post->get_translations($page_id);

            $polylang_id = $translations[$currentLanguage] ?? '';
            $page_id = $polylang_id ?: $page_id;
        }

        if (class_exists('SitePress')) {
            $wpml_id = wpml_object_id_filter($page_id, $page_type, false, ICL_LANGUAGE_CODE);
            if (
                $wpml_id
                && 'trash' !== get_post_status($wpml_id)
            ) {
                $page_id = $wpml_id;
            }
        }

        return $page_id;
    }

    public function elementor_column_fix()
    {
        $css = '.elementor-container > .elementor-row > .elementor-column > .elementor-element-populated,'
            . '.elementor-container > .elementor-column > .elementor-element-populated {'
                . 'padding-top: 0;'
                . 'padding-bottom: 0;'
            . '}';

        $css .= '.elementor-column-gap-default > .elementor-row > .elementor-column > .elementor-element-populated,'
            . '.elementor-column-gap-default > .elementor-column > .theiaStickySidebar > .elementor-element-populated,'
            . '.elementor-column-gap-default > .elementor-column > .elementor-element-populated {'
                . 'padding-left: 15px;'
                . 'padding-right: 15px;'
            . '}';

        wp_add_inline_style('elementor-frontend', $css);
    }

    public function frontend_stylesheets()
    {
        wp_enqueue_style(
            WGL_Framework_Global_Variables::get_theme_slug() . '-theme-info',
            get_bloginfo('stylesheet_url'),
            [],
            WGL_Framework_Global_Variables::get_theme_version()
        );

        $this->enqueue_css_variables();
        $this->enqueue_additional_styles();
        $this->enqueue_theme_stylesheet( 'main', '/css/' );
        $this->enqueue_pluggable_styles();
        $this->enqueue_theme_stylesheet( 'responsive', '/css/', $this->enqueued_stylesheets );
        $this->enqueue_theme_stylesheet( 'dynamic', '/css/', $this->enqueued_stylesheets );
    }

    public function enqueue_css_variables()
    {
        return wp_add_inline_style(
            WGL_Framework_Global_Variables::get_theme_slug() . '-theme-info',
            $this->retrieve_css_variables_and_extra_styles()
        );
    }

    public function enqueue_additional_styles()
    {
        wp_enqueue_style(
            'font-awesome-5-all',
            $this->template_directory_uri . '/css/font-awesome-5.min.css',
            [],
            WGL_Framework_Global_Variables::get_theme_version()
        );

        wp_enqueue_style(
            WGL_Framework_Global_Variables::get_theme_slug() . '-flaticon',
            $this->template_directory_uri . '/fonts/flaticon/flaticon.css',
            [],
            WGL_Framework_Global_Variables::get_theme_version()
        );
    }

    public function retrieve_css_variables_and_extra_styles()
    {
        if (class_exists('Redux')) {
            // Customizer
            if (!empty($GLOBALS['motto_set'])) {
                new WGL_Framework_Global_Variables();
            }
        }

        $root_vars = $extra_css = '';

        /**
         * Color Variables
         */
        if (
            class_exists('RWMB_Loader')
            && 'custom' === WGL_Framework::get_mb_option('page_colors_switch')
        ) {
            $theme_primary_color = WGL_Framework::get_mb_option('theme-primary-color');
            $theme_secondary_color = WGL_Framework::get_mb_option('theme-secondary-color');
            $theme_tertiary_color = WGL_Framework::get_mb_option('theme-tertiary-color');

            $main_font_color = WGL_Framework::get_mb_option( 'theme-content-color' );
            $theme_content_secondary_color = WGL_Framework::get_mb_option('theme-content-secondary-color');
            $h_font_color = WGL_Framework::get_mb_option( 'theme-headings-color' );

            $form_bg_color = WGL_Framework::get_mb_option( 'form-bg-color' );

            $button_color_idle = WGL_Framework::get_mb_option( 'button-color-idle' );
            $button_bg_idle = WGL_Framework::get_mb_option( 'button-bg-idle' );
            $button_border_idle = WGL_Framework::get_mb_option( 'button-border-idle' );
            $button_color_hover = WGL_Framework::get_mb_option( 'button-color-hover' );
            $button_bg_hover = WGL_Framework::get_mb_option( 'button-bg-hover' );
            $button_border_hover = WGL_Framework::get_mb_option( 'button-border-hover' );

            $cursor_point_color = WGL_Framework::get_mb_option('cursor_color')['rgba'] ?? '';

            $scroll_up_arrow_color = WGL_Framework::get_mb_option('scroll_up_arrow_color');
            $scroll_up_arrow_color_bg = WGL_Framework::get_mb_option('scroll_up_arrow_color_bg');
            $scroll_up_arrow_color_border = WGL_Framework::get_mb_option('scroll_up_arrow_color_border');

            $this->gradient_enabled && $theme_gradient_from = WGL_Framework::get_mb_option('theme-gradient-from');
            $this->gradient_enabled && $theme_gradient_to = WGL_Framework::get_mb_option('theme-gradient-to');
        } else {
            $theme_primary_color = WGL_Framework_Global_Variables::get_primary_color();
            $theme_secondary_color = WGL_Framework_Global_Variables::get_secondary_color();
            $theme_tertiary_color = WGL_Framework_Global_Variables::get_tertiary_color();

            $main_font_color = WGL_Framework_Global_Variables::get_main_font_color();
            $theme_content_secondary_color = WGL_Framework_Global_Variables::get_content_secondary_color();
            $h_font_color = WGL_Framework_Global_Variables::get_h_font_color();

            $button_color_idle = WGL_Framework_Global_Variables::get_btn_color_idle();
            $button_bg_idle = WGL_Framework_Global_Variables::get_btn_bg_idle();
            $button_border_idle = WGL_Framework_Global_Variables::get_btn_border_idle();
            $button_color_hover = WGL_Framework_Global_Variables::get_btn_color_hover();
            $button_bg_hover = WGL_Framework_Global_Variables::get_btn_bg_hover();
            $button_border_hover = WGL_Framework_Global_Variables::get_btn_border_hover();

            $cursor_point_color = WGL_Framework_Global_Variables::get_cursor_point_color();

            $form_bg_color = WGL_Framework::get_option( 'form-bg-color' );

            $scroll_up_arrow_color = WGL_Framework::get_option('scroll_up_arrow_color');
            $scroll_up_arrow_color_bg = WGL_Framework::get_option('scroll_up_arrow_color_bg');
            $scroll_up_arrow_color_border = WGL_Framework::get_option('scroll_up_arrow_color_border');

            $this->gradient_enabled && $theme_gradient = WGL_Framework::get_option('theme-gradient');
        }

        $root_vars .= '--motto-primary-color: ' . esc_attr( $theme_primary_color ?: 'unset' ) . ';';
        $root_vars .= '--motto-secondary-color: ' . esc_attr( $theme_secondary_color ?: 'unset' ) . ';';
        $root_vars .= '--motto-tertiary-color: ' . esc_attr( $theme_tertiary_color ?: 'unset' ) . ';';
        $root_vars .= '--motto-content-secondary-color: ' . esc_attr( $theme_content_secondary_color ?: 'unset' ) . ';';

        $root_vars .= '--motto-button-color-idle: ' . esc_attr( $button_color_idle ?: 'unset' ) . ';';
        $root_vars .= '--motto-button-bg-idle: ' . esc_attr( $button_bg_idle ?: 'unset' ) . ';';
        $root_vars .= '--motto-button-border-idle: ' . esc_attr( $button_border_idle ?: 'unset' ) . ';';
        $root_vars .= '--motto-button-color-hover: ' . esc_attr( $button_color_hover ?: 'unset' ) . ';';
        $root_vars .= '--motto-button-bg-hover: ' . esc_attr( $button_bg_hover ?: 'unset' ) . ';';
        $root_vars .= '--motto-button-border-hover: ' . esc_attr( $button_border_hover ?: 'unset' ) . ';';

        $root_vars .= '--motto-button-color-rgb-idle: ' . ( $button_color_idle ? esc_attr(WGL_Framework::hex_to_rgb($button_color_idle)) : 'unset' ) . ';';
        $root_vars .= '--motto-button-bg-rgb-idle: ' . ( $button_bg_idle ? esc_attr(WGL_Framework::hex_to_rgb($button_bg_idle)) : 'unset' ) . ';';
        $root_vars .= '--motto-button-border-rgb-idle: ' . ( $button_border_idle ? esc_attr(WGL_Framework::hex_to_rgb($button_border_idle)) : 'unset' ) . ';';
        $root_vars .= '--motto-button-color-rgb-hover: ' . ( $button_color_hover ? esc_attr(WGL_Framework::hex_to_rgb($button_color_hover)) : 'unset' ) . ';';
        $root_vars .= '--motto-button-bg-rgb-hover: ' . ( $button_bg_hover ? esc_attr(WGL_Framework::hex_to_rgb($button_bg_hover)) : 'unset' ) . ';';
        $root_vars .= '--motto-button-border-rgb-hover: ' . ( $button_border_hover ? esc_attr(WGL_Framework::hex_to_rgb($button_border_hover)) : 'unset' ) . ';';

        $root_vars .= '--motto-cursor-point-color: ' . ( $cursor_point_color ? esc_attr($cursor_point_color) : 'unset' ) . ';';

        $root_vars .= '--motto-form-bg-color: ' . ( $form_bg_color ? esc_attr($form_bg_color) : 'unset' ) . ';';
        $root_vars .= '--motto-form-bg-color-rgb: ' . ( $form_bg_color ? esc_attr(WGL_Framework::hex_to_rgb($form_bg_color)) : '255,255,255' ) . ';';

        $root_vars .= '--motto-back-to-top-color: ' . ( $scroll_up_arrow_color ? esc_attr($scroll_up_arrow_color) : 'unset' ) . ';';
        $root_vars .= '--motto-back-to-top-color-bg: ' . ( $scroll_up_arrow_color_bg ? esc_attr($scroll_up_arrow_color_bg) : 'unset' ) . ';';
        $root_vars .= '--motto-back-to-top-color-border: ' . ( $scroll_up_arrow_color_border ? esc_attr($scroll_up_arrow_color_border) : 'unset' ) . ';';

        $root_vars .= '--motto-primary-rgb: ' . ( $theme_primary_color ? esc_attr(WGL_Framework::hex_to_rgb($theme_primary_color)) : 'unset' ) . ';';
        $root_vars .= '--motto-secondary-rgb: ' . ( $theme_secondary_color ? esc_attr(WGL_Framework::hex_to_rgb($theme_secondary_color)) : 'unset' ) . ';';
        $root_vars .= '--motto-tertiary-rgb: ' . ( $theme_tertiary_color ? esc_attr(WGL_Framework::hex_to_rgb($theme_tertiary_color)) : 'unset' ) . ';';
        $root_vars .= '--motto-content-rgb: ' . ( $main_font_color ? esc_attr(WGL_Framework::hex_to_rgb($main_font_color)) : 'unset' ) . ';';
        $root_vars .= '--motto-content-secondary-rgb: ' . ( $theme_content_secondary_color ? esc_attr(WGL_Framework::hex_to_rgb($theme_content_secondary_color)) : 'unset' ) . ';';
        $root_vars .= '--motto-header-rgb: ' . ( $h_font_color ? esc_attr(WGL_Framework::hex_to_rgb($h_font_color)) : 'unset' ) . ';';
        $root_vars .= '--motto-form-bg-rgb: ' . ( $form_bg_color ? esc_attr(WGL_Framework::hex_to_rgb($form_bg_color)) : 'unset' ) . ';';

        $cart_overlay = WGL_Framework::get_option('cart_overlay_color')['rgba'] ?? '';
        if (!empty($cart_overlay)){
            $root_vars .= '--motto-cart-overlay: ' . esc_attr($cart_overlay) . ';';
        }

        $body_bg = WGL_Framework::get_option('body_color_bg');
        $body_bg = !empty($body_bg['background-color']) ? $body_bg['background-color'] : '#fff';
        $root_vars .= '--body-background-color: ' . $body_bg . ';';

        $shop_products_overlay = WGL_Framework::get_option('shop_products_overlay')['rgba'] ?? 'transparent';
        $root_vars .= '--motto-shop-products-overlay: ' . ( !empty($shop_products_overlay) ? esc_attr($shop_products_overlay) : 'transparent' ) . ';';
        //* ↑ color variables

        /**
         * Product Filter Columns Width
         */
        for ($i = 1; $i <= 8; $i++) { // Columns 1-8
            ${'col' . $i} = WGL_Framework::get_option('filters_columns_' . $i);
            if (isset(${'col' . $i})){
                $root_vars .= '--motto-filters-columns-'.$i.': ' . (${'col'.$i}['width'] ? esc_attr( ${'col'.$i}['width'] ) : '') . ';';
            }
        }
        //* ↑ product filter columns width

        /**
         * Headings Variables
         */
        $header_font = WGL_Framework::get_option( 'header-font' );
        $root_vars .= '--motto-header-font-family: ' . ( $header_font['font-family'] ? esc_attr(str_replace("'", '', $header_font['font-family'])) : 'unset' ) . ';';
        $root_vars .= '--motto-header-font-weight: ' . ( $header_font['font-weight'] ? esc_attr($header_font['font-weight']) : 'unset' ) . ';';
        $root_vars .= '--motto-header-font-color: ' . ( $h_font_color ? esc_attr($h_font_color) : 'unset' ) . ';';

        for ($i = 1; $i <= 6; $i++) { // H1 - H6
            ${'h' . $i} = WGL_Framework::get_option('header-h' . $i);

            $root_vars .= '--motto-h'.$i.'-font-family: ' . (${'h'.$i}['font-family'] ? esc_attr( str_replace("'", '', ${'h'.$i}['font-family']) ) : 'unset') . ';';
            $root_vars .= '--motto-h'.$i.'-font-size: ' . (${'h'.$i}['font-size'] ? esc_attr( ${'h'.$i}['font-size'] ) : 'unset') . ';';
            $root_vars .= '--motto-h'.$i.'-line-height: ' . (${'h'.$i}['line-height'] ? esc_attr( ${'h'.$i}['line-height'] ) : 'unset') . ';';
            $root_vars .= '--motto-h'.$i.'-font-weight: ' . (${'h'.$i}['font-weight'] ? esc_attr( ${'h'.$i}['font-weight'] ) : 'unset') . ';';
            $root_vars .= '--motto-h'.$i.'-text-transform: ' . (${'h'.$i}['text-transform'] ? esc_attr( ${'h'.$i}['text-transform'] ) : 'unset') . ';';
            $root_vars .= '--motto-h'.$i.'-letter-spacing: ' . (${'h'.$i}['letter-spacing'] ? esc_attr(floatval( ${'h'.$i}['letter-spacing'] )).'em' : 'normal') . ';';
        }
        //* ↑ headings variables

        /**
         * Content Variables
         */
        $main_font = WGL_Framework::get_option( 'main-font' );
        $content_font_size = $main_font['font-size'] ?? '';
        $content_line_height = $main_font['line-height'] ?? '';
        $content_line_height = $content_line_height ? round(((int) $content_line_height / (int) $content_font_size), 3) : '';

        $root_vars .= '--motto-content-font-family: ' . ( $main_font['font-family'] ? esc_attr(str_replace("'", '', $main_font['font-family'])) : 'unset') . ';';
        $root_vars .= '--motto-content-font-size: ' . ( $content_font_size ? esc_attr($content_font_size) : 'unset') . ';';
        $root_vars .= '--motto-content-line-height: ' . ( $content_line_height ? esc_attr($content_line_height) : 'unset') . ';';
        $root_vars .= '--motto-content-font-weight: ' . ( $main_font['font-weight'] ? esc_attr($main_font['font-weight']) : 'unset') . ';';
        $root_vars .= '--motto-content-color: ' . ( $main_font_color ? esc_attr($main_font_color) : 'unset') . ';';
        //* ↑ content variables

        /**
         * additional Variables
         */
        $additional_font = WGL_Framework::get_option( 'additional-font' );
        if (!empty($additional_font)) {
            $root_vars .= '--motto-additional-font-family: ' . ( $additional_font['font-family'] ? esc_attr(str_replace("'", '', $additional_font['font-family'])) : 'unset') . ';';
            $root_vars .= '--motto-additional-line-height: ' . ( $additional_font['line-height'] ? esc_attr($additional_font['line-height']) : 'unset') . ';';
            $root_vars .= '--motto-additional-font-weight: ' . ( $additional_font['font-weight'] ? esc_attr($additional_font['font-weight']) : 'unset' ) . ';';
        }
        //* ↑ additional variables

        /**
         * Menu Variables
         */
        $menu_font = WGL_Framework::get_option( 'menu-font' );
        $root_vars .= '--motto-menu-font-family: ' . ( $menu_font['font-family'] ? esc_attr(str_replace("'", '', $menu_font['font-family'])) : 'unset') . ';';
        $root_vars .= '--motto-menu-font-size: ' . ( $menu_font['font-size'] ? esc_attr($menu_font['font-size']) : 'unset') . ';';
        $root_vars .= '--motto-menu-line-height: ' . ( $menu_font['line-height'] ? esc_attr($menu_font['line-height']) : 'unset') . ';';
        $root_vars .= '--motto-menu-font-weight: ' . ( $menu_font['font-weight'] ? esc_attr($menu_font['font-weight']) : 'unset') . ';';
        $root_vars .= '--motto-menu-letter-spacing: ' . ( $menu_font['letter-spacing'] ? esc_attr(floatval($menu_font['letter-spacing'])) . 'em' : 'normal') . ';';
        //* ↑ menu variables

        /**
         * Submenu Variables
         */
        $sub_menu_font = WGL_Framework::get_option('sub-menu-font');
        $root_vars .= '--motto-submenu-font-family: ' . ( $sub_menu_font['font-family'] ? esc_attr(str_replace("'", '', $sub_menu_font['font-family'])) : 'unset') . ';';
        $root_vars .= '--motto-submenu-font-size: ' . ( $sub_menu_font['font-size'] ? esc_attr($sub_menu_font['font-size']) : 'unset') . ';';
        $root_vars .= '--motto-submenu-line-height: ' . ( $sub_menu_font['line-height'] ? esc_attr($sub_menu_font['line-height']) : 'unset') . ';';
        $root_vars .= '--motto-submenu-font-weight: ' . ( $sub_menu_font['font-weight'] ? esc_attr($sub_menu_font['font-weight']) : 'normal') . ';';
        $root_vars .= '--motto-submenu-letter-spacing: ' . ( $sub_menu_font['letter-spacing'] ? esc_attr(floatval($sub_menu_font['letter-spacing'])) . 'em' : 'normal') . ';';

        $sub_menu_color = WGL_Framework::get_option('sub_menu_color')['rgba'] ?? 'unset';
        $sub_menu_bg = WGL_Framework::get_option('sub_menu_background')['rgba'] ?? 'unset';
        $root_vars .= '--motto-submenu-color: ' . ( $sub_menu_color ? esc_attr($sub_menu_color) : 'unset' ) . ';';
        $root_vars .= '--motto-submenu-background: ' . ( $sub_menu_bg ? esc_attr($sub_menu_bg) : 'unset' ) . ';';

        $mob_sub_menu_color = WGL_Framework::get_option('mobile_sub_menu_color') ?? 'unset';
        $mob_sub_menu_bg = WGL_Framework::get_option('mobile_sub_menu_background')['rgba'] ?? 'unset';
        $mob_sub_menu_overlay = WGL_Framework::get_option('mobile_sub_menu_overlay')['rgba'] ?? 'unset';
        $root_vars .= '--motto-submenu-mobile-color: ' . esc_attr($mob_sub_menu_color) . ';';
        $root_vars .= '--motto-submenu-mobile-background: ' . esc_attr($mob_sub_menu_bg) . ';';
        $root_vars .= '--motto-submenu-mobile-overlay: ' . esc_attr($mob_sub_menu_overlay) . ';';

        //* ↑ submenu variables

        /**
         * Header Mobile
         */
        $header_mobile_height = ((bool)WGL_Framework::get_option('mobile_header') && WGL_Framework::get_option('header_mobile_height')['height']) ? WGL_Framework::get_option('header_mobile_height')['height'] : '60px';

        $root_vars .= '--motto-header-mobile-height: ' . esc_attr($header_mobile_height) . ';';
        //* ↑ Header Mobile

        /**
         * Footer Variables
         */
        if (
            WGL_Framework::get_option('footer_switch')
            && 'widgets' === WGL_Framework::get_option('footer_building_tool')
        ) {
            $footer_text_color = WGL_Framework::get_option('footer_text_color') ?? 'unset';
            $footer_heading_color = WGL_Framework::get_option('footer_heading_color') ?? 'unset';
            $copyright_text_color = WGL_Framework::get_mb_option('copyright_text_color', 'mb_copyright_switch', 'on') ?? 'unset';
            $root_vars .= '--motto-footer-content-color: ' . esc_attr($footer_text_color) . ';';
            $root_vars .= '--motto-footer-heading-color: ' . esc_attr($footer_heading_color) . ';';
            $root_vars .= '--motto-copyright-content-color: ' . esc_attr($copyright_text_color) . ';';
        }
        //* ↑ footer variables

        /**
         * Side Panel Variables
         */
        $sidepanel_title_color = WGL_Framework::get_mb_option('side_panel_title_color', 'mb_customize_side_panel', 'custom') ?? 'unset';
        $root_vars .= '--motto-sidepanel-title-color: ' . esc_attr($sidepanel_title_color) . ';';
        //* ↑ side panel variables

        /**
         * Encoded SVG variables
         */
        $root_vars .= '--motto-bg-caret: url(\'data:image/svg+xml; utf8, '.$this->bg_caret($h_font_color ? esc_attr($h_font_color) : '#fff', 0.5).'\');';
        $root_vars .= '--motto-bg-caret-2: url(\'data:image/svg+xml; utf8, '.$this->bg_caret($theme_primary_color ? esc_attr($theme_primary_color) : '#000').'\');';
        $root_vars .= '--motto-bg-caret-3: url(\'data:image/svg+xml; utf8, '.$this->bg_caret($theme_content_secondary_color ? esc_attr($theme_content_secondary_color) : '#cecece').'\');';
        $root_vars .= '--motto-bg-caret-4: url(\'data:image/svg+xml; utf8, '.$this->bg_caret($theme_tertiary_color ? esc_attr($theme_tertiary_color) : '#fff').'\');';
        $root_vars .= '--motto-bg-caret-5: url(\'data:image/svg+xml; utf8, '.$this->bg_caret_2($h_font_color ? esc_attr($h_font_color) : '#fff').'\');';
        $root_vars .= '--motto-bg-caret-6: url(\'data:image/svg+xml; utf8, '.$this->bg_caret_2($theme_primary_color ? esc_attr($theme_primary_color) : '#000').'\');';
        $root_vars .= '--motto-bg-caret-7: url(\'data:image/svg+xml; utf8, '.$this->bg_caret_2($theme_content_secondary_color ? esc_attr($theme_content_secondary_color) : '#000').'\');';
        $root_vars .= '--motto-bg-caret-8: url(\'data:image/svg+xml; utf8, '.$this->bg_caret_2($theme_tertiary_color ? esc_attr($theme_tertiary_color) : '#fff').'\');';
        $root_vars .= '--motto-button-loading: url(\'data:image/svg+xml; utf8, '.$this->wgl_button_loading($theme_tertiary_color ? esc_attr($theme_tertiary_color) : '#fff').'\');';
        $root_vars .= '--motto-button-success: url(\'data:image/svg+xml; utf8, '.$this->wgl_button_success($theme_tertiary_color ? esc_attr($theme_tertiary_color) : '#fff').'\');';

        //* ↑ encoded SVG variables
        /**
         * Title variables
         */
        $root_vars .= '--wgl_price_label: "' . esc_html__( 'Price:', 'motto' ) . '";';

        //* ↑ encoded Title variables

        /**
         * Cart variables
         */

        $cart_offset = WGL_Framework::get_option('cart_offset');
        $root_vars .= !empty($cart_offset['top']) ? '--wgl-positioning-cart-top:' . (int) $cart_offset['top'] . ';' : '';
        $root_vars .= !empty($cart_offset['right']) ? '--wgl-positioning-cart-right:' . (int) $cart_offset['right'] . ';' : '';

        $cart_offset_m = WGL_Framework::get_option('cart_offset_m');
        $root_vars .= !empty($cart_offset_m['top']) ? '--wgl-m-positioning-cart-top:' . (int) $cart_offset_m['top'] . ';' : '';
        $root_vars .= !empty($cart_offset_m['right']) ? '--wgl-m-positioning-cart-right:' . (int) $cart_offset_m['right'] . ';' : '';

        //* ↑ encoded Cart variables

        /**
         * Elementor Container
         */
        $root_vars .= '--motto-elementor-container-width: ' . $this->get_elementor_container_width() . 'px;';
        //* ↑ elementor container

        $css_variables = ':root {' . $root_vars . '}';

        $extra_css .= $this->get_mobile_header_extra_css();
        $extra_css .= $this->get_page_title_responsive_extra_css();
        if (
            class_exists('\Elementor\Plugin')
            && version_compare(ELEMENTOR_VERSION, '3.4', '>')
        ) {
            $extra_css .= $this->init_additional_breakpoints();
        }
        return $css_variables . $this->minify_css($extra_css);
    }

    public function bg_caret($fill = '#000', $opacity = '1'){
        $output = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" x="0" y="0" viewBox="0 0 451.847 451.847" preserveAspectRatio="none" fill="'.esc_attr($fill).'" style="opacity: '.esc_attr($opacity).';"><g><path d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751   c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0   c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"></path></g></svg>';
        return $this->get_data_from_svg( $output );
    }
    public function bg_caret_2($fill = '#000', $opacity = '1'){
        $output = '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" x="0" y="0" viewBox="0 0 9 9" preserveAspectRatio="none" fill="'.esc_attr($fill).'" style="opacity: '.esc_attr($opacity).';"><path d="M5 4V0H4V4H0V5H4V9H5V5H9V4H5Z"/></svg>';
        return $this->get_data_from_svg( $output );
    }

    public function wgl_button_loading($fill = '#fff', $opacity = '1'){
        $output = '<svg xmlns="http://www.w3.org/2000/svg" width="489.698px" height="489.698px" viewBox="0 0 489.698 489.698" preserveAspectRatio="none" fill="'.esc_attr($fill).'" style="opacity: '.esc_attr($opacity).';"><path d="M468.999,227.774c-11.4,0-20.8,8.3-20.8,19.8c-1,74.9-44.2,142.6-110.3,178.9c-99.6,54.7-216,5.6-260.6-61l62.9,13.1    c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-123.7-26c-7.2-1.7-26.1,3.5-23.9,22.9l15.6,124.8    c1,10.4,9.4,17.7,19.8,17.7c15.5,0,21.8-11.4,20.8-22.9l-7.3-60.9c101.1,121.3,229.4,104.4,306.8,69.3    c80.1-42.7,131.1-124.8,132.1-215.4C488.799,237.174,480.399,227.774,468.999,227.774z"/><path d="M20.599,261.874c11.4,0,20.8-8.3,20.8-19.8c1-74.9,44.2-142.6,110.3-178.9c99.6-54.7,216-5.6,260.6,61l-62.9-13.1    c-10.4-2.1-21.8,4.2-23.9,15.6c-2.1,10.4,4.2,21.8,15.6,23.9l123.8,26c7.2,1.7,26.1-3.5,23.9-22.9l-15.6-124.8    c-1-10.4-9.4-17.7-19.8-17.7c-15.5,0-21.8,11.4-20.8,22.9l7.2,60.9c-101.1-121.2-229.4-104.4-306.8-69.2    c-80.1,42.6-131.1,124.8-132.2,215.3C0.799,252.574,9.199,261.874,20.599,261.874z"/></svg>';
        return $this->get_data_from_svg( $output );
    }

    public function wgl_button_success($fill = '#fff', $opacity = '1'){
        $output = '<svg xmlns="http://www.w3.org/2000/svg" width="512px" height="512px" viewBox="0 0 24 24" preserveAspectRatio="none" fill="'.esc_attr($fill).'" style="opacity: '.esc_attr($opacity).';"><path d="m21.73 5.68-13 14a1 1 0 0 1 -.73.32 1 1 0 0 1 -.71-.29l-5-5a1 1 0 0 1 1.42-1.42l4.29 4.27 12.27-13.24a1 1 0 1 1 1.46 1.36z"/></svg>';
        return $this->get_data_from_svg( $output );
    }

    public function get_data_from_svg( $svg ) {
        return str_replace( [ '<', '>', '#' ], [ '%3C', '%3E', '%23' ], $svg );
    }

    public function init_additional_breakpoints()
    {
        $extra_css = '';
        $breakpoints = array_reverse(\Elementor\Plugin::$instance->breakpoints->get_active_breakpoints());
        $extra_css .= $this->content_alignment_responsive();
        $extra_css .= $this->media_content_responsive();
        $extra_css .= $this->hide_element_responsive(false, '-desktop');
        foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
            $extra_css .= $this->content_alignment_responsive($breakpoints[$breakpoint_name]->get_value(), '-'. $breakpoint_name);
            $extra_css .= $this->media_content_responsive($breakpoints[$breakpoint_name]->get_value(), '-'. $breakpoint_name);
            $extra_css .= $this->media_alignment_responsive($breakpoints[$breakpoint_name]->get_value(), '-'. $breakpoint_name);
            $extra_css .= $this->hide_element_responsive($breakpoints[$breakpoint_name]->get_value(), '-'. $breakpoint_name);
        }
        return $extra_css;
    }

    public function hide_element_responsive( $value = false, $media = '' )
    {
        $resolution = '-widescreen' === $media ? 'min' : 'max';
        $extra_css = $value ? '@media ('.$resolution.'-width: '.$value.'px) {' : '';
        $extra_css .= '
            .wgl-hidden'.$media.' {
                display: none;
            }';
        $extra_css .= $value ? '}' : '';

        return $extra_css;
    }

    public function content_alignment_responsive( $value = false, $media = '' )
    {
        $resolution = '-widescreen' === $media ? 'min' : 'max';
        $extra_css = $value ? '@media ('.$resolution.'-width: '.$value.'px) {' : '';
        $extra_css .= '
            body .a'.$media.'left {
                text-align: left;
            }
            body .a'.$media.'center {
                text-align: center;
            }
            body .a'.$media.'right {
                text-align: right;
            }
            body .a'.$media.'justify {
                text-align: justify;
            }';
        $extra_css .= $value ? '}' : '';

        return $extra_css;
    }

    public function media_alignment_responsive( $value = false, $media = '' )
    {
        $resolution = '-widescreen' === $media ? 'min' : 'max';
        $extra_css = $value ? '@media ('.$resolution.'-width: '.$value.'px) {' : '';
        $extra_css .= '
            body .a'.$media.'center .wgl-layout-left{
                justify-content: center;
            }
            body .a'.$media.'center .wgl-layout-right{
                justify-content: center;
            }
            body .a'.$media.'left .wgl-layout-left {
                justify-content: flex-start;
            }
            body .a'.$media.'left .wgl-layout-right {
                justify-content: flex-end;
            }

            body .a'.$media.'right .wgl-layout-left{
                justify-content: flex-end;
            }
            body .a'.$media.'right .wgl-layout-right{
                justify-content: flex-start;
            }';
        $extra_css .= $value ? '}' : '';

        return $extra_css;
    }

    public function media_content_responsive( $value = false, $media = '' )
    {
        $resolution = '-widescreen' === $media ? 'min' : 'max';
        $extra_css = $value ? '@media ('.$resolution.'-width: '.$value.'px) {' : '';
        $extra_css .= '
            body .wgl-layout'.$media.'-top {
                flex-direction: column;
            }
            body .wgl-layout'.$media.'-left {
                flex-direction: row;
            }
            body .wgl-layout'.$media.'-right {
                flex-direction: row-reverse;
            }';
        $extra_css .= $value ? '}' : '';

        return $extra_css;
    }

    public function get_elementor_container_width()
    {
        if (
            did_action('elementor/loaded')
            && defined('ELEMENTOR_VERSION')
        ) {
            if (version_compare(ELEMENTOR_VERSION, '3.0', '<')) {
                $container_width = get_option('elementor_container_width') ?: 1140;
            } else {
                $kit_id = (new \Elementor\Core\Kits\Manager())->get_active_id();
                $meta_key = \Elementor\Core\Settings\Page\Manager::META_KEY;
                $kit_settings = get_post_meta($kit_id, $meta_key, true);
                $container_width = $kit_settings['container_width']['size'] ?? 1140;
            }
        }

        return $container_width ?? 1170;
    }

    protected function get_mobile_header_extra_css()
    {
        $extra_css = '';

        $this->get_elementor_css_cache_header();

        if (WGL_Framework::get_option('mobile_header')) {
            $mobile_background = WGL_Framework::get_option('mobile_background')['rgba'] ?? '';
            $mobile_color = WGL_Framework::get_option('mobile_color');
            $mobile_border_color = WGL_Framework::get_option('mobile_border_color')['rgba'] ?? '';

            $extra_css .= '.wgl-theme-header {'
                    . 'background-color: ' . esc_attr($mobile_background) . ' !important;'
                    . 'color: ' . esc_attr($mobile_color) . ' !important;'
                    . 'border-botton: 1px solid ' . esc_attr($mobile_border_color) . ' !important;'
                . '}';
        }

        $extra_css .= 'header.wgl-theme-header .wgl-mobile-header {'
                . 'display: block;'
            . '}'
            . '.wgl-site-header,'
            . '.wgl-theme-header .primary-nav {'
                . 'display: none;'
            . '}'
            . '.wgl-theme-header .hamburger-box {'
                . 'display: inline-flex;'
            . '}'
            . 'header.wgl-theme-header .mobile_nav_wrapper .primary-nav {'
                . 'display: block;'
            . '}'
            . '.wgl-theme-header .wgl-sticky-header {'
                . 'display: none;'
            . '}'
            . '.wgl-page-socials {'
                . 'display: none;'
            . '}'
            . '.wgl-body-bg {'
                . 'top: var(--motto-header-mobile-height) !important;'
            . '}';

        $mobile_sticky = WGL_Framework::get_option('mobile_sticky');

        if (WGL_Framework::get_option('mobile_over_content')) {
            $extra_css .= 'body .wgl-theme-header {'
                    . 'position: absolute;'
                    . 'z-index: 1001;'
                    . 'width: 100%;'
                    . 'left: 0;'
                    . 'top: 0;'
                . '}';

            if ($mobile_sticky) {
                $extra_css .= 'body .wgl-theme-header .wgl-mobile-header {'
                        . 'position: absolute;'
                        . 'left: 0;'
                        . 'width: 100%;'
                    . '}';
            }

        } else {
            $extra_css .= 'body .wgl-theme-header.header_overlap {'
                    . 'position: relative;'
                    . 'z-index: 3;'
                . '}';
        }

        if ( $mobile_sticky ) {
            $extra_css .= 'body .wgl-theme-header,'
                . 'body .wgl-theme-header.header_overlap {'
                .   'position: sticky;'
                .   'top: 0;'
                . '}'
                . '.admin-bar .wgl-theme-header{'
                .   'top: var(--admin-bar-height);'
                . '}'
                . 'body.mobile_switch_on{'
                .   'position: static !important;'
                . '}'
                . 'body.admin-bar .sticky_mobile .wgl-menu_outer{'
                .   'top: 0px;'
                .   'height: 100vh;'
                . '}'
                . '.wgl-theme-header .wgl_notices_wrapper{'
                .   'transform: translateY(calc(var(--height) + var(--admin-bar-height))) !important;'
                . '}';
        }
        $extra_css .= 'body .wgl-theme-header .mini_cart-overlay{'
                . 'top: calc(-1px * var(--wgl-m-positioning-cart-top, --positioning-size));'
                . 'right: calc(-1px * var(--wgl-m-positioning-cart-right, --positioning-size));'
            . '}';
        $extra_css .= 'body .wgl-theme-header .wgl_notices_wrapper{'
                . '--positioning-size: 0;'
                . 'max-width: calc(100% - calc(var(--positioning-size) * 2px));'
                . 'padding-right: 0;'
                . 'top: calc(1px * var(--wgl-m-positioning-cart-top, --positioning-size));'
                . 'right: calc(1px * var(--wgl-m-positioning-cart-right, --positioning-size));'
            . '}';
        $extra_css .= 'body .wgl-theme-header .wgl_notices_wrapper.stick_top{'
                . 'top: max(1px * var(--wgl-m-positioning-cart-top, --positioning-size), 0px);'
            . '}';

        $extra_css2 = '.wgl-theme-header .wgl-sticky-header.sticky_active ~ .wgl_notices_wrapper {'
                . 'transform: translateY(calc(var(--sticky-height) + var(--admin-bar-height)));'
            . '}';

        return '@media only screen and (max-width: ' . $this->get_header_mobile_breakpoint() . 'px) {' . $extra_css . '}'.
            '@media only screen and (min-width: ' . ((int)$this->get_header_mobile_breakpoint() + 1) . 'px) {' . $extra_css2 . '}';
    }

    protected function get_header_mobile_breakpoint()
    {
        $elementor_breakpoint = '';

        if (
            'elementor' === $this->header_building_tool
            && $this->header_page_id
            && did_action('elementor/loaded')
        ) {
            $settings_manager = \Elementor\Core\Settings\Manager::get_settings_managers('page');
            $settings_model = $settings_manager->get_model($this->header_page_id);

            $elementor_breakpoint = $settings_model->get_settings('mobile_breakpoint');
        }

        return $elementor_breakpoint ?: (int) WGL_Framework::get_option('header_mobile_queris');
    }

    protected function get_page_title_responsive_extra_css()
    {
        $responsive_disabled = ! WGL_Framework::get_option( 'page_title_resp_switch' );

        if (
            $this->RWMB_is_active()
            && 'on' === rwmb_meta('mb_page_title_switch')
            && rwmb_meta('mb_page_title_resp_switch')
        ) {
            $responsive_disabled = false;
        }

        if ( $responsive_disabled ) {
            // Bailout.
            return;
        }

        $pt_padding = WGL_Framework::get_mb_option('page_title_resp_padding', 'mb_page_title_resp_switch', true);

        $extra_css = '.page-header {'
            . (!empty($pt_padding['padding-top']) ? 'padding-top: ' . esc_attr((int) $pt_padding['padding-top']) . 'px !important;' : '')
            . (!empty($pt_padding['padding-bottom']) ? 'padding-bottom: ' . esc_attr((int) $pt_padding['padding-bottom']) . 'px !important;' : '')
            . 'min-height: auto !important;'
        . '}';

        $breadcrumbs_switch = WGL_Framework::get_mb_option('page_title_resp_breadcrumbs_switch', 'mb_page_title_resp_switch', true);

        //* Title
        $pt_font = WGL_Framework::get_mb_option('page_title_resp_font', 'mb_page_title_resp_switch', true);
        $pt_color = !empty($pt_font['color']) ? 'color: ' . esc_attr($pt_font['color']) . ' !important;' : '';
        $pt_f_size = !empty($pt_font['font-size']) ? ' --pt-font-size: ' . esc_attr((int) $pt_font['font-size']) . 'px !important;' : '';
        $pt_line_height = !empty($pt_font['line-height']) ? ' --pt-line-height: ' . esc_attr((int) $pt_font['line-height']) . 'px !important;' : '';
        $pt_additional_style = !(bool) $breadcrumbs_switch ? ' margin-bottom: 0 !important;' : '';
        $title_style = $pt_color . $pt_f_size . $pt_line_height . $pt_additional_style;

        $extra_css .= '.page-header_content .page-header_title {' . $title_style . '}';

        //* Breadcrumbs
        $breadcrumbs_font = WGL_Framework::get_mb_option('page_title_resp_breadcrumbs_font', 'mb_page_title_resp_switch', true);
        $breadcrumbs_color = !empty($breadcrumbs_font['color']) ? 'color: ' . esc_attr($breadcrumbs_font['color']) . ' !important;' : '';
        $breadcrumbs_f_size = !empty($breadcrumbs_font['font-size']) ? 'font-size: ' . esc_attr((int) $breadcrumbs_font['font-size']) . 'px !important;' : '';
        $breadcrumbs_line_height = !empty($breadcrumbs_font['line-height']) ? 'line-height: ' . esc_attr((int) $breadcrumbs_font['line-height']) . 'px !important;' : '';
        $breadcrumbs_display = !(bool) $breadcrumbs_switch ? 'display: none !important;' : '';
        $breadcrumbs_style = $breadcrumbs_color . $breadcrumbs_f_size . $breadcrumbs_line_height . $breadcrumbs_display;

        $extra_css .= '.page-header_content .page-header_breadcrumbs {' . $breadcrumbs_style . '}';

        //* Blog Single Type 3
        if (
            is_single()
            && 'post' === get_post_type()
            && '3' === WGL_Framework::get_mb_option('single_type_layout', 'mb_post_layout_conditional', 'custom')
        ) {
            $blog_t3_padding = WGL_Framework::get_option('single_padding_layout_3');
            $blog_t3_p_top = $blog_t3_padding[ 'padding-top' ] ?? '';
            $blog_t3_p_bottom = $blog_t3_padding[ 'padding-bottom' ] ?? '';
            $blog_t3_p_top_responsive = $blog_t3_p_top > $blog_t3_p_bottom ? 80 + (int) $blog_t3_p_bottom : (int) $blog_t3_p_top;
            $blog_t3_p_top_responsive = $blog_t3_p_top_responsive > 100 ? 100 : $blog_t3_p_top_responsive;
            $blog_t3_style = 'padding-top: ' . $blog_t3_p_top_responsive . 'px !important;';
            $blog_t3_style .= 'padding-bottom: 50px !important;';

            $extra_css .= '.single-post .post_featured_bg > .blog-post {' . esc_attr( $blog_t3_style ) . '}';
        }

        $pt_breakpoint = (int) WGL_Framework::get_mb_option('page_title_resp_resolution', 'mb_page_title_resp_switch', true);

        return '@media (max-width: ' . $pt_breakpoint . 'px) {' . $extra_css . '}';
    }

    /**
     * Enqueue theme stylesheets
     *
     * Function keeps track of already enqueued stylesheets and stores them in `enqueued_stylesheets[]`
     *
     * @param string   $tag      Unprefixed handle.
     * @param string   $file_dir Optional. Path to stylesheet folder, relative to theme root folder.
     * @param string[] $deps     Optional. An array of registered stylesheet handles this stylesheet depends on.
     */
    public function enqueue_theme_stylesheet( String $tag, $file_dir = '/css/pluggable/', $deps = [] )
    {
        $prefixed_tag = WGL_Framework_Global_Variables::get_theme_slug() . '-' . $tag;

        wp_enqueue_style(
            $prefixed_tag,
            $this->template_directory_uri . $file_dir . $tag . $this->use_minified . '.css',
            $deps,
            WGL_Framework_Global_Variables::get_theme_version()
        );

        $this->enqueued_stylesheets[] = $prefixed_tag;
    }

    public function enqueue_pluggable_styles()
    {
        //* Preloader
        WGL_Framework::get_option( 'preloader' ) && $this->enqueue_theme_stylesheet( 'preloader' );

        //* Page 404|Search
        ( is_404() || is_search() ) && $this->enqueue_theme_stylesheet( 'page-404' );

        //* Gutenberg
        WGL_Framework::get_option( 'disable_wp_gutenberg' )
            ? wp_dequeue_style( 'wp-block-library' )
            : $this->enqueue_theme_stylesheet( 'gutenberg' );

        //* Post Single
        if ( is_single() ) {
            $post_type = get_post()->post_type;
            if (
                'post' === $post_type
                || 'portfolio' === $post_type
            ) {
                $this->enqueue_theme_stylesheet( 'blog-post-single' );
            } elseif ( 'team' === $post_type ) {
                $this->enqueue_theme_stylesheet( 'team-post-single' );
            }
        }

        //* WooCommerce Plugin
        class_exists( 'WooCommerce' ) && $this->enqueue_theme_stylesheet( 'woocommerce' );

        //* Side Panel
        if (
            WGL_Framework::get_option( 'side_panel_enabled' )
            || 'side_panel' === ( get_queried_object()->post_type ?? '' )
            || (class_exists('RWMB_Loader') && 'default' != rwmb_meta('mb_customize_side_panel'))
        ) {
            $this->enqueue_theme_stylesheet( 'side-panel' );
        }

        //* WPML plugin
        class_exists( 'SitePress' ) && $this->enqueue_theme_stylesheet( 'wpml' );

        if (
            did_action('elementor/loaded')
            && defined('ELEMENTOR_VERSION')
        ) {
            $id = get_the_ID();
            $p_s = get_post_meta($id,'_elementor_page_settings');
            if (isset($p_s[0]) && is_array($p_s[0]) && isset($p_s[0]['use_webgl_fluid'])){
                $fluid_animation = $p_s[0]['use_webgl_fluid'];
                if (!!$fluid_animation) {
                    $this->enqueue_theme_stylesheet( 'webgl_fluid' );
                }
            }
        }
    }

    public function frontend_scripts()
    {
        wp_enqueue_script(
            WGL_Framework_Global_Variables::get_theme_slug() . '-theme-addons',
            $this->template_directory_uri . '/js/theme-addons' . $this->use_minified . '.js',
            ['jquery'],
            WGL_Framework_Global_Variables::get_theme_version(),
            true
        );

        wp_enqueue_script(
            WGL_Framework_Global_Variables::get_theme_slug() . '-theme',
            $this->template_directory_uri . '/js/theme.js',
            ['jquery'],
            WGL_Framework_Global_Variables::get_theme_version(),
            true
        );

        wp_localize_script(
            WGL_Framework_Global_Variables::get_theme_slug() . '-theme',
            'wgl_core',
            ['ajaxurl' => esc_url(admin_url('admin-ajax.php'))]
        );

        if (is_singular() && comments_open() && get_option('thread_comments')) {
            wp_enqueue_script('comment-reply');
        }
    }

    public function admin_stylesheets()
    {
        wp_enqueue_style(
            WGL_Framework_Global_Variables::get_theme_slug() . '-admin',
            $this->template_directory_uri . '/core/admin/css/admin.css',
            [],
            WGL_Framework_Global_Variables::get_theme_version()
        );

        $this->enqueue_additional_styles();

        wp_enqueue_style( 'wp-color-picker' );
    }

    public function admin_scripts()
    {
        wp_enqueue_media();

        wp_enqueue_script('wp-color-picker');
        wp_localize_script('wp-color-picker', 'wpColorPickerL10n', [
            'clear' => esc_html__('Clear', 'motto'),
            'clearAriaLabel' => esc_html__('Clear color', 'motto'),
            'defaultString' => esc_html__('Default', 'motto'),
            'defaultAriaLabel' => esc_html__('Select default color', 'motto'),
            'pick' => esc_html__('Select', 'motto'),
            'defaultLabel' => esc_html__('Color value', 'motto'),
        ]);

        wp_enqueue_script(
            WGL_Framework_Global_Variables::get_theme_slug() . '-admin',
            $this->template_directory_uri . '/core/admin/js/admin.js',
            [],
            WGL_Framework_Global_Variables::get_theme_version()
        );

        $currentTheme = wp_get_theme();
        $theme_name = false == $currentTheme->parent()
            ? wp_get_theme()->get('Name')
            : wp_get_theme()->parent()->get('Name');
        $theme_name = trim($theme_name);

        $purchase_code = $email = '';
        if (WGL_Framework::wgl_theme_activated()) {
            $theme_details = get_option('wgl_licence_validated');
            $purchase_code = $theme_details['purchase'] ?? '';
            $email = $theme_details['email'] ?? '';
        }

        wp_localize_script(
            WGL_Framework_Global_Variables::get_theme_slug() . '-admin',
            'wgl_verify',
            [
                'ajaxurl' => esc_js(admin_url('admin-ajax.php')),
                'wglUrlActivate' => esc_js(WGL_Theme_Verify::get_instance()->api . 'verification'),
                'wglUrlReset' => esc_js(WGL_Theme_Verify::get_instance()->api . 'reset_activation'),
                'wglUrlDeactivate' => esc_js(WGL_Theme_Verify::get_instance()->api . 'deactivate'),
                'domainUrl' => esc_js(site_url('/')),
                'themeName' => esc_js($theme_name),
                'purchaseCode' => esc_js($purchase_code),
                'email' => esc_js($email),
                'message' => esc_js(esc_html__('Thank you, your license has been validated', 'motto')),
                'ajax_nonce' => esc_js(wp_create_nonce('_notice_nonce')),
                'titleCodeRigistered' => esc_js(esc_html__('This purchase code has been registered', 'motto')),
                'messageCodeRigistered' => esc_js(esc_html__('Please go to your previous working environment and deactivate the purchase code to use it again (WP dashboard -> WebGeniusLab -> Activate Theme -> click on the button "Deactivate" )', 'motto')),
                'messageLostCode' => esc_js(esc_html__('Lost access to your previous site?', 'motto'))
            ]
        );
    }

    protected function add_body_classes()
    {
        add_filter( 'body_class', function ( Array $classes ) {
            if ( !WGL_Framework::get_option('wgl_input_style') ) {
                $classes[] = 'wgl-style-input';
            }

            if ( $this->gradient_enabled ) {
                $classes[] = 'theme-gradient';
            }

            if (
                is_single()
                && 'post' === get_post_type( get_queried_object_id() )
                && '3' === WGL_Framework::get_mb_option( 'single_type_layout', 'mb_post_layout_conditional', 'custom' )
            ) {
                $classes[] = WGL_Framework_Global_Variables::get_theme_slug() . '-blog-type-overlay';
            }

            return $classes;
        } );

        add_filter( 'wgl/header/mobile_width', function ($data) {
            return $this->get_header_mobile_breakpoint();
        } );
    }

    public function RWMB_is_active()
    {
        $id = ! is_archive() ? get_queried_object_id() : 0;

        return class_exists( 'RWMB_Loader' ) && 0 !== $id;
    }

    public function minify_css($css = null)
    {
        $css = str_replace(',{', '{', $css);
        $css = str_replace(', ', ',', $css);
        $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
        $css = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $css);
        $css = trim($css);

        return $css;
    }
}

function wgl_dynamic_styles()
{
    return WGL_Framework_Dynamic_Styles::instance();
}

wgl_dynamic_styles()->construct();
