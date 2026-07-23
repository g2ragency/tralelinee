<?php
global $wgl_products_atts;

extract($wgl_products_atts);

$widget_image_size = array();
if ($wgl_products_atts['atts']['img_size_string'] !== '') {
	$widget_image_size = [
		'img_size_string' => $wgl_products_atts['atts']['img_size_string'],
		'img_size_array' => $wgl_products_atts['atts']['img_size_array'] ?? [],
		'img_aspect_ratio' => $wgl_products_atts['atts']['img_aspect_ratio'],
	];
}

global $wgl_query_vars;


if(!empty($wgl_query_vars)){
    $query = $wgl_query_vars;
}

while ($query->have_posts()) : $query->the_post();
    global $product;

        ob_start();
            $class  = 'item';
            $products_layout = $wgl_products_atts['products_layout'] ?? '';
            $class .= 'carousel' === $products_layout ? ' swiper-slide' : '';
            wc_product_class($class, $product);
        $product_class = ob_get_clean();

        echo '<div '.$product_class.'>';
			/**
			 * Hook: woocommerce_before_shop_loop_item.
			 *
			 * @hooked woocommerce_template_loop_product_link_open - 10
			 */
			do_action( 'woocommerce_before_shop_loop_item' );

			$single = new Motto_Woocoommerce();
			/** with function woocommerce_show_product_loop_sale_flash */
			$single->woocommerce_template_loop_product_thumbnail($widget_image_size);

			/**
			 * Hook: woocommerce_shop_loop_item_title.
			 *
			 * @hooked woocommerce_template_loop_product_title - 10
			 */
			do_action( 'woocommerce_shop_loop_item_title' );

			/**
			 * Hook: woocommerce_after_shop_loop_item_title.
			 *
			 * @hooked woocommerce_template_loop_rating - 5
			 * @hooked woocommerce_template_loop_price - 10
			 */
			do_action( 'woocommerce_after_shop_loop_item_title' );

			/**
			 * Hook: woocommerce_after_shop_loop_item.
			 *
			 * @hooked woocommerce_template_loop_product_link_close - 5
			 * @hooked woocommerce_template_loop_add_to_cart - 10
			 */
			do_action( 'woocommerce_after_shop_loop_item' );

        echo '</div>';

endwhile;
wp_reset_postdata();
