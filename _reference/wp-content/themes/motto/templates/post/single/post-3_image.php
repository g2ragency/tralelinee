<?php

$single = Motto_Single_Post::getInstance();
$single->set_post_data();
$single->set_image_data();

$hide_all_meta = WGL_Framework::get_option('single_meta');

$has_media = $single->meta_info_render;

$meta_cats_data = $meta_comments_data = $meta_data = [];
if (!$hide_all_meta) {
	$meta_comments_data['comments'] = !WGL_Framework::get_option('single_meta_comments');
	$meta_data['date'] = !WGL_Framework::get_option('single_meta_date');
    $meta_data['author'] = !WGL_Framework::get_option('single_meta_author');
    $meta_cats_data['category'] = !WGL_Framework::get_option('single_meta_category');
}

$use_likes = WGL_Framework::get_option('single_likes') && function_exists('wgl_simple_likes');
$use_views = WGL_Framework::get_option('single_views') && function_exists('wgl_extensions_views');
$meta_comments = WGL_Framework::get_option('single_meta_comments');
$meta_cats = WGL_Framework::get_option('single_meta_categories');
$meta_date = WGL_Framework::get_option('single_meta_date');

$page_title_padding = WGL_Framework::get_mb_option('single_padding_layout_3', 'mb_post_layout_conditional', 'custom');
$page_title_padding_top = !empty($page_title_padding['padding-top']) ? (int)$page_title_padding['padding-top'] : '';
$page_title_padding_bottom = !empty($page_title_padding['padding-bottom']) ? (int)$page_title_padding['padding-bottom'] : '';
$page_title_styles = !empty($page_title_padding_top) ? 'padding-top: '.esc_attr((int) $page_title_padding_top).'px;' : '';
$page_title_styles .= !empty($page_title_padding_bottom) ? 'padding-bottom: '.esc_attr((int) $page_title_padding_bottom).'px;' : '';
$page_title_styles = $page_title_styles ? ' style="' . esc_attr($page_title_styles) . '"' : '';
$page_title_top = $page_title_padding_top ?: 200;

$apply_animation = WGL_Framework::get_mb_option('single_apply_animation', 'mb_post_layout_conditional', 'custom');
$data_attr_image = $data_attr_content = $post_class = '';

if ($apply_animation) {
    wp_enqueue_script('skrollr', get_template_directory_uri() . '/js/skrollr.min.js', [], false, false);

    $data_attr_image = ' data-center="background-position: 50% 0px;" data-top-bottom="background-position: 50% -100px;" data-anchor-target=".blog-post-single-item"';
	$data_attr_content = ' data-center="opacity: 1" data-'.esc_attr($page_title_top).'-top="opacity: 1" data-'.esc_attr($page_title_top)*0.4 .'-top="opacity: 1" data--100-top="opacity: 0" data-anchor-target=".blog-post-single-item .blog-post_content"';

	$post_class = ' blog_skrollr_init';
}

// Render
echo '<div class="blog-post', $post_class, ' blog-post-single-item format-', esc_attr($single->get_pf()), '"', $page_title_styles, '>'; ?>
<div <?php post_class('single_meta'); ?>>
	<div class="item_wrapper">
		<div class="blog-post_content"><?php

			// Media
			$single->render_featured_image_as_background( false, 'full', $data_attr_image); ?>

			<div class="wgl-container">
				<div class="row">
					<div class="content-container wgl_col-12"<?php echo WGL_Framework::render_html($data_attr_content); ?>><?php

						// cats
						if (!$meta_date) {
							$single->render_post_meta($meta_cats_data, false);
						}

						// Title ?>
						<h1 class="blog-post_title"><?php echo get_the_title(); ?></h1><?php

						// Meta Data ?>
						<div class="meta_wrapper"><?php

							if (!$hide_all_meta) $single->render_post_meta($meta_data);

							if ( $use_views || $use_likes || !$meta_comments) { ?>
								<div class="meta-data"><?php

								// Comments
								if (!$meta_comments) $single->render_post_meta($meta_comments_data, false);

								// Views
								echo ( (bool)$use_views ? wgl_extensions_views()->get_post_views(get_the_ID()) : '' );

								// Likes
								if ($use_likes) {
									wgl_simple_likes()->likes_button(get_the_ID(), 0);
								}?>
								</div><?php
							}?>
						</div><?php

						// Scroll Down
						if (WGL_Framework::get_option('single_scroll_down')) {
							echo '<div class="scroll_down">',
								'<a href="#main-content" class="scroll_down-button"><i class="flaticon flaticon-down-arrow-1"></i></a>',
							'</div>';
						}?>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</div><?php
