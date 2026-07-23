<?php

$postID = get_the_ID();

$single = Motto_Single_Post::getInstance();
$single->set_post_data();
$single->set_image_data();
$post_format = $single->get_pf();
$video_style = 'video' === $post_format && function_exists('rwmb_meta') ? rwmb_meta('post_format_video_style') : '';

$hide_all_meta = WGL_Framework::get_option('single_meta');
$use_author_info = WGL_Framework::get_option('single_author_info');
$use_tags = WGL_Framework::get_option('single_meta_tags') && has_tag();
$use_shares = WGL_Framework::get_option('single_share') && function_exists('wgl_extensions_social');
$use_likes = WGL_Framework::get_option('single_likes') && function_exists('wgl_simple_likes');
$use_views = WGL_Framework::get_option('single_views') && function_exists('wgl_extensions_views');
$meta_cats = WGL_Framework::get_option('single_meta_categories');
$meta_date = WGL_Framework::get_option('single_meta_date');

$has_media = $single->meta_info_render;

$meta_data = $meta_cats_data = [];
if (!$hide_all_meta) {
	$meta_data['date'] = !WGL_Framework::get_option('blog_list_meta_date');
	$meta_data['comments'] = !WGL_Framework::get_option('single_meta_comments');
    $meta_data['author'] = !WGL_Framework::get_option('single_meta_author');
    $meta_cats_data['category'] = !WGL_Framework::get_option('blog_list_meta_categories');
}

switch ($single->get_pf()) {
	case 'link':
	case 'quote':
	case 'audio':
		$meta_within_media = false;
		break;
	default:
		$meta_within_media = true;
		break;
}
// Render?>
<article class="blog-post blog-post-single-item format-<?php echo esc_attr( $single->get_pf() ); ?>">
	<div <?php post_class( 'single_meta' ); ?>>
		<div class="item_wrapper">
			<div class="blog-post_content"><?php

				if (!$meta_cats && !$meta_within_media) {
					$single->render_post_meta($meta_cats_data, false);
				}

			    // Media
				if ($has_media) {
					$single->render_featured([
						'hide_all_meta' => $hide_all_meta,
						'meta_cats' => $meta_cats_data ?? []
					]);
				}

                // Title
				?><h1 class="blog-post_title"><?php echo get_the_title(); ?></h1><?php

				// Meta Data ?>
				<div class="meta_wrapper"><?php

					if (!$hide_all_meta) $single->render_post_meta($meta_data);

					if ( $use_views || $use_likes) { ?>
						<div class="meta-data"><?php

						// Views
						echo ( (bool)$use_views ? wgl_extensions_views()->get_post_views(get_the_ID()) : '' );

						// Likes
						if ($use_likes) {
							wgl_simple_likes()->likes_button(get_the_ID(), 0);
						}?>
						</div><?php
					}?>
				</div><?php

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
