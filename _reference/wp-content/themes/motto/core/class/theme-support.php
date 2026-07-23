<?php

defined('ABSPATH') || exit;

if (!class_exists('Motto_Theme_Support')) {
    /**
     * Motto Theme Support
     *
     *
     * @author WebGeniusLab <webgeniuslab@gmail.com>
     * @since 1.0.0
     */
    class Motto_Theme_Support
    {
        private static $instance;
        private static $minimum_php_version = '7.0';

        public function __construct()
        {
            if (version_compare(PHP_VERSION, self::$minimum_php_version, '<')) {
                add_action('admin_notices', [$this, 'fail_php_version']);
            }

            if (function_exists('add_theme_support')) {
                add_theme_support('post-thumbnails', ['post', 'page', 'team', 'testimonials', 'product', 'gallery']);
                add_theme_support('automatic-feed-links');
                add_theme_support('revisions');
                add_theme_support('post-formats', ['gallery', 'video', 'quote', 'audio', 'link']);
            }

            add_action('init', [$this, 'register_main_menu']);

            add_action('init', [$this, 'enqueue_translation_files']);

            // Add widget support
            add_action('widgets_init', [$this, 'sidebar_register']);
        }

        public function fail_php_version()
        {
            $message = sprintf(
                __('Motto theme requires PHP version %s+. Your current PHP version is %s.', 'motto'),
                self::$minimum_php_version,
                PHP_VERSION
            );

            echo '<div class="error"><p>', esc_html($message), '</p></div>';
        }

        public function register_main_menu()
        {
            register_nav_menus([
                'main_menu' => esc_html__('Main menu', 'motto')
            ]);
        }

        public function enqueue_translation_files()
        {
            load_theme_textdomain('motto', get_template_directory() . '/languages/');
        }

        public function sidebar_register()
        {
            // Get List of registered sidebar
            $custom_sidebars = WGL_Framework::get_option('sidebars');

            // Default wrapper for widget and title
            $wrapper_before = '<div id="%1$s" class="widget motto_widget %2$s">';
            $wrapper_after = '</div>';
            $title_before = '<div class="title-wrapper"><span class="title">';
            $title_after = '</span></div>';

            // Register custom sidebars
            if (!empty($custom_sidebars)) {
                foreach ($custom_sidebars as $single) {
                    register_sidebar([
                        'name' => esc_attr($single),
                        'id' => "sidebar_".esc_attr(strtolower(preg_replace('/[^A-Za-z0-9\-]/', '', str_replace(' ', '-', $single)))),
                        'description' => esc_html__('Add widget here to appear it in custom sidebar.', 'motto'),
                        'before_widget' => $wrapper_before,
                        'after_widget' => $wrapper_after,
                        'before_title' => $title_before,
                        'after_title' => $title_after,
                    ]);
                }
            }

            // Register Footer Sidebar
            $footer_columns = [
                [
                    'name' => esc_html__('Footer Column 1', 'motto'),
                    'id' => 'footer_column_1'
                ], [
                    'name' => esc_html__('Footer Column 2', 'motto'),
                    'id' => 'footer_column_2'
                ], [
                    'name' => esc_html__('Footer Column 3', 'motto'),
                    'id' => 'footer_column_3'
                ], [
                    'name' => esc_html__('Footer Column 4', 'motto'),
                    'id' => 'footer_column_4'
                ],
            ];

            foreach ($footer_columns as $footer_column) {
                register_sidebar([
                    'name' => $footer_column['name'],
                    'id' => $footer_column['id'],
                    'description' => esc_html__('This area will display in footer like a column. Add widget here to appear it in footer column.', 'motto'),
                    'before_widget' => $wrapper_before,
                    'after_widget' => $wrapper_after,
                    'before_title' => $title_before,
                    'after_title' => $title_after,
                ]);
            }
            if (class_exists('WooCommerce')) {
                $shop_sidebars = [
                    [
                        'name' => esc_html__('Shop Filters', 'motto'),
                        'id' => 'shop_filters'
                    ], [
                        'name' => esc_html__('Shop Products', 'motto'),
                        'id' => 'shop_products'
                    ], [
                        'name' => esc_html__('Shop Single', 'motto'),
                        'id' => 'shop_single'
                    ]
                ];
                foreach ($shop_sidebars as $shop_sidebar) {
                    register_sidebar([
                        'name' => $shop_sidebar['name'],
                        'id' => $shop_sidebar['id'],
                        'description' => esc_html__('This sidebar will display in WooCommerce Pages.', 'motto'),
                        'before_widget' => $wrapper_before,
                        'after_widget' => $wrapper_after,
                        'before_title' => $title_before,
                        'after_title' => $title_after,
                    ]);
                }
            }

            register_sidebar([
                'name' => esc_html__('Side Panel', 'motto'),
                'id' => 'side_panel',
                'before_widget' => $wrapper_before,
                'after_widget' => $wrapper_after,
                'before_title' => $title_before,
                'after_title' => $title_after,
            ]);
        }

        public static function get_instance()
        {
            if (is_null(self::$instance)) {
                self::$instance = new self();
            }

            return self::$instance;
        }
    }

    new Motto_Theme_Support();
}
