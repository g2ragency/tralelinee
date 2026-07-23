<?php

defined('ABSPATH') || exit;

use WGL_Extensions\Templates\Wgl_Blog_Hero;

/**
 * The default template for single posts rendering
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package motto
 * @author WebGeniusLab <webgeniuslab@gmail.com>
 * @since 1.0.0
 */

get_header();
the_post();

$sb = WGL_Framework::get_sidebar_data('single');
$container_class = $sb['container_class'] ?? '';
$row_class = $sb['row_class'] ?? '';
$column = $sb['column'] ?? '12';
$layout = $sb['layout'] ?? '';

$single_type = WGL_Framework::get_mb_option('single_type_layout', 'mb_post_layout_conditional', 'custom') ?: 2;
$single_scroll_to = WGL_Framework::get_option('single_scroll_down') ? 'elementor-menu-anchor ' : '';

$row_class .= ' single_type-' . $single_type;

if ('3' === $single_type) {
    $featured_bg_style = 'background-color: ' . WGL_Framework::get_option('post_single_layout_3_bg_image')['background-color'] . ';'
        .  ' margin-bottom: ' . (int) WGL_Framework::get_mb_option('page_title_margin', 'mb_page_title_switch', 'on')['margin-bottom'] . 'px;';

	echo '<div class="post_featured_bg" style="', esc_attr($featured_bg_style), '">';
        get_template_part('templates/post/single/post', $single_type . '_image');
    echo '</div>';
}

//* Render
echo '<div class="wgl-container', esc_attr(apply_filters('wgl/container/class', $container_class)), '">';
echo '<div class="row', esc_attr(apply_filters('wgl/row/class', $row_class)), '">';

	echo '<div id="main-content" class="'.$single_scroll_to.'wgl_col-', esc_attr(apply_filters('wgl/column/class', $column)), '">';

        get_template_part('templates/post/single/post', $single_type);

        //* Navigation
        get_template_part('templates/post/post-navigation');

        //* ↓ Related Posts
        $related_posts_enabled = WGL_Framework::get_option('single_related_posts');

        if (
            class_exists('RWMB_Loader')
            && !empty($mb_blog_show = rwmb_meta('mb_blog_show_r'))
            && 'default' !== $mb_blog_show
        ) {
            $related_posts_enabled = 'off' === $mb_blog_show ? null : $mb_blog_show;
        }

        if (
            $related_posts_enabled
            && class_exists('\WGL_Extensions\Templates\WGL_Blog')
            && class_exists('\Elementor\Plugin')
        ) {
            global $wgl_related_posts;
            $wgl_related_posts = true;

            $related_cats = [];
            $cats = WGL_Framework::get_option('blog_cat_r');
            if (!empty($cats)) {
                $related_cats[] = implode(',', $cats);
            }

            if (
                class_exists('RWMB_Loader')
                && get_queried_object_id() !== 0
                && 'custom' === $mb_blog_show
            ) {
                $related_cats = get_post_meta(get_the_id(), 'mb_blog_cat_r');
            }

	        //* Get Cats_Slug
	        $posts_quantity_confirmed = false;
	        if ($categories = get_the_category()) {
		        $post_categ = $post_category_compile = '';
		        foreach ($categories as $category) {
			        $post_categ = $post_categ . $category->slug . ',';
			        if($category->count > 1){
				        $posts_quantity_confirmed = true;
			        }
		        }
		        $post_category_compile .= '' . trim($post_categ, ',') . '';

		        if (!empty($related_cats[0])) {
			        $categories = get_categories(['include' => $related_cats[0]]);
			        $post_categ = $post_category_compile = '';
			        foreach ($categories as $category) {
				        $post_categ = $post_categ . $category->slug . ',';
			        }
			        $post_category_compile .= trim($post_categ, ',');
		        }

		        $related_cats = $post_category_compile;
	        }

	        if ($posts_quantity_confirmed) :
            //* Render
            echo '<section class="single related_posts">';
                $related_module_title = WGL_Framework::get_mb_option('blog_title_r', 'mb_blog_show_r', 'custom');

                echo '<div class="motto_module_title">',
	                '<h4>',
                        esc_html($related_module_title) ?: esc_html__('Related Posts', 'motto'),
                   '</h4>',
                '</div>';

                $carousel_layout = WGL_Framework::get_mb_option('blog_carousel_r', 'mb_blog_show_r', 'custom');
                $columns_amount = WGL_Framework::get_mb_option('blog_column_r', 'mb_blog_show_r', 'custom');
                $posts_amount = WGL_Framework::get_mb_option('blog_number_r', 'mb_blog_show_r', 'custom');

                $related_posts_atts = [
                    'blog_layout' => $carousel_layout ? 'carousel' : 'grid',
                    'navigation_type' => 'none',
                    'hide_content' => true,
                    'hide_share' => true,
                    'hide_likes' => true,
                    'hide_views' => true,
                    'meta_author' => true,
                    'meta_comments' => true,
                    'media_link' => true,
                    'read_more_hide' => false,
                    'read_more_text' => esc_html__('Read More', 'motto'),
                    'heading_tag' => 'h4',
                    'content_letter_count' => 90,
                    'img_size_string' => '840x740',
                    'img_size_array' => '',
                    'img_aspect_ratio' => '',
                    'remainings_loading_btn_items_amount' => 4,
                    'load_more_text' => esc_html__('Load more', 'motto'),
                    'blog_columns' => $columns_amount ?? (('none' == $layout) ? '4' : '6'),
                    // Carousel General
                    'autoplay' => '',
                    'autoplay_speed' => 3000,
                    'slider_infinite' => false,
                    'animation_triggered_by_mouse' => false,
                    'slide_per_single' => 1,
                    'slides_transition' => 800,
                    'animation_style' => '',
                    'fade_animation' => '',
                    // Carousel Pagination
                    'use_pagination' => '',
                    'pagination_type' => 'circle_border',
                    'pagination_dynamic' => false,
                    // Carousel Navigation
                    'use_navigation' => '',
                    'navigation_position' => '',
                    // Carousel Responsive
                    'customize_responsive' => true,
                    'widescreen_breakpoint' => 1601,
                    'widescreen_slides' => '',
                    'desktop_breakpoint' => 1201,
                    'desktop_slides' => '',
                    'tablet_breakpoint' => 768,
                    'tablet_slides' => '',
                    'mobile_breakpoint' => 280,
                    'mobile_slides' => '',
                    // Query
                    'number_of_posts' => (int) $posts_amount,
                    'categories' => $related_cats,
                    'order_by' => 'rand',
                    'exclude_any' => 'yes',
                    'by_posts' => [$post->post_name => $post->post_title] //* exclude current post
                ];

                (new Wgl_Blog_Hero())->render($related_posts_atts);

            echo '</section>';
	        endif;

            unset($wgl_related_posts); // destroy globar var
        }
        //* ↑ related posts

        //* Comments
        if (comments_open() || get_comments_number()) {
            echo '<div class="row">';
            echo '<div class="wgl_col-12">';
                comments_template();
            echo '</div>';
            echo '</div>';
        }

    echo '</div>'; //* #main-content

    $sb && WGL_Framework::render_sidebar($sb);

echo '</div>';
echo '</div>';

get_footer();
