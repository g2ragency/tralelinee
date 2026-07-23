<?php

use WGL_Extensions\Includes\WGL_Elementor_Helper;

global $wgl_blog_atts;

// Default settings for blog item
$trim = true;
if (!$wgl_blog_atts) {
    global $wp_query;

    $trim = false;

    $wgl_blog_atts = [
        'query' => $wp_query,
        // General
        'blog_layout' => 'grid',
        // Content
        'blog_columns' => WGL_Framework::get_option('blog_list_columns') ?: '12',
        'hide_media' => WGL_Framework::get_option('blog_list_hide_media'),
        'hide_content' => WGL_Framework::get_option('blog_list_hide_content'),
        'hide_blog_title' => WGL_Framework::get_option('blog_list_hide_title'),
        'hide_all_meta' => WGL_Framework::get_option('blog_list_meta'),
        'meta_author' => WGL_Framework::get_option('blog_list_meta_author'),
        'meta_comments' => WGL_Framework::get_option('blog_list_meta_comments'),
        'meta_categories' => WGL_Framework::get_option('blog_list_meta_categories'),
        'meta_date' => WGL_Framework::get_option('blog_list_meta_date'),
        'hide_likes' => !WGL_Framework::get_option('blog_list_likes'),
        'hide_share' => !WGL_Framework::get_option('blog_list_share'),
        'hide_views' => !WGL_Framework::get_option('blog_list_views'),
        'read_more_hide' => WGL_Framework::get_option('blog_list_read_more'),
        'content_letter_count' => WGL_Framework::get_option('blog_list_letter_count') ?: '85',
        'heading_tag' => 'h3',
        'read_more_text' => esc_html__('Read more', 'motto'),
        'remainings_loading_btn_items_amount' => 4,
    ];
}

// Retrieve arrived|default variables
extract($wgl_blog_atts);

global $wgl_query_vars;
if (!empty($wgl_query_vars)) {
    $query = $wgl_query_vars;
}

$kses_allowed_html = [
    'a' => [
        'href' => true, 'title' => true,
        'class' => true, 'style' => true,
        'rel' => true, 'target' => true,
    ],
    'br' => ['class' => true, 'style' => true],
    'b' => ['class' => true, 'style' => true],
    'em' => ['class' => true, 'style' => true],
    'strong' => ['class' => true, 'style' => true],
    'span' => ['class' => true, 'style' => true],
];

// Variables validation
$img_size = $img_size ?? 'full';
$img_aspect_ratio = $img_aspect_ratio ?? '';

$hide_share = $hide_share ?? '';
$media_link = $media_link ?? false;
$hide_views = $hide_views ?? false;

// Meta
$meta_data = $meta_cats_data = [];
if (!$hide_all_meta) {
	$meta_cats_data['category'] = !$meta_categories;
    $meta_data['date'] = !$meta_date;
	$meta_data['author'] = !$meta_author;
	$meta_data['comments'] = !$meta_comments;
    $use_likes = !$hide_likes;
    $use_views = !$hide_views;
    $use_shares = !$hide_share;
}

// Loop through query
while ($query->have_posts()) :
    $query->the_post();

    $post_img_size = class_exists('WGL_Extensions\Includes\WGL_Elementor_Helper')
        ? WGL_Elementor_Helper::get_image_dimensions($img_size, $img_aspect_ratio)
        : 'full';

    $single = Motto_Single_Post::getInstance();
    $single->set_post_data();
    $single->set_image_data($post_img_size);

    $has_media = $single->meta_info_render;

    $blog_post_classes = ' blog-hero';
    $blog_post_classes .= ' format-' . $single->get_pf();
	$blog_post_classes .= is_sticky() ? ' sticky-post' : '';
	$blog_post_classes .= $read_more_hide ? ' no-readmore' : '';
	$blog_post_classes .= !$has_media || $hide_media ? ' format-no_featured format-standard hide_media' : '';

    // Render
    $item_class  = 'item';
    $item_class .= ' wgl_col-' . $blog_columns;
    $item_class .= 'carousel' === $blog_layout ? ' swiper-slide' : '';
    ?>
    <div class="<?php echo esc_attr($item_class); ?>">
    <div class="blog-post<?php echo esc_attr($blog_post_classes); ?>">
    <div class="blog-post_wrapper"><?php

    // Media
    if (!$hide_media && $has_media) {
        $single->render_featured_image_as_background();
    }

    ?>
    <div class="blog-post_content"><?php

    if ($media_link) {
        echo '<a href="', esc_url(get_permalink()), '" class="media-link image-overlay"></a>';
    } else {
        echo '<div class="image-overlay"></div>';
    }

    echo '<div class="blog-post_content-top">';

    // Media alt (link, quote, audio...)
    if (!$hide_media && !$has_media) {
        if ('audio' !== $single->get_pf()) {
            $single->render_post_meta($meta_cats_data, $wrapper = false);
        }
        $single->render_featured();
        if ('audio' == $single->get_pf()) {
            $single->render_post_meta($meta_cats_data, $wrapper = false);
        }
    }

    if (!$hide_media && $has_media) {
        // Cat
        $single->render_post_meta($meta_cats_data, $wrapper = false);
    }

    echo '</div>';

    echo '<div class="blog-post_content-bot">';


    if (!$hide_all_meta) {

        ?><div class="post_meta-wrap"><?php

            // Data
            $single->render_post_meta($meta_data);

        ?></div><?php
	}

    // Title
    $title = get_the_title();
    $title_class = 'blog-post_title';
    $data_title = '';

    if ($crop_words_title) {
        $title_class .= ' limit-characters';
        $title_strip_tags = strip_tags($title);
        $title_strip_tags = trim($title_strip_tags);
        $title_limit = WGL_Framework::modifier_character($title_strip_tags, $title_letter_count, '...', !(bool)$break_words_title);
        $data_title = ' data-title="'.$title_limit.'"';
    }

    if (
        !$hide_blog_title
    ) {
        printf(
            '<%1$s title="%4$s" class="%5$s"><a%6$s href="%2$s"><span>%3$s</span></a></%1$s>',
            esc_html($heading_tag),
            esc_url(get_permalink()),
            wp_kses($title, $kses_allowed_html),
            $title,
            $title_class,
            $data_title
        );
    }

    // Excerpt|Content
    if (!$hide_content) {
        $single->render_excerpt($content_letter_count, $trim);

        WGL_Framework::link_pages();
    }

    // Read more
    if (!$read_more_hide) {
    ?><div class="clear"></div><div class="blog-post_footer">
            <div class="read-more-wrap">
                <a href="<?php echo esc_url(get_permalink()); ?>" class="button-read-more"><?php
                    if (!empty($read_more_text)) {
                    echo '<span>' . esc_html($read_more_text) . '</span>';
                }
                ?>
                </a>
            </div>
        </div><?php
    }?>
    </div>
    </div>
    </div>
    </div>
    </div><?php

endwhile;
wp_reset_postdata();