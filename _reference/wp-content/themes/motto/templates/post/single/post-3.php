<?php

$single = Motto_Single_Post::getInstance();
$single->set_post_data();
$post_format = $single->get_pf();

$use_author_info = WGL_Framework::get_option('single_author_info');
$use_tags = WGL_Framework::get_option('single_meta_tags') && has_tag();
$use_shares = WGL_Framework::get_option('single_share') && function_exists('wgl_extensions_social');

$video_style = 'video' === $post_format && function_exists('rwmb_meta') ? rwmb_meta('post_format_video_style') : '';

// Render?>
<article class="blog-post blog-post-single-item format-<?php echo esc_attr( $single->get_pf() ); ?>">
<div <?php post_class( 'single_meta' ); ?>>
<div class="item_wrapper">
<div class="blog-post_content"><?php

    // Media
    if (
        'standard-image' !==  $post_format
        && 'standard' !== $post_format
        && 'bg_video' !==  $video_style
    ) {
        // Affected post types: gallery, link, quote, audio, video-popup.
        $single->render_featured();
    }

    // Content
    the_content();

    WGL_Framework::link_pages();

    if ( $use_tags || $use_shares ) { ?>
        <div class="clear"></div>
        <div class="single_post_info"><?php
            // Tags
            if ($use_tags) {
                the_tags('<div class="tagcloud-wrapper"><div class="tagcloud">', ' ', '</div></div>');
            }
            // Socials
            if ($use_shares) {
                echo '<div class="share_post-container">';
                    wgl_extensions_social()->post_share();
                echo '</div>';
            }?>
        </div><?php
	}

    // Author Info
    if ($use_author_info) {
        $single->render_author_info();
    }?>

    <div class="clear"></div>
</div><!--blog-post_content-->
</div><!--item_wrapper-->
</div>
</article>
