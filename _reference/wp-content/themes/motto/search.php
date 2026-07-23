<?php

defined('ABSPATH') || exit;

/**
 * The template for displaying search result page
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#search-result
 *
 * @package motto
 * @since 1.0.0
 */

get_header();

$sb = WGL_Framework::get_sidebar_data('blog_list');
$container_class = $sb['container_class'] ?? '';
$row_class = $sb['row_class'] ?? '';
$column = $sb['column'] ?? '12';

?>
<div class="wgl-container<?php echo apply_filters('wgl/container/class', $container_class); ?>">
<div class="row<?php echo apply_filters('wgl/row/class', $row_class); ?>">
    <div id='main-content' class="wgl_col-<?php echo apply_filters('wgl/column/class', $column); ?>">
        <?php
        if (have_posts()) :
            echo '<header class="searсh-header">',
                '<h1 class="page-title">',
                    esc_html__('Search Results for: ', 'motto'),
                    '<span>', get_search_query(), '</span>',
                '</h1>',
            '</header>';

            global $wgl_blog_atts;
            global $wp_query;

            $wgl_blog_atts = [
                'query' => $wp_query,
                // Layout
                'blog_layout' => 'grid',
                'blog_columns' => WGL_Framework::get_option('blog_list_columns') ?: '12',
                // Appearance
                'hide_media' => true,
                'hide_content' => WGL_Framework::get_option('blog_list_hide_content'),
                'hide_blog_title' => WGL_Framework::get_option('blog_list_hide_title'),
                'hide_all_meta' => 'yes',
                'meta_author' => WGL_Framework::get_option('blog_list_meta_author'),
                'meta_comments' => WGL_Framework::get_option('blog_list_meta_comments'),
                'meta_categories' => WGL_Framework::get_option('blog_list_meta_categories'),
                'meta_date' => WGL_Framework::get_option('blog_list_meta_date'),
                'hide_likes' => !WGL_Framework::get_option('blog_list_likes'),
                'hide_views' => !WGL_Framework::get_option('blog_list_views'),
                'hide_share' => !WGL_Framework::get_option('blog_list_share'),
                'read_more_hide' => WGL_Framework::get_option('blog_list_read_more'),
                'content_letter_count' => WGL_Framework::get_option('blog_list_letter_count') ?: '85',
                'read_more_text' => esc_html__('Read More', 'motto'),
                'heading_tag' => 'h3',
                'remainings_loading_btn_items_amount' => 4,
            ];

            // Blog Archive Template
            get_template_part('templates/post/posts-list');
            echo WGL_Framework::pagination();

        else :
            echo '<div class="page_404_wrapper">';
                echo '<header class="searсh-header">',
                    '<h1 class="page-title">',
                    esc_html__('Nothing found', 'motto'),
                    '</h1>',
                '</header>';

                echo '<div class="page-content">';
                    if (is_search()) :
                        echo '<p class="banner_404_text">';
                        esc_html_e('Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'motto');
                        echo '</p>';
                    else : ?>
                        <p class="banner_404_text"><?php esc_html_e('It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.', 'motto'); ?></p>
                        <?php
                    endif;
                    ?>
                    <div class="search_result_form">
                        <?php get_search_form(); ?>
                    </div>
                    <div class="motto_404__button">
                        <a class="wgl-button btn-size-xl" href="<?php echo esc_url(home_url('/')); ?>">
                            <div class="button__content">
                            <?php esc_html_e('Back to Home', 'motto'); ?>
                            </div>
                        </a>
                    </div>
                </div>

            </div>
            <?php
        endif;
    echo '</div>';

    $sb && WGL_Framework::render_sidebar($sb);

echo '</div>';
echo '</div>';

get_footer();
