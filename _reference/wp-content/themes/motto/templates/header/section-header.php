<?php

defined('ABSPATH') || exit;

if (!class_exists('Motto_Get_Header')) {
    class Motto_Get_Header
    {
        public static $search_form_counter = 0;

        protected $html_render = 'bottom';
        protected $id;
        protected $side_area_enabled;

        protected $header_building_tool;
        protected $header_page_select_id;
        protected $header_sticky_page_select_id;

        private static $instance;
        private $get_menu_logo;
        private $render_attributes;

        public function __construct()
        {
            $this->init();
        }

        public function init()
        {
            $this->header_vars();
            $this->require_components();
            $this->header_render_html();
        }

        public function header_vars()
        {
            $this->id = !is_archive() ? get_queried_object_id() : 0;

            /**
            * Header Template
            */
            $this->header_building_tool = WGL_Framework::get_option('header_building_tool');

            if ('elementor' === $this->header_building_tool) {

                $header_page_select = WGL_Framework::get_option('header_page_select');

                // Blog Single custom header template
                global $post;
                if (!empty($post)) {
                    if (
                        'post' === get_post_type( $post )
                        && !WGL_Framework::get_option('blog_header_conditional')
                    ) {
                        $header_page_select = WGL_Framework::get_option('blog_single_header_page_select');
                    }
                }

                if ($header_page_select) {
                    $this->header_page_select_id = wgl_dynamic_styles()->multi_language_support($header_page_select, 'header');
                }
            }

            /**
             * Sticky Header Template
             */
            if (WGL_Framework::get_mb_option('header_sticky', 'mb_customize_header_layout', 'custom') == '1') {
                $header_sticky_page_select = WGL_Framework::get_option('header_sticky_page_select');

                if (!empty($header_sticky_page_select)) {
                    $this->header_sticky_page_select_id = wgl_dynamic_styles()->multi_language_support($header_sticky_page_select, 'header');
                }
            }

            // RWMB opions
            if (
                class_exists('RWMB_Loader')
                && 0 !== $this->id
                && 'custom' === rwmb_meta('mb_customize_header_layout')
            ) {
                if ('default' !== rwmb_meta('mb_header_content_type')) {
                    $this->header_building_tool = 'elementor';
                    $this->header_page_select_id = rwmb_meta('mb_customize_header');
                    $this->header_page_select_id = wgl_dynamic_styles()->multi_language_support($this->header_page_select_id, 'header');
                }

                if ('default' !== rwmb_meta('mb_sticky_header_content_type')) {
                    $this->header_sticky_page_select_id = rwmb_meta('mb_customize_sticky_header');
                    $this->header_sticky_page_select_id = wgl_dynamic_styles()->multi_language_support($this->header_sticky_page_select_id, 'header');
                }
            }
        }

        public function require_components()
        {
            require_once get_theme_file_path('/templates/header/components/logo.php');
        }

        public function header_render_html()
        {
            $mobile_header_custom = WGL_Framework::get_option('mobile_header');

            echo '<header class="wgl-theme-header', esc_attr($this->header_class()), '">';

                // Default header
                echo '<div class="wgl-site-header', (!empty($mobile_header_custom) ? ' mobile_header_custom' : ''), '">';
                    echo '<div class="container-wrapper">';
                    $this->build_header_layout();
                    echo '</div>';
                echo '</div>';

                // Sticky header
                get_template_part('templates/header/block', 'sticky');

                // Mobile header
                get_template_part('templates/header/block', 'mobile');

		        /**
		         * Fires before header ends
		         *
		         * @since 1.0.0
		         */
		        do_action( 'wgl/before_header_ends' );

            echo '</header>';

            // Side panel
            get_template_part('templates/header/block', 'side_area');
        }

        public function header_class()
        {
            $header_shadow = WGL_Framework::get_option('header_shadow');
            $header_on_bg = WGL_Framework::get_option('header_on_bg');
            $header_class = '';

            if ( 'elementor' === $this->header_building_tool ) {
                if (
                    !empty($this->header_page_select_id)
                    && did_action('elementor/loaded')
                ) {
                    // Get the page settings manager
                    $page_settings_manager = \Elementor\Core\Settings\Manager::get_settings_managers('page');

                    // Get the settings model for header post
                    $page_settings_model = $page_settings_manager->get_model($this->header_page_select_id);

                    $header_on_bg = $page_settings_model->get_settings('header_on_bg');
                }
            } elseif ($header_shadow) {
                $header_class .= ' header_shadow';
            }

            if (
                get_option('show_on_front') === 'posts'
                && (is_front_page())
            ) {
                $header_on_bg = false;
            }

            if ($header_on_bg) {
                $header_class .= ' header_overlap';
            }

            return $header_class;
        }

        public function header_bar_editor($location = null, $position = null)
        {
            if (!$position) {
                return;
            }

            ${'header_'.$position.'_editor'} = WGL_Framework::get_option($location.'_header_bar_'.$position.'_editor');
            $html_render = ${'header_'.$position.'_editor'};
            // Header Bar HTML Editor render
            $html = '';
            if (!empty($html_render)) {
                $html .= "<div class='".esc_attr($location)."_header ".esc_attr($position)."_editor header_render_editor header_render'>";
                    $html .= '<div class="wrapper">';
                            $html .= do_shortcode( $html_render );
                    $html .= '</div>';
                $html .= '</div>';
            }

            return $html;
        }

        public function header_bar_delimiter($k = null)
        {
            if (!$k) {
                return;
            }

            $get_number = (int) filter_var($k, FILTER_SANITIZE_NUMBER_INT);
            $height = WGL_Framework::get_option('bottom_header_delimiter'.$get_number.'_height');
            $width = WGL_Framework::get_option('bottom_header_delimiter'.$get_number.'_width');

            $bg_color = WGL_Framework::get_option('bottom_header_delimiter'.$get_number.'_bg');

            $margin = WGL_Framework::get_option('bottom_header_delimiter'.$get_number.'_margin');

            $margin_left = !empty($margin['margin-left']) ? (int)$margin['margin-left'] : '';
            $margin_right = !empty($margin['margin-right']) ? (int)$margin['margin-right'] : '';

            $custom_sticky = '';
            if ($this->html_render === 'sticky') {
                $custom_sticky = WGL_Framework::get_option('bottom_header_delimiter'.$get_number.'_sticky_custom');
                if (!empty($custom_sticky)) {
                    $bg_color = WGL_Framework::get_option('bottom_header_delimiter'.$get_number.'_sticky_color');
                    $height  = WGL_Framework::get_option('bottom_header_delimiter'.$get_number.'_sticky_height');
                }
            }

            // Header Bar Delimiter render
            $style = '';
            if (is_array($height)) {
                $style .= 'height: '.esc_attr((int) $height['height'] ).'px;';
            }

            if (is_array($width)) {
                $style .= 'width: '.esc_attr((int) $width['width'] ).'px;';
            }

            if (!empty($bg_color['rgba'])) {
                $style .= 'background-color: '.esc_attr($bg_color['rgba']).';';
            }

            if (!empty($margin_left)) {
                $style .= 'margin-left:'.esc_attr((int) $margin_left).'px;';
            }

            if (!empty($margin_right)) {
                $style .= 'margin-right:'.esc_attr((int) $margin_right).'px;';
            }

            echo '<div class="delimiter-wrapper">',
                '<div class="delimiter"'.(!empty($style) ? ' style="'.$style.'"' : '').'></div>',
            '</div>';
        }

        public function header_bar_button($location = 'bottom', $k = null)
        {
            if (!$k) {
                return;
            }

            $get_number = (int) filter_var($k, FILTER_SANITIZE_NUMBER_INT);
            $button_text = WGL_Framework::get_option($location.'_header_button' . $get_number . '_title');

            $link = WGL_Framework::get_option($location.'_header_button' . $get_number . '_link');
            $target = WGL_Framework::get_option($location.'_header_button' . $get_number . '_target');

            $size = WGL_Framework::get_option($location.'_header_button' . $get_number . '_size') ?? 'md';

            $customize = WGL_Framework::get_option($location.'_header_button' . $get_number . '_custom');
            $customize = empty($customize) ? 'def' : 'color';

            $text_color_idle = WGL_Framework::get_option($location.'_header_button' . $get_number . '_color_txt')['rgba'] ?? '';
            $text_color_hover = WGL_Framework::get_option($location.'_header_button' . $get_number . '_hover_color_txt')['rgba'] ?? '';

            $border_color = WGL_Framework::get_option($location.'_header_button' . $get_number . '_border')['rgba'] ?? '';
            $border_color_hover = WGL_Framework::get_option($location.'_header_button' . $get_number . '_hover_border')['rgba'] ?? '';
            $border_radius = WGL_Framework::get_option($location.'_header_button' . $get_number . '_radius') ?? false;

            $bg_color = WGL_Framework::get_option($location.'_header_button' . $get_number . '_bg')['rgba'] ?? '';
            $bg_color_hover = WGL_Framework::get_option($location.'_header_button' . $get_number . '_hover_bg')['rgba'] ?? '';

            $button_css_id = uniqid('motto_button_');

            $settings = [
                'link' => [
                    'url' => $link,
                    'is_external' => $target,
                    'nofollow' => '',
                ],
                'button_css_id' => $button_css_id,
            ];

            // Start Custom CSS
            ob_start();
            if ($customize == 'color') {
                echo "#$button_css_id {
                        color: ".($text_color_idle ? esc_attr($text_color_idle) : 'transparent').";
                    }";
                echo "#$button_css_id:hover {
                        color: ".($text_color_hover ? esc_attr($text_color_hover) : 'transparent').";
                    }";
                $border_color = $border_color ? esc_attr($border_color) : 'transparent';
                echo "#$button_css_id {
                        border-color: $border_color;
                        background-color: $bg_color;
                    }";
                echo "#$button_css_id:hover {
                        border-color: ".($border_color_hover ? esc_attr($border_color_hover) : 'transparent').";
                        background-color: $bg_color_hover;
                    }";
            }
            $styles = ob_get_clean();

            // Register css
            if ($styles) {
                WGL_Framework::enqueue_css($styles);
            }

            unset($this->render_attributes);


            // Attributes
            $this->add_render_attribute('wrapper', 'class', 'button-wrapper');

            if (!empty($settings['link']['url'])) {
                $this->add_render_attribute('button', 'href', $settings['link']['url']);
                $this->add_render_attribute('button', 'class', 'elementor-button-link');
                if ($settings['link']['is_external']) {
                    $this->add_render_attribute('button', 'target', '_blank');
                }
                if ($settings['link']['nofollow']) {
                    $this->add_render_attribute('button', 'rel', 'nofollow');
                }
            }

            $this->add_render_attribute('button', 'id', $button_css_id);
            $this->add_render_attribute('button', 'class', 'wgl-button');
            $this->add_render_attribute('button', 'class', 'btn-size-' . $size);
            $this->add_render_attribute('button', 'role', 'button');

            if (isset($settings['hover_animation'])) {
                $this->add_render_attribute('button', 'class', 'elementor-animation-' . $settings['hover_animation']);
            }

            if ($border_radius = (int) $border_radius) {
                $this->add_render_attribute('button', 'style', 'border-radius: '.$border_radius.';' );
            }

            // Render
            echo '<div class="header_button">',
                '<div class="wrapper">',
                    '<div', $this->get_render_attribute_string('wrapper'), '>',
                        '<a', $this->get_render_attribute_string('button'), '>',
                            $this->render_text($button_text),
                        '</a>',
                    '</div>',
                '</div>',
            '</div>';
        }

        public function render_text($button_text)
        {
            $this->add_render_attribute([
                'content-wrapper' => [
                    'class' => 'button__content',
                ],
                'text' => [
                    'class' => 'button__text',
                ],
            ]);

            // Render
            echo '<span', $this->get_render_attribute_string('content-wrapper'), '>',
                '<span', $this->get_render_attribute_string('text'), '>',
                    esc_html($button_text),
                '</span>',
            '</span>';
        }

        /**
         * Add render attribute.
         *
         * Used to add attributes to a specific HTML element.
         *
         * The HTML tag is represented by the element parameter, then you need to
         * define the attribute key and the attribute key. The final result will be:
         * `<element attribute_key="attribute_value">`.
         *
         * Example usage:
         *
         * `$this->add_render_attribute( 'wrapper', 'class', 'custom-widget-wrapper-class' );`
         * `$this->add_render_attribute( 'widget', 'id', 'custom-widget-id' );`
         * `$this->add_render_attribute( 'button', [ 'class' => 'custom-button-class', 'id' => 'custom-button-id' ] );`
         *
         * @param array|string $element   The HTML element.
         * @param array|string $key       Optional. Attribute key. Default is null.
         * @param array|string $value     Optional. Attribute value. Default is null.
         * @param bool         $overwrite Optional. Whether to overwrite existing
         *                                attribute. Default is false, not to overwrite.
         *
         * @return Element_Base Current instance of the element.
         */
        public function add_render_attribute($element, $key = null, $value = null, $overwrite = false)
        {
            if (is_array($element)) {
                foreach ($element as $element_key => $attributes) {
                    $this->add_render_attribute($element_key, $attributes, null, $overwrite);
                }

                return $this;
            }

            if (is_array($key)) {
                foreach ($key as $attribute_key => $attributes) {
                    $this->add_render_attribute($element, $attribute_key, $attributes, $overwrite);
                }

                return $this;
            }

            if (empty($this->render_attributes[$element][$key])) {
                $this->render_attributes[$element][$key] = [];
            }

            settype($value, 'array');

            if ($overwrite) {
                $this->render_attributes[$element][$key] = $value;
            } else {
                $this->render_attributes[$element][$key] = array_merge($this->render_attributes[$element][$key], $value);
            }

            return $this;
        }

        public function get_render_attribute_string($element)
        {
            if (empty($this->render_attributes[$element])) {
                return '';
            }

            return ' ' . WGL_Framework::render_html_attributes( $this->render_attributes[ $element ] );
        }

        public function header_bar_socials($location = null)
        {
            $socials = WGL_Framework::get_option($location.'_header_socials');
            $target = WGL_Framework::get_option($location.'_header_socials_target');
            $font_size = WGL_Framework::get_option($location.'_header_socials_font_size');
            $space = WGL_Framework::get_option($location.'_header_socials_space');
            $radius = WGL_Framework::get_option($location.'_header_socials_radius');
            $padding = WGL_Framework::get_option($location.'_header_socials_padding');

            $wrapper_id = uniqid('motto_wrapper_');

            $this->add_render_attribute('wrapper', 'id', $wrapper_id);
            $this->add_render_attribute('wrapper', 'class', 'socials-wrapper');

            echo '<div class="header_socials"><div class="wrapper"><div ',$this->get_render_attribute_string('wrapper'),'>';

            $styles = '';

            foreach($socials as $social){

                if($social['enabled']){

                    $social_css_id = uniqid('motto_social_');

                    $this->add_render_attribute('social', 'id', $social_css_id);
                    $this->add_render_attribute('social', 'class', 'wgl-social');
                    $this->add_render_attribute('social', 'href', esc_url( $social['url'] ));
                    $this->add_render_attribute('social', 'target', !empty($target) ? '_blank' : '_self');

                    $text_color_idle = $social['color'] ?? '';
                    $text_color_hover = $social['color_hover'] ?? '';

                    $bg_color = $social['background'] ?? '';
                    $bg_color_hover = $social['background_hover'] ?? '';


                    echo '<a ' , $this->get_render_attribute_string('social') , '>';

                    echo '<i class="fab ' , esc_attr($social['icon']) , '" title="' , esc_html($social['name']) , '"></i>';

                    echo '</a>';

                    $styles .= "#".$social_css_id."{color:" . ($text_color_idle ? esc_attr($text_color_idle) : 'transparent') . ";background-color: " . ($bg_color ? esc_attr($bg_color) : 'transparent') . ";}";
                    $styles .= "#".$social_css_id.":hover {color:" . ($text_color_hover ? esc_attr($text_color_hover) : 'transparent') . ";background-color: " . ($bg_color_hover ? esc_attr($bg_color_hover) : 'transparent') . ";}";

                    unset($this->render_attributes);
                }
            }

            // Register css
            if ($styles) {
                $styles .= "#" . $wrapper_id . "{font-size:" . ($font_size['height'] ? esc_attr((int) $font_size['height']) . 'px' : 'inherit') . ";gap: " . ($space['width'] ? esc_attr((int) $space['width']) . 'px' : '0px;') . ";}";
                $styles .= "#" . $wrapper_id . " .wgl-social{" . (!empty($radius) ? 'border-radius:' . esc_attr((int) $radius) . 'px;' : '') . "}";
                $styles .= "#" . $wrapper_id . " .wgl-social{" . (!empty($padding) ? 'padding:' . esc_attr((int) $padding['padding-top']) . 'px;' : '') . "}";
                WGL_Framework::enqueue_css($styles);
            }

            unset($this->render_attributes);

            echo '</div></div></div>';
        }

        public function header_bar_spacer($location = null, $key = null)
        {
            if (!$key) {
                return;
            }

            $get_number = (int) filter_var($key, FILTER_SANITIZE_NUMBER_INT);
            $spacer = WGL_Framework::get_option($location.'_header_spacer'.$get_number);
            // Header Bar Spacer render
            $html = '';
            if (is_array($spacer)) {
                $html .= "<div class='header_spacing spacer_".$get_number."' style='width:".esc_attr( (int) $spacer['width'] )."px;'>";
                $html .= '</div>';
            }

            return $html;
        }

        public function header_bar_spacer_height($location = null, $key = null)
        {
            if (!$key) {
                return;
            }

            $get_number = (int) filter_var($key, FILTER_SANITIZE_NUMBER_INT);
            $spacer = WGL_Framework::get_option($location.'_header_spacer'.$get_number);
            // Header Bar Spacer render
            $html = '';
            if (is_array($spacer)) {
                $html .= "<div class='header_spacing spacer_".$get_number."' style='height:".esc_attr( (int) $spacer['width'] )."px;'>";
                $html .= '</div>';
            }

            return $html;
        }

        /**
         * Generate header builder layout
         */
        public function build_header_layout($section = 'bottom')
        {
            $sticky = '';

            if ('sticky' === $this->html_render) {
                if (!empty($this->header_sticky_page_select_id)) {
                    $sticky = '_sticky';
                    $this->header_building_tool = 'elementor';
                }
                $section = 'bottom';
            }

            if (
                'elementor' === $this->header_building_tool
                && 'bottom' === $section
            ) {
                require_once get_theme_file_path('/templates/header/elementor-builder/header-builder' . $sticky . '.php');
            } else {
                $this->header_default($section);
            }
        }

        public function header_default($section = 'bottom')
        {
            $header_layout = WGL_Framework::get_option($section . '_header_layout');
            $lavalamp_active = WGL_Framework::get_option('lavalamp_active');

            // Get item from recycle bin
            $j = 0;
            $header_layout_top = $header_layout_middle = $header_layout_bottom = [];

            // Build Row Item
            $counter = 1;
            if ($section == 'bottom') {
                $header_layout = array_slice($header_layout, 1);
                $half = 3;
                for ($i = 0; $i < 3; $i++) {
                    switch ($i) {
                        case 0:
                            $header_layout_top = array_slice($header_layout, $j, $half);
                            break;
                        case 1:
                            $header_layout_middle = array_slice($header_layout, $j, $half);
                            break;
                        case 2:
                            $header_layout_bottom = array_slice($header_layout, $j, $half);
                            break;
                    }

                    $j = $j+$half;
                }

                // WGL Header Builder Row
                $counter = 3;
            }

            /**
            * Generate sticky builder(default)
            */
            $inc_sticky = 0;
            $sticky_present_element = false;
            $sticky_last_row = '';
            $sticky_key_last_row = [];

            for ($i = 1; $i <= $counter; $i++) {
                if ($section == 'bottom') {
                    switch ($i) {
                        case 1:
                            $sticky_loc = '_top';
                            break;
                        case 2:
                            $sticky_loc = '_middle';
                            break;
                        case 3:
                            $sticky_loc = '_bottom';
                            break;
                    }
                    $sticky_header_layout = ${"header_layout" . $sticky_loc};

                    // Disabled Sticky Options
                    $disabled_sticky = false;
                    foreach ($sticky_header_layout as $s => $d) {
                        if (
                            isset($sticky_header_layout[$s]['disable_row'])
                            && $sticky_header_layout[$s]['disable_row'] == 'true'
                        ) {
                            $disabled_sticky = true;
                            continue;
                        }
                    }
                    if (!$disabled_sticky) {
                        foreach ($sticky_header_layout as $key => $v) {
                            if (isset($sticky_header_layout[$key]['disable_row'])) {
                                unset($sticky_header_layout[$key]['disable_row']);
                            }
                            if (
                                count($sticky_header_layout[$key]) == 1
                                && empty($sticky_header_layout[$key]['placebo'])
                                || count($sticky_header_layout[$key]) > 1
                            ) {
                                $sticky_present_element = true;
                                $sticky_key_last_row[] = $key;
                            }
                        }
                    }

                } else {
                    $sticky_present_element = true;
                }

                if (
                    !empty($sticky_header_layout)
                    && $sticky_present_element
                    && $this->html_render == 'sticky'
                ) {
                    $inc_sticky++;
                    $sticky_present_element = false;
                }
            }

            if (is_array($sticky_key_last_row)) {
                $last_element = end($sticky_key_last_row);
                if ($last_element) {
                    switch ($last_element) {
                        case array_key_exists($last_element, $header_layout_top):
                            $sticky_last_row = '_top';
                            break;
                        case array_key_exists($last_element, $header_layout_middle):
                            $sticky_last_row = '_middle';
                            break;
                        case array_key_exists($last_element, $header_layout_bottom):
                            $sticky_last_row = '_bottom';
                            break;
                    }
                }
            }
            /**
            * End Generate sticky builder(default)
            */

            $location = '';
            $has_element = false;
            $counter = $inc_sticky > 1 ? 1 : $counter;

            for ($i = 1; $i <= $counter; $i++) {
                if ($section == 'bottom') {
                    switch ($i) {
                        case 1: $location = '_top'; break;
                        case 2: $location = '_middle'; break;
                        case 3: $location = '_bottom'; break;
                    }

                    if ($inc_sticky > 1) {
                        $location = $sticky_last_row;
                    }

                    $header_layout = ${"header_layout" . $location};

                    // Disabled Row Options
                    $disabled_row = false;
                    foreach ($header_layout as $s => $d) {
                        if (
                            isset($header_layout[$s]['disable_row'])
                            && $header_layout[$s]['disable_row'] == 'true'
                        ) {
                            $disabled_row = true;
                            continue;
                        }
                    }

                    if (!$disabled_row) {
                        foreach ($header_layout as $key => $v) {
                            if (isset($header_layout[$key]['disable_row'])) {
                                unset($header_layout[$key]['disable_row']);
                            }
                            if (
                                count($header_layout[$key]) == 1 && empty($header_layout[$key]['placebo'])
                                || count($header_layout[$key]) > 1
                            ) {
                                $has_element = true;
                            }
                        }
                    }

                } else {
                    $has_element = true;
                }

                if (!empty($header_layout) && $has_element) {
                    switch ($section) {
                        case 'mobile_content':
                            foreach ($header_layout as $part => $value) if ($part != 'items') {
                                if (
                                    !empty($header_layout[$part])
                                    && count($header_layout[$part]) == 1
                                    && empty($header_layout[$part]['placebo'])
                                    || count($header_layout[$part]) > 1
                                ) {
                                    foreach ($header_layout[$part] as $key => $value) if ($key != 'placebo') {
                                        switch ($key) {
                                            case 'item_search':
                                                echo '<div class="header_search search_mobile_menu">';
                                                    echo '<div class="header_search-field">';
                                                        get_search_form();
                                                    echo '</div>';
                                                echo '</div>';
                                                break;

                                            case 'logo':
                                                $menu_condition = $this->get_menu_logo ?? '';
                                                if ($menu_condition) unset($this->get_menu_logo);
                                                $logo_render = $this->get_logo($menu_condition, '_menu');
                                                echo !empty($logo_render) ? $logo_render : '';
                                                break;

                                            case 'menu':
                                                $menu = 'main_menu';
                                                if (WGL_Framework::get_option('custom_mobile_menu')) {
                                                    $custom_menu = true;
                                                    $menu = WGL_Framework::get_option('mobile_menu');
                                                }
                                                if (
                                                    class_exists('RWMB_Loader')
                                                    && $this->id !== 0
                                                    && rwmb_meta('mb_customize_header_layout') == 'custom'
                                                    && rwmb_meta('mb_mobile_menu_custom') == 'custom'
                                                ) {
                                                    $custom_menu = true;
                                                    $menu = rwmb_meta('mb_mobile_menu_header');
                                                }
                                                if (has_nav_menu($menu) || isset($custom_menu)) {
                                                    echo '<nav class="primary-nav">';
                                                        wgl_theme_main_menu($menu, false);
                                                    echo '</nav>';
                                                }
                                                break;

                                            case 'wpml':
                                                if (class_exists('SitePress')) {
                                                    echo '<div class="sitepress_container">';
                                                        do_action('wpml_add_language_selector');
                                                    echo '</div>';
                                                }
                                                break;

                                            case stripos($key, 'html') !== false:
                                                $this_header_bar_editor = $this->header_bar_editor('mobile_drawer', $key);
                                                echo !empty($this_header_bar_editor) ? $this->header_bar_editor('mobile_drawer', $key) : '';
                                                break;

                                            case stripos($key, 'button') !== false:
                                                $this->header_bar_button('mobile_drawer', $key);
                                                break;

                                            case 'socials':
                                                $this->header_bar_socials('mobile_drawer');
                                                break;

                                            case stripos($key, 'spacer') !== false:
                                                $this_header_bar_spacer = $this->header_bar_spacer_height('mobile_drawer', $key);
                                                echo !empty($this_header_bar_spacer) ? $this->header_bar_spacer_height('mobile_drawer', $key) : '';
                                                break;
                                        }
                                    }
                                }
                            }
                            break;

                        default:
                            echo '<div class="wgl-header-row wgl-header-row-section', esc_attr($location), '"', $this->row_style_color($location), '>';
                            echo '<div class="', esc_attr($this->row_width_class($location, $section)), '">';
                            echo '<div class="wgl-header-row_wrapper"', $this->row_style_height($location), '>';
                                foreach ($header_layout as $part => $value) {
                                    if (!empty($header_layout[$part]) && $part != 'items') {

                                        $area_name = '';
                                        switch ($part) {
                                            case stripos($part, 'center') !== false:
                                                $area_name = 'center';
                                                break;
                                            case stripos($part, 'left') !== false:
                                                $area_name = 'left';
                                                break;
                                            case stripos($part, 'right') !== false:
                                                $area_name = 'right';
                                                break;
                                        }
                                        $column_class = $this->column_class($location, $area_name);

                                        $class_area = 'position_' . $area_name . $location;

                                        echo "<div class='", esc_attr(sanitize_html_class($class_area)), " header_side", esc_attr($column_class), "'>";

                                        if (
                                            count($header_layout[$part]) == 1
                                            && empty($header_layout[$part]['placebo'])
                                            || count($header_layout[$part]) > 1
                                        ) {
                                            echo '<div class="header_area_container">';
                                            foreach ($header_layout[$part] as $key => $value) {
                                                if ($key != 'placebo' && $key != 'pos_column') {
                                                    switch ($key) {
                                                        case 'item_search':
                                                            $this->search($this->html_render, $location);
                                                            'mobile' === $this->html_render || self::$search_form_counter++; // mobile header forms doesn't count
                                                            break;

                                                        case 'cart':
	                                                        if (class_exists('WooCommerce')) {
		                                                        global $wgl_woo_cart;
		                                                        $wgl_woo_cart = true;
		                                                        $this->cart($location, $section);
	                                                        }
                                                            break;

                                                        case 'login':
                                                            if (class_exists('WooCommerce')) {
                                                                $this->login_in($location, $section);
                                                            }
                                                            break;

                                                        case 'side_panel':
                                                            $this->side_panel_enabled = true;
                                                            $this->get_side_panel_switcher();
                                                            break;

                                                        case 'logo':
                                                            $logo_render = $this->get_logo();
                                                            echo !empty($logo_render) ? $logo_render : '';
                                                            break;

                                                        case 'menu':
                                                            echo '<nav class="primary-nav',
                                                                ($lavalamp_active == '1' ? ' menu_line_enable' : ''), '" ',
                                                                $this->row_style_height($location),
                                                                '>';
                                                            if (has_nav_menu('main_menu')) {
                                                                wgl_theme_main_menu('main_menu');
                                                            }
                                                            echo '</nav>';
                                                            echo '<div class="hamburger-box">',
                                                                    '<div class="hamburger-inner">',
                                                                        '<span></span>',
                                                                        '<span></span>',
                                                                        '<span></span>',
                                                                    '</div>',
                                                            '</div>';
                                                            break;

                                                        case stripos($key, 'html') !== false:
                                                            $this_header_bar_editor = $this->header_bar_editor($section, $key);
                                                            echo !empty($this_header_bar_editor) ? $this->header_bar_editor($section, $key) : '';
                                                            break;

                                                        case 'wpml':
                                                            if (class_exists('SitePress')) {
                                                                echo '<div class="sitepress_container" ', $this->row_style_height($location), '>';
                                                                    do_action('wpml_add_language_selector');
                                                                echo '</div>';
                                                            }
                                                            break;

                                                        case stripos($key, 'delimiter') !== false:
                                                            $this->header_bar_delimiter($key);
                                                            break;

                                                        case stripos($key,'button') !== false:
                                                            $this->header_bar_button($section, $key);
                                                            break;

                                                        case 'socials':
                                                            $this->header_bar_socials($section);
                                                            break;

                                                        case stripos($key,'spacer') !== false:
                                                            $this_header_bar_spacer = $this->header_bar_spacer($section, $key);
                                                            echo !empty($this_header_bar_spacer) ? $this->header_bar_spacer($section, $key) : '';
                                                            break;
                                                    }
                                                }
                                            }
                                            echo '</div>';
                                        }
                                        echo '</div>';
                                    }
                                }
                            echo '</div>';
                            echo '</div>';
                            echo '</div>'; // wgl-header-row wgl-header-row-section
                        break;
                    }
                    $has_element = false;
                }
            }
        }

        private function row_width_class($s = '_middle', $section = 'bottom')
        {
            $width_container = '';

            switch ($section) {
                case 'bottom':
                    $width_container = WGL_Framework::get_option('header'.$s.'_full_width');
                    break;
                case 'sticky':
                    $width_container = WGL_Framework::get_option('header_custom_sticky_full_width');
                    break;
                case 'mobile':
                    $width_container = WGL_Framework::get_option('header_mobile_full_width');
                    break;
            }

            return $width_container ? 'fullwidth-wrapper' : 'wgl-container';
        }

        private function row_style_color($s = '_middle')
        {
            if (
                'bottom' !== $this->html_render
                && 'sticky' !== $this->html_render
            ) {
                // Bailout.
                return;
            }

            $header_background = WGL_Framework::get_option('header' . $s . '_background');
            $style = !empty($header_background['rgba']) ? 'background-color: ' . esc_attr($header_background['rgba']) . ';' : '';

            $header_bg_image = WGL_Framework::get_option('header' . $s . '_background_image')['url'] ?? '';
            if ($header_bg_image) {
                $style .= 'background-size: cover;'
                    . ' background-repeat: no-repeat;'
                    . ' background-image: url(' . esc_attr($header_bg_image) . ');';
            }

            $header_color = WGL_Framework::get_option('header' . $s . '_color');
            $style .= !empty($header_color) ? 'color: ' . esc_attr($header_color) . ';' : '';

            $header_bottom_border = WGL_Framework::get_option('header' . $s . '_bottom_border');
            if (!empty($header_bottom_border)) {
                $header_border_height = WGL_Framework::get_option('header' . $s . '_border_height')['height'] ?? '';
                $header_bottom_border_color = WGL_Framework::get_option('header' . $s . '_bottom_border_color');

                $style .= $header_border_height ? 'border-bottom-width: ' . (int) (esc_attr($header_border_height)) . 'px;' : '';
                if (!empty($header_bottom_border_color['rgba'])) {
                    $style .= 'border-bottom-color: '.esc_attr($header_bottom_border_color['rgba']).';';
                }

                $style .= 'border-bottom-style: solid;';
            }

            $customize_width = WGL_Framework::get_option('header' . $s . '_max_width_custom');
            if ($customize_width) {
                $max_width = WGL_Framework::get_option('header' . $s . '_max_width');
                $max_width = $max_width['width'];

                $style .= 'max-width: ' . esc_attr((int) $max_width) . 'px; margin-left: auto; margin-right: auto;';
            }

            return $style ? ' style="' . $style . '"' : '';
        }

        private function row_style_height($s = '_middle')
        {
            $header_height = WGL_Framework::get_option('header'.$s.'_height')['height'] ?? false;

            $style = '';

            switch ($this->html_render) {
                case 'mobile':
                    $style = '';
                    break;

                default:
                    if ($header_height) {
                        $style = 'height: '. (int) esc_attr($header_height) .'px; --header-height: ' . (int) esc_attr($header_height) . 'px;';
                    }
                    break;
            }

            return $style ? ' style="'. $style .'"' : '';
        }

        /**
         * Loop column class
         */
        private function column_class($s = '_middle', $area = '')
        {
            $dispay = WGL_Framework::get_option('header_column' . $s . '_' . $area . '_display');
            $v_align = WGL_Framework::get_option('header_column' . $s . '_' . $area . '_vert');
            $h_align = WGL_Framework::get_option('header_column' . $s . '_' . $area . '_horz');

            $column_class = !empty($dispay) ? ' display_' . $dispay : '';
            $column_class .= !empty($v_align) ? ' v_align_' . $v_align : '';
            $column_class .= !empty($h_align) ? ' h_align_' . $h_align : '';

            return $column_class;
        }

        /**
         * Generate header mobile menu
         */
        public function build_header_mobile_menu()
        {
            $header_queries = WGL_Framework::get_option('header_mobile_queris');

            if (
                'elementor' === $this->header_building_tool
                && !empty($this->header_page_select_id)
                && did_action('elementor/loaded')
            ) {
                $page_settings_manager = \Elementor\Core\Settings\Manager::get_settings_managers('page');
                $page_settings_model = $page_settings_manager->get_model($this->header_page_select_id);

                $header_queries = $page_settings_model->get_settings('mobile_breakpoint') ?? $header_queries;
            }

            $mobile_header_custom = WGL_Framework::get_option('mobile_header');
            $menu_occurrence = $mobile_header_custom ? WGL_Framework::get_option('mobile_position') : '';

            echo "<div class='mobile_nav_wrapper' data-mobile-width='$header_queries'>";
            echo '<div class="container-wrapper">';
                echo '<div class="wgl-menu_overlay"></div>';

                echo '<div class="wgl-menu_outer',
                    ($menu_occurrence ? ' menu-position_'.esc_attr($menu_occurrence) : ''), '">';

                    echo '<div class="wgl-menu-outer_header">',
                        '<div class="mobile-hamburger-close">',
                            '<div class="hamburger-box">',
                                '<div class="hamburger-inner">',
                                    '<span></span>',
                                    '<span></span>',
                                    '<span></span>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>';

                    echo '<div class="wgl-menu-outer_content">';
                        if (!empty($mobile_header_custom)) {
                            $this->get_menu_logo = true;
                            $this->build_header_layout('mobile_content');
                        } else {
                            echo '<div class="header_search search_mobile_menu">';
                                echo '<div class="header_search-field">';
                                    get_search_form();
                                echo '</div>';
                            echo '</div>';

                            echo '<nav class="primary-nav">';
                                echo !empty($logo) ? $logo : '';
                                if (has_nav_menu('main_menu')) {
                                    wgl_theme_main_menu('main_menu');
                                }
                            echo '</nav>';
                        }
                    echo '</div>';

                echo '</div>';
            echo '</div>';
            echo '</div>'; // mobile_nav_wrapper
        }

        public function get_logo($menu_condition = false, $_prefix = '')
        {
            $location = $this->html_render;

            if (
                'elementor' === $this->header_building_tool
                && !empty($this->header_page_select_id)
                && did_action('elementor/loaded')
            ) {
                $page_settings_manager = \Elementor\Core\Settings\Manager::get_settings_managers('page');
                $page_settings_model = $page_settings_manager->get_model($this->header_page_select_id);

                if ($page_settings_model->get_settings('use_custom'.$_prefix.'_logo')) {
                    $logo = $page_settings_model->get_settings('custom'.$_prefix.'_logo');

                    if ($page_settings_model->get_settings('enable'.$_prefix.'_logo_height')) {
                        $custom_size = $page_settings_model->get_settings('logo'.$_prefix.'_height');
                    }

                    if (!empty($logo)) $location = 'bottom';

                    $menu_condition = !empty($logo) ? false : true;
                }
            }

            new Motto_Get_Logo($location, $menu_condition, $logo ?? '', $custom_size ?? '');
        }

        /**
         * Get Header Search
         */
        public function search($html_render = '', $location = '')
        {
            $description = esc_html__('Type To Search', 'motto');
            $search_style = WGL_Framework::get_option('search_style') ?: 'standard';
            $search_post_type = WGL_Framework::get_option('search_post_type') ?: [];
            $unique_id = uniqid('search-form-');

            $render_search = true;
            if ($search_style === 'alt') {
                if ($this->html_render != 'sticky') {
                    $render_search = true;
                } else {
                    $render_search = false;
                }
            }
            if (
                'alt' === $search_style
                && self::$search_form_counter > 0
                && $this->html_render !== 'mobile'
            ) {
                $render_search = false;
            }

            $search_class = ' search_'.$search_style;

            $customize = WGL_Framework::get_option('bottom_header_item_search_custom');
            $customize = empty($customize) ? 'def' : 'color';

            $text_color = WGL_Framework::get_option('bottom_header_item_search_color_txt')['rgba'] ?? '';
            $text_color_hover = WGL_Framework::get_option('bottom_header_item_search_hover_color_txt')['rgba'] ?? '';

            $search_css_id = uniqid('motto_search_');

            // Start Custom CSS
            $styles = '';
            if ($this->html_render !== 'mobile') {
                ob_start();
                if ($customize == 'color') {
                    echo "#$search_css_id:hover {
                            color: ".($text_color_hover ? esc_attr($text_color_hover) : 'transparent')."  !important;
                        }";
                }
                $styles .= ob_get_clean();
            }

            // Register css
            if (!empty($styles)) {
                WGL_Framework::enqueue_css($styles);
            }

            unset($this->render_attributes);

            $this->add_render_attribute('search', 'class', [
                'wgl-search',
                'elementor-search',
                'header_search-button-wrapper'
            ]);

            $this->add_render_attribute('search', 'role', 'button');

            if (
                $this->html_render !== 'mobile'
                && $customize == 'color'
            ) {
                $this->add_render_attribute('search', 'style', [
                    'color: '.(!empty($text_color) ? esc_attr($text_color) : 'transparent').';'
                ]);
            }

            $this->add_render_attribute('search', 'id', $search_css_id);

            $inputs = '';
            if (!empty($search_post_type)) {
                if (count($search_post_type) === 1) {
                    $inputs .= '<input type="hidden" name="post_type" value="'.$search_post_type[0].'" />';
                } else{
                    foreach ($search_post_type as $key => $value) {
                        $inputs .= '<input type="hidden" name="post_type[]" value="'.$value.'" />';
                    }
                }
            }

            echo '<div class="header_search', esc_attr($search_class), '"', $this->row_style_height($location), '>';

                echo '<div', $this->get_render_attribute_string('search'), '>',
                    '<div class="header_search-button flaticon-search"></div>',
                    '<div class="header_search-close flaticon-close-button"></div>',
                '</div>';

                if ($render_search) {
                    echo '<div class="header_search-field">';
                        if ( 'alt' === $search_style ) {
                            echo '<div class="header_search-wrap">',
                                '<div class="wgl_theme_module_double_headings">',
                                    '<h3 class="header_search-heading_description heading_title">',
                                        apply_filters( 'wgl/search/description', $description ),
                                    '</h3>',
                                '</div>',
                                '<div class="header_search-close flaticon-close-button"></div>',
                            '</div>';
                        } else {
                            echo '<div class="header_search-close flaticon-close-button"></div>';
                        }
                        // search form
                        echo '<form role="search" method="get" action="', esc_url(home_url('/')), '" class="search-form">',
                            '<input',
                                ' required',
                                ' type="text"',
                                ' id="', esc_attr($unique_id), '"',
                                ' class="search-field"',
                                ' placeholder="', esc_attr_x('Search &hellip;', 'placeholder', 'motto'), '"',
                                ' value="', get_search_query(), '"',
                                ' name="s"',
                                '>',
                            '<input class="search-button" type="submit" value="', esc_attr__('Search', 'motto'), '">',
                            $inputs;
                            echo '<i class="search__icon flaticon-search"></i>',
                        '</form>';
                    echo '</div>';
                }

            echo '</div>';
        }

        public function get_side_panel_switcher()
        {
            echo '<div class="side_panel">',
                '<div class="side_panel_inner"', $this->side_panel_style_icon(), '>',
                    '<button class="side_panel-toggle" title="', esc_attr__('Open', 'motto'), '">',
                        '<span class="side_panel-toggle-inner">',
                            '<span></span>',
                            '<span></span>',
                            '<span></span>',
                            '<span></span>',
                            '<span></span>',
                            '<span></span>',
                            '<span></span>',
                            '<span></span>',
                            '<span></span>',
                        '</span>',
                    '</button>',
                '</div>',
            '</div>';
        }

        protected function side_panel_style_icon()
        {
            $icon_bg = WGL_Framework::get_option('bottom_header_side_panel_background')['rgba'] ?? '';
            $icon_color = WGL_Framework::get_option('bottom_header_side_panel_color')['rgba'] ?? '';

            $style = $icon_bg ? 'background-color: ' . esc_attr($icon_bg) . ';' : '';
            $style .= $icon_color ? 'color: ' . esc_attr($icon_color) . ';' : '';

            return $style ? ' style="' . $style . '"' : '';
        }

        public function login_in($location, $section)
        {
            $link = get_permalink( get_option('woocommerce_myaccount_page_id') );
            $query_args = [
                'action' => urlencode('signup_form'),
            ];
            $url = add_query_arg($query_args, $link);

            $link_logout = wp_logout_url( get_permalink( get_option('woocommerce_myaccount_page_id') ) );
            echo "<div class='login-in woocommerce'", $this->row_style_height($location), '>';

                echo '<span class="login-in_wrapper">';
                if (is_user_logged_in()) {
                    echo "<a class='login-in_link-logout button' href='", esc_url($link_logout), "'><span class='button__content'>", esc_html__('Logout', 'motto'), "</span></a>";
                } else {
                    echo "<a class='login-in_link button' href='", esc_url_raw($url), "'><span class='button__content'>", esc_html__('Login', 'motto'), '</span></a>';
                }

                echo '</span>';

                echo '<div class="login-modal wgl_modal-window">';
                    echo '<div class="overlay"></div>';
                    echo '<div class="modal-dialog modal_window-login">';
                        echo '<div class="modal_header"></div>';
                        echo '<div class="modal_content">';
	                        wc_get_template('myaccount/form-login.php');
                        echo '</div>';
                    echo '</div>';
                echo '</div>';
            echo '</div>';
        }

        /**
         * Header Cart
         */
        public function cart($location, $section)
        {
        	global $wgl_woo_cart;
	        $wgl_woo_cart = true;
            echo '<div class="wgl-mini-cart_wrapper">',
                '<div class="mini-cart woocommerce"', ( $this->row_style_height($location) ), '>',
                    $this->icon_cart(),
                '</div>',
            '</div>';
        }

        public function icon_cart()
        {
            $customize = WGL_Framework::get_option('bottom_header_cart_custom');
            $customize = empty($customize) ? 'def' : 'color';

            $text_color_idle = WGL_Framework::get_option('bottom_header_cart_color_txt')['rgba'] ?? '';
            $text_color_hover = WGL_Framework::get_option('bottom_header_cart_hover_color_txt')['rgba'] ?? '';

            $cart_css_id = uniqid('motto_woo_');

            // Enqueue CSS
            if (
                $this->html_render !== 'mobile'
                && $customize == 'color'
            ) {
                ob_start();
                if ($text_color_idle) {
                    echo "#$cart_css_id {
                        color: ", esc_attr($text_color_idle), ";
                    }";
                }
                if ($text_color_hover) {
                    echo "#$cart_css_id:hover {
                        color: ", esc_attr($text_color_hover), ";
                    }";
                }
                $styles = ob_get_clean();
            }
            if (!empty($styles)) {
                WGL_Framework::enqueue_css($styles);
            }

            unset($this->render_attributes);

            $this->add_render_attribute('cart', 'id', $cart_css_id);
            $this->add_render_attribute('cart', 'class', 'wgl-cart woo_icon elementor-cart');
            $this->add_render_attribute('cart', 'role', 'button');
            $this->add_render_attribute('cart', 'title', esc_attr__('Click to open Shopping Cart', 'motto'));

            ob_start();
            echo '<a', $this->get_render_attribute_string('cart'), '>',
                '<span class="woo_mini-count flaticon flaticon-shopping-cart">',
                    WC()->cart->cart_contents_count > 0 ? '<span>' . esc_html(WC()->cart->cart_contents_count) . '</span>' : '',
                '</span>',
            '</a>';

            return ob_get_clean();
        }

        public static function woo_cart()
        {
            ob_start();
                echo '<div class="wgl-woo_mini_cart">';
                    woocommerce_mini_cart();
                echo '</div>';

            return ob_get_clean();
        }

        public static function get_instance()
        {
            if (is_null(self::$instance)) {
                self::$instance = new self();
            }

            return self::$instance;
        }
    }

    new Motto_Get_Header();
}
