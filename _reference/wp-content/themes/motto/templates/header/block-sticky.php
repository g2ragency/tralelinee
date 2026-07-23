<?php

defined('ABSPATH') || exit;

if (!class_exists('Motto_Header_Sticky')) {
    class Motto_Header_Sticky extends Motto_Get_Header
    {
        public function __construct()
        {
            $this->header_vars();
            $this->html_render = 'sticky';

            if (WGL_Framework::get_mb_option('header_sticky', 'mb_customize_header_layout', 'custom')) {
                $header_sticky_style = WGL_Framework::get_option('header_sticky_style');

                echo "<div class='wgl-sticky-header wgl-sticky-element", ('default' === $this->header_building_tool ? ' header_sticky_shadow' : ''), "'", (!empty($header_sticky_style) ? ' data-style="' . esc_attr($header_sticky_style) . '"' : ''), ">";

                echo '<div class="container-wrapper">';

                    $this->build_header_layout('sticky');

                echo '</div>';

                echo '</div>';
            }
        }
    }

    new Motto_Header_Sticky();
}
