<?php

defined('ABSPATH') || exit;

/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package motto
 * @since 1.0.0
 */

get_header();

$sb = WGL_Framework::get_sidebar_data();
$container_class = $sb['container_class'] ?? '';
$row_class = $sb['row_class'] ?? '';
$column = $sb['column'] ?? '12';

// Render
echo '<div class="wgl-container', esc_attr(apply_filters('wgl/container/class', $container_class)), '">';
echo '<div class="row', esc_attr(apply_filters('wgl/row/class', $row_class)), '">';

    echo '<div id="main-content" class="wgl_col-', esc_attr(apply_filters('wgl/column/class', $column)), '">';

        // Blog Archive Template
        get_template_part('templates/post/posts-list');

        // Pagination
        echo WGL_Framework::pagination();

    echo '</div>';

    $sb && WGL_Framework::render_sidebar($sb);

echo '</div>';
echo '</div>';

get_footer();
