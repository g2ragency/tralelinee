<?php
/**
 * The header for Motto theme
 *
 * This is the template that displays all of the <head> section and everything up until <main>
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package motto
 * @since 1.0.0
 */

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta http-equiv="Content-Type" content="<?php bloginfo( 'html_type' ); ?>; charset=<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
	
	<link rel="icon" type="image/x-icon" href="https://tralelinee.com/wp-content/uploads/2024/04/tll-favicon.png">
    <?php
    wp_head();
    ?>
</head>

<body
    <?php body_class();
    echo WGL_Framework::bg_body_style(); ?>
    data-mobile-width="<?php echo esc_attr(apply_filters( 'wgl/header/mobile_width', '1200' )); ?>">
    <?php
    wp_body_open();

    do_action( 'wgl/preloader' );

    do_action( 'wgl/elementor_pro/header' );

    if ( apply_filters( 'wgl/header/enable', true ) ) {
        get_template_part( 'templates/header/section', 'header' );
    }

    $page_title = apply_filters( 'wgl/page_title/enable', true );
    if ( isset($page_title[ 'page_title_switch' ] ) && $page_title[ 'page_title_switch' ] !== 'off' ) {
        get_template_part( 'templates/header/section', 'page_title' );
    }

    ?>
    <main id="main" class="site-main">