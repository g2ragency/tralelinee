<?php

defined('ABSPATH') || exit;

/**
 * Template for Page 404
 *
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package motto
 * @author WebGeniusLab <webgeniuslab@gmail.com>
 * @since 1.0.0
 */

get_header();

$layout_building_tool = WGL_Framework::get_option('404_building_tool');
if (
    'elementor' === $layout_building_tool
    && did_action('elementor/loaded')
) {

    $selected_page_id = WGL_Framework::get_option('404_template_select');
    $selected_page_id = wgl_dynamic_styles()->multi_language_support($selected_page_id, 'elementor_library');

    if (class_exists('\Elementor\Core\Files\CSS\Post')) {
        (new \Elementor\Core\Files\CSS\Post($selected_page_id))->enqueue();
    }

    echo \Elementor\Plugin::$instance->frontend->get_builder_content($selected_page_id);

} else {
    $styles = $section_padding_html = '';
    $bg_image = WGL_Framework::bg_render('404_page_main');
    $section_padding = WGL_Framework::get_option('404_page_main_padding');

    $section_padding_html .= !empty($section_padding['padding-top']) ? ' padding-top:' . (int) $section_padding['padding-top'] . 'px;' : '';
    $section_padding_html .= !empty($section_padding['padding-bottom']) ? ' padding-bottom:' . (int) $section_padding['padding-bottom'] . 'px;' : '';

    $styles .= $bg_image ?: '';
    $styles .= $section_padding_html ?: '';
    $styles_html = $styles ? ' style="' . esc_attr($styles) . '"' : "";

    $error_text_repeat = '<span>' . esc_html__('ERROR 404', 'motto') . '</span>';

    ?><div class="wgl-container full-width"<?php echo WGL_Framework::render_html($styles_html); ?>>
        <div class="row">
            <div class="wgl_col-12">
                <div class="error_page__num-wrap">
                    <div class="error_page__num"><?php
                        echo str_repeat($error_text_repeat,15);?>
                    </div>
                    <div class="error_page__num"><?php
                        echo str_repeat($error_text_repeat,15);?>
                    </div>
                </div>
                <section class="page_404_wrapper">
                    <div class="page_404_wrapper-container">
                        <div class="error_page row">
                            <div class="wgl_col-12">

                                <h2 class="error_page__title"><?php
                                    esc_html_e('Sorry! We can\'t find that page.', 'motto'); ?>
                                </h2>

                                <p class="error_page__description"><?php
                                    esc_html_e('The page you are looking for was moved, removed, renamed or never existed.', 'motto'); ?>
                                </p>

                                <div class="motto_404_search"><?php
                                    get_search_form(); ?>
                                </div>

                                <div class="motto_404__button elementor-widget-wgl-button has-magnetic">
                                    <a class="wgl-button btn-size-xl" data-magnetic-threshold="100" data-magnetic-strong="0.3" href="<?php echo esc_url(home_url('/')); ?>" role="button">
                                        <div class="button__content">
                                            <span class="button__text"><?php
                                                esc_html_e('GO HOME', 'motto'); ?>
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div><?php
}

get_footer();