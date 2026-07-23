<?php

defined('ABSPATH') || exit;

/**
 * The template for displaying image attachments
 *
 * @package motto
 * @author WebGeniusLab <webgeniuslab@gmail.com>
 * @since 1.0.0
 */

get_header();

$sb = WGL_Framework::get_sidebar_data();
$row_class = $sb['row_class'] ?? '';
$container_class = $sb['container_class'] ?? '';
$column = $sb['column'] ?? '12';


echo '<div class="wgl-container', esc_attr(apply_filters('wgl/container/class', $container_class)), '">';
echo '<div class="row', esc_attr(apply_filters('wgl/row/class', $row_class)), '">';
    echo '<div id="main-content" class="wgl_col-', esc_attr(apply_filters('wgl/column/class', $column)), '">';
        while (have_posts()) :
            the_post();

            /**
            * Grab the IDs of all the image attachments in a gallery so we can get the URL of the next adjacent image in a gallery,
            * or the first image (if we're looking at the last image in a gallery), or, in a gallery of one, just the link to that image file
            */
            $attachments = array_values(get_children([
                'post_parent' => $post->post_parent,
                'post_status' => 'inherit',
                'post_type' => 'attachment',
                'post_mime_type' => 'image',
                'order' => 'ASC',
                'orderby' => 'menu_order ID',
            ]));

            foreach ($attachments as $k => $attachment) {
                if ($attachment->ID == $post->ID) {
                    break;
                }
            }
            $k++;

            // If there is more than 1 attachment in a gallery
            if (count($attachments) > 1) {
                if (isset($attachments[$k])) {
                    // get the URL of the next image attachment
                    $next_attachment_url = get_attachment_link($attachments[ $k ]->ID);
                } else {
                    // or get the URL of the first image attachment
                    $next_attachment_url = get_attachment_link($attachments[0]->ID);
                }
            } else {
                // or, if there's only 1 image, get the URL of the image
                $next_attachment_url = wp_get_attachment_url();
            }

            echo '<div class="blog-post">';
            echo '<div class="single_meta attachment_media">';
            echo '<div class="blog-post_content">';
                echo '<h4 class="blog-post_title">', esc_html(get_the_title()), '</h4>';

                echo '<div class="meta-data">';
                    WGL_Framework::posted_meta_on();
                echo '</div>';

                echo '<div class="blog-post_media">',
                    '<a href="', esc_url($next_attachment_url), '" title="', the_title_attribute(), '" rel="attachment">',
                        wp_get_attachment_image(get_the_ID(), [1170, 725]),
                    '</a>',
                '</div>';

                the_content();

                WGL_Framework::link_pages();

            echo '</div>';
            echo '</div>';
            echo '</div>'; // blog-post

            if (comments_open() || '0' != get_comments_number()) {
                comments_template();
            }
        endwhile;

    echo '</div>'; // #main-content

    $sb && WGL_Framework::render_sidebar($sb);

echo '</div>';
echo '</div>';

get_footer();
