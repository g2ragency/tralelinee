<?php
/**
 * Checkout coupon form
 *
 * This template is overridden by WebGeniusLab team.
 *
 * @see https://docs.woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 7.0.1
 */

defined( 'ABSPATH' ) || exit;

if ( ! wc_coupons_enabled() ) { // @codingStandardsIgnoreLine.
	return;
}

?>
<div class="woocommerce-form-coupon-toggle wgl-form-coupon-toggle closable">
	<?php wc_print_notice( apply_filters( 'woocommerce_checkout_coupon_message', esc_html__( 'Have a coupon?', 'motto' ) . ' <a href="#" class="showcoupon">' . esc_html__( 'Click here to enter your code', 'motto' ) . '</a>' ), 'notice' ); ?>

    <form class="checkout_coupon woocommerce-form-coupon d-none" method="post">

        <p class="form-row form-row-wide">
            <label class="screen-reader-text" for="coupon_code"><?php esc_html_e( 'Coupon code', 'motto' ); ?></label>
            <input type="text" name="coupon_code" class="input-text" placeholder="<?php esc_attr_e( 'Coupon code', 'motto' ); ?>" id="coupon_code" value="" />
            <button type="submit" class="icon flaticon-play" name="apply_coupon" value="<?php esc_attr_e( 'Apply coupon', 'motto' ); ?>"></button>
        </p>

        <div class="clear"></div>
    </form>

</div><?php
