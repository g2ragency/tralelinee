<?php

if (!class_exists('Motto_Get_Logo')) {
    /**
     * Header Logotype
     *
     *
     * @package motto\templates
     * @author WebGeniusLab <webgeniuslab@gmail.com>
     * @since 1.0.0
     */
    class Motto_Get_Logo
    {
        public function __construct(
            $header = 'bottom',
            $menu = false,
            $custom_img = false,
            $custom_height = false
        ) {
            if ('mobile' == $header) {
                $this->mobileLogo($menu);
                return;
            }

            $this->defaultLogo($header, $custom_img, $custom_height);
        }

        private static function defaultLogo(
            $header,
            $custom_img,
            $custom_height
        ) {
            $logo = $custom_img ?: WGL_Framework::get_option('header_logo');
            $height_limit = WGL_Framework::get_option('logo_height_custom');
            $logo_height = WGL_Framework::get_option('logo_height')['height'] ?? '';

            if (
                !$custom_img
                && 'sticky' == $header
                && $sticky_logo = WGL_Framework::get_option('sticky_header_logo')
            ) {
                $logo = $sticky_logo;
                $height_limit = WGL_Framework::get_option('sticky_logo_height_custom');
                $logo_height = WGL_Framework::get_option('sticky_logo_height')['height'] ?? '';
            }

            if ($custom_height) {
                $logo_height = $custom_height;
            }

            if ($height_limit || $custom_height) {
                $style = $logo_height ? 'height: ' . esc_attr((int) $logo_height) . 'px;' : '';
                $style = $style ? ' style="' . $style . '"' : '';
            }

            self::render(
                'default_logo', // class
                $logo['url'] ?? '',
                $logo['id'] ?? '',
                $style ?? ''
            );
        }

        private function mobileLogo($menu)
        {
            $menu = !empty($menu) ? '_menu' : '';
            $logo = WGL_Framework::get_option('logo_mobile' . $menu);
            $src = $logo['url'] ?? '';

            if (WGL_Framework::get_option('mobile_logo' . $menu . '_height_custom')) {
                $height = WGL_Framework::get_option('mobile_logo' . $menu . '_height')['height'] ?? '';
            }

            // If no `menu logo`, use `mobile logo` options instead
            if ($menu && !$src) {
                $logo = WGL_Framework::get_option('logo_mobile');
                $height = WGL_Framework::get_option('mobile_logo_height')['height'] ?? '';
            }

            if (isset($height)) {
                $style = $height ? 'height: ' . esc_attr((int) $height) . 'px;' : '';
                $style = $style ? ' style="' . $style . '"' : '';
            }

            self::render(
                $menu ? 'logo-menu' : 'logo-mobile', // class
                $src,
                $logo['id'] ?? '',
                $style ?? ''
            );
        }

        private static function render(
            $class,
            $src,
            $id,
            $style
        ) {
            $alt = get_post_meta($id, '_wp_attachment_image_alt', true);

            echo '<div class="wgl-logotype-container ', esc_attr($class), '">';
            echo '<a href="', esc_url(home_url('/')), '">';
            if ($src) {
                echo '<img',
                    ' class="', $class, '"',
                    ' src="', esc_url($src), '"',
                    ' alt="', esc_attr($alt) ?: 'logotype', '"',
                    $style,
                    '>';
            } else {
                echo '<h1 class="logo-name">',
                    get_bloginfo('name'),
                '</h1>';
            }
            echo '</a>';
            echo '</div>';
        }
    }
}
