<?php

defined('ABSPATH') || exit;

if (!class_exists('Motto_Header_Cart')) {
    class Motto_Header_Cart extends Motto_Get_Header
    {
        public function __construct()
        {
            if (!class_exists('\WooCommerce')) {
                return;
            }

            $this->header_vars();

            global $wgl_woo_cart;
            if (!empty($wgl_woo_cart)) { ?>
                <div class="wgl-cart-header">
                    <div class="wgl-mini-cart_wrapper">
                    <div class="mini-cart woocommerce">
                        <?php echo self::woo_cart(); ?>
                    </div>
                    </div>
                </div><?php
            }
        }
    }

    new Motto_Header_Cart();
}
