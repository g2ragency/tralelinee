<?php
/**
 * The template for displaying product widget entries.
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/content-widget-reviews.php
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://docs.woocommerce.com/document/template-structure/
 * @package WooCommerce/Templates
 * @version 3.4.0
 */

defined('ABSPATH') || exit;

?>
<li class="wgl_mini-cart_flex">
	<?php do_action( 'woocommerce_widget_product_review_item_start', $args ); ?>

    <div class="wgl_mini-cart_image">
        <a href="<?php echo esc_url( get_comment_link( $comment->comment_ID ) ); ?>">
            <?php
            $image_url = wp_get_attachment_image_src( $product->get_image_id(), 'full', false );
            if(function_exists('aq_resize') && !!$image_url){
                $image_data = wp_get_attachment_metadata($product->get_image_id());
                $image_meta = $image_data['image_meta'] ?? array();
                $width = $height = apply_filters('wgl_woo_mini_thumbnail_size', '140');
                $image_url[0] = aq_resize($image_url[0], $width, $height, true, true, true);

                $image_meta['title'] = isset($image_meta['title']) ? $image_meta['title'] : "";

                echo "<img src='" . esc_url( $image_url[0] ) . "' alt='" . esc_attr($image_meta['title']) . "' />";
            }else{
                echo WGL_Framework::render_html($product->get_image()); // PHPCS:Ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            }
            ?>
        </a>
    </div>
    <div class="wgl_mini-cart_contents">
        <?php echo wc_get_rating_html( intval( get_comment_meta( $comment->comment_ID, 'rating', true ) ) );?>
        <a href="<?php echo esc_url( $product->get_permalink() ); ?>"><?php echo wp_kses_post( $product->get_name() ); ?></a>
        <span class="reviewer"><?php echo sprintf( esc_html__( 'By %s', 'motto' ), get_comment_author( $comment->comment_ID ) ); ?></span>
    </div>
	<?php do_action( 'woocommerce_widget_product_review_item_end', $args ); ?>
</li><?php
