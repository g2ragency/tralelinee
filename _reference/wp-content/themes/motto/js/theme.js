"use strict";

wglIsVisibleInit();

jQuery(document).ready(function ($) {
    wglContentMinHeight();
    wglStickyInit();
    wglSearchInit();
    wglSidePanelInit();
    wglMobileHeader();
    wglWoocommerceHelper();
    wglWoocommerceLoginIn();
    wglInitTimelineAppear();
    wglAccordionInit();
    wglServicesAccordionInit();
    wglStripedServicesInit();
    wglProgressBarsInit();
    wglCarouselSwiper();
    wglFilterSwiper();
    wglImageComparison();
    wglCounterInit();
    wglCountdownInit();
    wglImgLayers();
    wglPageTitleParallax();
    wglExtendedParallax();
    wglPortfolioParallax();
    wglScrollUp();
    wglLinkOverlay();
    wglLinkScroll();
    wglSkrollrInit();
    wglStickySidebar();
    wglVideoboxInit();
    wglParallaxVideo();
    wglTabsHorizontalInit();
    wglShowcaseInit();
    wglShowcase2Init();
    wglCircuitService();
    wglSelectWrap();
    wglScrollAnimation();
    wglWoocommerceMiniCart();
    wglTextBackground();
    wglDynamicStyles();
    wglPieChartInit();
    wglButtonAnimation();
    wglTimelineHorizontal();
    wglInitStepsAppear();
    wglPhysicsButton();
    wglButton();
    wglTextEditor();
});

jQuery(window).load(function () {
    wglServiceInit();
    wglTabsInit();
    wglCursorInit();
    wglImagesGallery();
    wglIsotope();
    wglBlogMasonryInit();
    setTimeout(function(){
        jQuery('#preloader-wrapper').fadeOut();
    },1100);

    wglParticlesCustom();
    wglParticlesImageCustom();
    wglMenuLavalamp();
    jQuery(".wgl-currency-stripe_scrolling").each(function(){
        jQuery(this).simplemarquee({
            speed: 40,
            space: 0,
            handleHover: true,
            handleResize: true
        });
    })
});

jQuery(window).resize(function () {
    wglContentMinHeight();
})
