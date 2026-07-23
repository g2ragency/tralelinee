<?php

defined('ABSPATH') || exit;

/**
 * The template for displaying all pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package motto
 * @since 1.0.0
 */

get_header();
the_post();

$sb = WGL_Framework::get_sidebar_data();
$row_class = $sb['row_class'] ?? '';
$column = $sb['column'] ?? '12';
$container_class = $sb['container_class'] ?? '';

// Render
echo '<div class="wgl-container', esc_attr(apply_filters('wgl/container/class', $container_class)), '">';
echo '<div class="row ', esc_attr(apply_filters('wgl/row/class', $row_class)), '">';

    echo '<div id="main-content" class="wgl_col-', esc_attr(apply_filters('wgl/column/class', $column)), '">';

        the_content(esc_html__('Read More!', 'motto'));

        WGL_Framework::link_pages();

        // Comments
        if (comments_open() || get_comments_number()) {
            comments_template();
        }

    echo '</div>';

    $sb && WGL_Framework::render_sidebar($sb);

echo '</div>';
echo '</div>';

get_footer();
