<?php
/**
 * Product Loop Start
 *
 * This template is overridden by WebGeniusLab team.
 *
 * @see         https://docs.woocommerce.com/document/template-structure/
 * @package     WooCommerce/Templates
 * @version     3.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$animation = (bool) WGL_Framework::get_option('use_animation_shop');
$animation_style = WGL_Framework::get_option('shop_catalog_animation_style');

$classes = '';
if( !is_cart() ){
	$classes .= (bool)$animation ? ' appear-animation' : "";
	$classes .= (bool)$animation && !empty($animation_style) ? ' anim-'.$animation_style : "";
}elseif( class_exists('Motto_Core') && class_exists('WGL_Extensions_Core') ){
	$classes .= ' wgl-swiper-enable';
}

echo '<div class="wgl-products'.esc_attr($classes).'">';
