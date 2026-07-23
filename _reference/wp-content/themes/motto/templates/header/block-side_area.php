<?php

defined('ABSPATH') || exit;

use Elementor\{
    Plugin,
    Core\Settings\Manager
};
use WGL_Extensions\Includes\WGL_Elementor_Helper;

if (!class_exists('Motto_Header_Side_Area')) {
    class Motto_Header_Side_Area extends Motto_Get_Header
    {
        private $selected_page_id;
        private $building_tool;

        public function __construct()
        {
            $side_panel_disabled = !WGL_Framework::get_option('side_panel_enabled');
            if ($side_panel_disabled) {
                // Bailout.
                return;
            }

            $this->render();
        }

        public function render()
        {
            $this->building_tool = WGL_Framework::get_mb_option('side_panel_building_tool', 'mb_customize_side_panel', 'custom');
            switch ($this->building_tool) {
                case 'elementor':
                    $sp_html = '<div class="side-panel_sidebar">'
                            . $this->get_rendered_page()
                        . '</div>';
                    break;
                case 'widgets':
                default:
                    $sp_html = '<div class="side-panel_sidebar"' . $this->get_side_panel_widgets_styles() . '>';
                        ob_start();
                            dynamic_sidebar('side_panel');
                        $sp_html .= ob_get_clean();
                    $sp_html .= '</div>';
                    break;
            }

            echo '<div class="side-panel_overlay"></div>';
            echo '<section id="side-panel"', $this->get_section_classes(), $this->get_section_styles(), '>',
                '<button class="side-panel_close" title="', esc_attr__('Close', 'motto'), '">',
                    '<span class="side-panel_close_icon">',
                        '<span></span>',
                        '<span></span>',
                    '</span>',
                '</button>',
                $sp_html,
            '</section>';
        }

        public function get_side_panel_widgets_styles()
        {
            $spacings = WGL_Framework::get_mb_option('side_panel_spacing', 'mb_customize_side_panel', 'custom') ?: [];

	        $style = !empty($spacings['margin-top']) ? 'margin-top:' . (int) $spacings['margin-top'] . 'px;' : '';
	        $style .= !empty($spacings['margin-bottom']) ? ' margin-bottom:' . (int) $spacings['margin-bottom'] . 'px;' : '';
	        $style .= !empty($spacings['margin-left']) ? ' margin-left:' . (int) $spacings['margin-left'] . 'px;' : '';
	        $style .= !empty($spacings['margin-right']) ? ' margin-right:' . (int) $spacings['margin-right'] . 'px;' : '';

	        return $style ? ' style="' . esc_attr($style) . '"' : '';
        }

        public function get_rendered_page()
        {
            $this->selected_page_id = WGL_Framework::get_mb_option('side_panel_page_select', 'mb_customize_side_panel', 'custom');

            if (
                !$this->selected_page_id
                || !did_action('elementor/loaded')
            ) {
                // Bailout, if nothing to render
                return;
            }

            $this->selected_page_id = wgl_dynamic_styles()->multi_language_support($this->selected_page_id, 'side_panel');

            $this->enqueue_elementor_metaboxes_styles();

            return Plugin::$instance->frontend->get_builder_content($this->selected_page_id);
        }

        public function enqueue_elementor_metaboxes_styles()
        {
            $page_settings = Manager::get_settings_managers('page')->get_model($this->selected_page_id);

            $styles_wrapper = $styles_panel = '';

            $width = $page_settings->get_settings('sp_container_width');
            $width && $styles_wrapper .= 'max-width: ' . $width . 'px;';

            $padding = $page_settings->get_settings('sp_container_padding');
            if (!empty($padding['top'])) {
                $styles_panel .= 'padding: '
                    . $padding['top'] . $padding['unit']
                    . ' ' . $padding['right'] . $padding['unit']
                    . ' ' . $padding['bottom'] . $padding['unit']
                    . ' ' . $padding['left'] . $padding['unit']
                    . ';';
            }

            $bg = $page_settings->get_settings('sp_container_bg');
            $bg && $styles_panel .= 'background-color: ' . $bg . ';';

            $css = $styles_wrapper ? '#side-panel.side-panel {' . $styles_wrapper . '}' : '';
            $css = $styles_panel ? $css . '#side-panel.side-panel .side-panel_sidebar {' . $styles_panel . '}' : $css;

            $css && Wgl_Elementor_Helper::enqueue_css($css);
        }

        public function get_section_classes()
        {
            $class = 'side-panel';

            if (
                class_exists('Elementor\Plugin')
                && 'elementor' === $this->building_tool
            ) {
                $position = Manager::get_settings_managers('page')->get_model($this->selected_page_id)->get_settings('sp_position');
            }
            $position = $position ?? (WGL_Framework::get_mb_option('side_panel_position', 'mb_customize_side_panel', 'custom') ?: 'right');
            $class .= ' side-panel_position_' . $position;

            return ' class="' . esc_attr($class) .  '"';
        }

        public function get_section_styles()
        {
            if ('elementor' === $this->building_tool) {
                // Bailout.
                return;
            }

            if (
                class_exists('RWMB_Loader')
                && 0 !== $this->id
                && 'custom' === rwmb_meta('mb_customize_side_panel')
            ) {
                $bg = rwmb_meta('mb_side_panel_bg');
                $color = rwmb_meta('mb_side_panel_text_color');
                $width = rwmb_meta('mb_side_panel_width');
            }
            $bg = $bg ?? (WGL_Framework::get_option('side_panel_bg')['rgba'] ?? '');
            $color = $color ?? WGL_Framework::get_option('side_panel_text_color');
            $width = $width ?? (WGL_Framework::get_option('side_panel_width')['width'] ?? '');

            $style = '';
            if ($bg) $style .= 'background-color: ' . esc_attr($bg) . ';';
            if ($color) $style .= 'color: ' . esc_attr($color) . ';';
            if ($width) $style .= 'width: ' . esc_attr((int) $width) . 'px;';

            $align = WGL_Framework::get_mb_option('side_panel_text_alignment', 'mb_customize_side_panel', 'custom');
            $style .= $align ? 'text-align: ' . esc_attr($align) . ';' : 'text-align: center;';

            return $style ? ' style="' . $style . '"' : '';
        }
    }

    new Motto_Header_Side_Area();
}
