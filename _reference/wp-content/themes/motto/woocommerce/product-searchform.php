<?php

defined('ABSPATH') || exit;

/**
 * The template for displaying product search form
 *
 * This template is overridden by WebGeniusLab team.
 *
 * @see        https://docs.woocommerce.com/document/template-structure/
 * @package    WooCommerce/Templates
 * @version    7.0.1
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

?>
<form role="search" method="get" class="woocommerce-product-search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label class="screen-reader-text" for="woocommerce-product-search-field-<?php echo isset( $index ) ? absint( $index ) : 0; ?>"><?php esc_html_e( 'Search for:', 'motto' ); ?></label>
	<input type="search" id="woocommerce-product-search-field-<?php echo isset( $index ) ? absint( $index ) : 0; ?>" class="search-field" placeholder="<?php echo esc_attr__( 'Search products&hellip;', 'motto' ); ?>" value="<?php echo get_search_query(); ?>" name="s" />
	<button class="search-button <?php echo esc_attr( wc_wp_theme_get_element_class_name( 'button' ) ? ' ' . wc_wp_theme_get_element_class_name( 'button' ) : '' ); ?>" type="submit" value="<?php echo esc_attr_x( 'Search', 'submit button', 'motto' ); ?>"><?php echo esc_html_x( 'Search', 'submit button', 'motto' ); ?></button>
    <i class="search__icon flaticon-search"></i>
	<input type="hidden" name="post_type" value="product" />
</form>
