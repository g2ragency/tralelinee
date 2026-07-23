<?php

defined('ABSPATH') || exit;

use Elementor\Plugin as Plugin;

if (!class_exists('Motto_Footer_Area')) {
    /**
     * Footer Area
     *
     *
     * @package motto\templates
     * @author WebGeniusLab <webgeniuslab@gmail.com>
     * @since 1.0.0
     */
    class Motto_Footer_Area
    {
        private $id;
        private $building_tool;
        private $footer_full_width;
        private $mb_footer_switch;
        private $mb_copyright_switch;

        function __construct()
        {
            $footer_options = apply_filters( 'wgl/footer/enable', true );
            extract($footer_options);

            $footer_bg_color = WGL_Framework::get_option('footer_bg_color');
            $style = '';

            $this->id = get_queried_object_id();
            $this->building_tool = WGL_Framework::get_mb_option('footer_building_tool', 'mb_footer_switch', 'on');
            $this->footer_full_width = WGL_Framework::get_option('footer_full_width');

            if (
                class_exists('RWMB_Loader')
                && 0 !== $this->id
            ) {
                $this->mb_footer_switch = $mb_footer_switch;
                if ('on' == $this->mb_footer_switch) {
                    $footer_bg_color = rwmb_meta('mb_footer_bg');
                    $footer_bg_color = !empty($footer_bg_color['color']) ? $footer_bg_color['color'] : "";
                }

                $this->mb_copyright_switch = $mb_copyright_switch;
            }

            // Container style
            if (
                'widgets' === $this->building_tool
                && ($footer_switch || $copyright_switch)
            ) {
                $style = !empty($footer_bg_color) ? ' background-color :' . esc_attr($footer_bg_color) . ';' : '';
                $style .= WGL_Framework::bg_render('footer', 'mb_footer_switch');
                $style = $style ? ' style="' . esc_attr($style) . '"' : '';
            }

            // Render
            echo '<footer class="footer clearfix"', $style, ' id="footer">';

            if ($footer_switch) {
                switch ($this->building_tool) {
                    default:
                    case 'widgets':
                        $this->render_widgets_html();
                        break;
                    case 'elementor':
                        $this->render_elementor_html();
                        break;
                }
            }

            if (
                $copyright_switch
                && 'widgets' === $this->building_tool
            ) {
                $this->render_copyright_html();
            }

            echo '</footer>';
        }

        private function render_widgets_html()
        {
            // Get footer vars
            $footer_vars = $this->get_footer_vars();
            extract($footer_vars);

            echo "<div class='footer_top-area widgets_area column_" . (int) $widget_columns . $footer_class . "' " . $footer_border_style . ">";

            if (!$this->footer_full_width) echo "<div class='wgl-container'>";

            $sidebar_exists = false;
            $i = 1;
            while ($i < (int) $widget_columns + 1) {
                if (is_active_sidebar('footer_column_' . $i)) {
                    $sidebar_exists = true;
                }
                $i++;
            }
            if ($sidebar_exists) {
                echo "<div class='row'" . $footer_style . ">";
                $i = 1;
                while ($i < (int) $widget_columns + 1) {
                    $columns_number = $i - 1; ?>
                    <div class='wgl_col-<?php echo esc_attr($layout[$columns_number]); ?>'>
                        <?php
                        if (is_active_sidebar('footer_column_' . $i)) dynamic_sidebar('footer_column_' . $i);
                        ?>
                    </div>
                    <?php
                    $i++;
                }
                echo "</div>";
            }

            if (!$this->footer_full_width) echo '</div>';

            echo '</div>';
        }

        private function get_footer_vars()
        {
            // Get options
            $footer_spacing = WGL_Framework::get_mb_option('footer_spacing', 'mb_footer_switch', 'on');
            $footer_border = WGL_Framework::get_mb_option('footer_add_border', 'mb_footer_switch', 'on');
            $footer_border_color = WGL_Framework::get_mb_option('footer_border_color', 'mb_footer_switch', 'on');

            $footer_options = [];
            $footer_options['widget_columns'] = WGL_Framework::get_option('widget_columns');
            $footer_options['widget_columns_2'] = WGL_Framework::get_option('widget_columns_2');
            $footer_options['widget_columns_3'] = WGL_Framework::get_option('widget_columns_3');
            $footer_align = WGL_Framework::get_option('footer_align');

            //footer container class
            $footer_options['footer_class'] = ' align-' . esc_attr($footer_align);

            // Footer paddings
            $footer_options['footer_style'] = $footer_options['footer_border_style'] =  '';
            $footer_options['footer_style'] .= !empty($footer_spacing['padding-top']) ? ' padding-top:' . (int) $footer_spacing['padding-top'] . 'px;' : '';
            $footer_options['footer_style'] .= !empty($footer_spacing['padding-bottom']) ? ' padding-bottom:' . (int) $footer_spacing['padding-bottom'] . 'px;' : '';
            $footer_options['footer_style'] .= !empty($footer_spacing['padding-left']) ? ' padding-left:' . (int) $footer_spacing['padding-left'] . 'px;' : '';
            $footer_options['footer_style'] .= !empty($footer_spacing['padding-right']) ? ' padding-right:' . (int) $footer_spacing['padding-right'] . 'px;' : '';
	        $footer_options['footer_style'] = !empty($footer_options['footer_style']) ? ' style="' . esc_attr($footer_options['footer_style']) . '"' : '';

	        $footer_options['footer_border_style'] .= $footer_border ? ' style="border-top-color: ' . esc_attr($footer_border_color) . ';"' : '';

            $footer_options['layout'] = [];
            switch ((int) $footer_options['widget_columns']) {
                case 1:
                    $footer_options['layout'] = ['12'];
                    break;
                case 2:
                    $footer_options['layout'] = explode('-', $footer_options['widget_columns_2']);
                    break;
                case 3:
                    $footer_options['layout'] = explode('-', $footer_options['widget_columns_3']);
                    break;
                default:
                case 4:
                    $footer_options['layout'] = ['3', '3', '3', '3'];
                    break;
            }

            return $footer_options;
        }

        private function render_elementor_html()
        {
            $selected_page_id = WGL_Framework::get_mb_option('footer_page_select', 'mb_footer_switch', 'on');
            $selected_page_id = wgl_dynamic_styles()->multi_language_support($selected_page_id, 'footer');

            if (
                !$selected_page_id
                || !did_action('elementor/loaded')
            ) {
                // Bailout.
                return;
            }

            echo '<div class="footer_top-area">',
                '<div class="wgl-container">',
                    '<div class="row-footer">',
                        Plugin::$instance->frontend->get_builder_content($selected_page_id),
                    '</div>',
                '</div>',
            '</div>';
        }

        private function render_copyright_html()
        {
            if ('on' === $this->mb_copyright_switch) {
                $editor = rwmb_meta('mb_copyright_editor');
            }
            $editor = !empty($editor) ? $editor : WGL_Framework::get_option('copyright_editor');

            echo '<div class="copyright"', $this->get_copyright_style(), '>',
                $this->footer_full_width ? '' : '<div class="wgl-container">',
                    '<div class="row"', $this->get_copyright_row_styles(), '>',
                        '<div class="wgl_col-12">',
                            do_shortcode($editor),
                        '</div>',
                    '</div>',
                $this->footer_full_width ? '' : '</div>',
            '</div>';
        }

        private function get_copyright_style()
        {
            if ('widgets' === $this->building_tool) {
                $bg_color = WGL_Framework::get_mb_option('copyright_bg_color', 'mb_copyright_switch', 'on');

                $style = !empty($bg_color) ? 'background-color: ' . esc_attr($bg_color) . ';' : '';
                $style = $style ? ' style="' . $style . '"' : '';
            }

            return $style ?? '';
        }

        private function get_copyright_row_styles()
        {
            $copyright_spacing = WGL_Framework::get_mb_option('copyright_spacing', 'mb_copyright_switch', 'on');

	        $style = !empty($copyright_spacing['padding-top']) ? 'padding-top:' . esc_attr((int) $copyright_spacing['padding-top']) . 'px;' : '';
	        $style .= !empty($copyright_spacing['padding-bottom']) ? 'padding-bottom:' . esc_attr((int) $copyright_spacing['padding-bottom']) . 'px;' : '';

            return $style ? ' style="' . $style . '"' : '';
        }
    }

    new Motto_Footer_Area();
}
