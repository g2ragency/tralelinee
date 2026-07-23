<?php
/**
 * Single Product Up-Sells
 *
 * This template is overriden by WebGeniusLab team for fine customizing.
 *
 * @see 	    https://docs.woocommerce.com/document/template-structure/
 * @package 	WooCommerce/Templates
 * @version     3.0.0
 */

defined('ABSPATH') || exit;

use WGL_Extensions\Includes\WGL_Carousel_Settings;
wp_enqueue_script('swiper', get_template_directory_uri() . '/js/swiper/js/swiper-bundle.min.js', array(), false, false);
wp_enqueue_style('swiper', get_template_directory_uri() . '/js/swiper/css/swiper-bundle.min.css');

if (class_exists('Motto_Core') && class_exists('WGL_Extensions_Core') && class_exists('\Elementor\Plugin')) {
    $related_carousel = true;
    $carousel_class = ' related-carousel';
}else{
    $related_carousel = false;
    $carousel_class = '';
}

$columns = (int) WGL_Framework::get_option('shop_related_columns');
$count = (int) WGL_Framework::get_option('shop_r_products_per_page');

if ( $upsells ) :
	?><section class="up-sells upsells products"><?php

        $heading = apply_filters( 'woocommerce_product_upsells_products_heading', __( 'You may also like&hellip;', 'motto' ) );

        if ( $heading ) :
            ?><h2><?php echo esc_html( $heading ); ?></h2><?php
        endif; ?>

        <div class="wgl-products-upsell wgl-products-wrapper columns-<?php echo esc_attr($columns) . esc_attr( $carousel_class ); ?>"> <?php

            woocommerce_product_loop_start();

            ob_start();

                foreach ( $upsells as $upsell ) :
                    $post_object = get_post( $upsell->get_id() );
                    setup_postdata( $GLOBALS['post'] =& $post_object );
                    wc_get_template_part( 'content', 'product' );
                endforeach;

                $products_items = ob_get_clean();

                $options = [
                    // General
                    'slides_per_row' => $columns,
                    'autoplay' => false,
                    'slide_per_single' => count((array)$upsells) > 5 ? false : true,
                    'slider_infinite' => count((array)$upsells) > 5 ? true : false,
                    'slides_transition' => 800,
                    'animation_triggered_by_mouse' => false,
                    // Pagination
                    'use_pagination' => false,
                    'pagination_type' => 'circle_border',
                    'pagination_dynamic' => false,
                    // Responsive
                    'customize_responsive' => true,
                    'widescreen_breakpoint' => 1601,
                    'widescreen_slides' => $count,
                    'desktop_breakpoint' => 993,
                    'desktop_slides' => $count,
                    'tablet_breakpoint' => 481,
                    'tablet_slides' => 2,
                    'mobile_breakpoint' => 280,
                    'mobile_slides' => 1,
                    'responsive_gap' => [
                        'desktop_gap' => ['size' => 30],
                        'tablet_gap'  => ['size' => 30],
                        'mobile_gap'  => ['size' => 30],
                    ],
                    'extra_class' => 'number_of_slides-'.count((array)$upsells),
                ];

                if ($related_carousel) {
                    echo WGL_Carousel_Settings::init( $options, $products_items );
                }else{
                    echo WGL_Framework::render_html($products_items);
                }

            woocommerce_product_loop_end();

        ?></div>
    </section><?php

endif;

wp_reset_postdata();
