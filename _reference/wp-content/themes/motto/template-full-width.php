<?php

defined('ABSPATH') || exit;

/**
 * The Full-width template
 *
 * @package motto
 * @author WebGeniusLab <webgeniuslab@gmail.com>
 * @since 1.0.0
 */

get_header();
the_post();

$sb = WGL_Framework::get_sidebar_data();
$container_class = $sb['container_class'] ?? '';
$row_class = $sb['row_class'] ?? '';
$column = $sb['column'] ?? '12';

// Render
echo '<div class="wgl-container full-width', esc_attr(apply_filters('wgl/container/class', $container_class)), '">';
echo '<div class="row', esc_attr(apply_filters('wgl/row/class', $row_class)), '">';

    echo '<div id="main-content" class="wgl_col-', esc_attr(apply_filters('wgl/column/class', $column)), '">';

        the_content(esc_html__('Read More!', 'motto'));

        WGL_Framework::link_pages();

        if (comments_open() || get_comments_number()) {
            comments_template();
        }

    echo '</div>';

    $sb && WGL_Framework::render_sidebar($sb);

echo '</div>';
echo '</div>';

get_footer();
