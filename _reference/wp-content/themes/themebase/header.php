<?php
/**
 * The header for our theme
 *
 * @package WP_Bootstrap_Starter
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <link rel="profile" href="http://gmpg.org/xfn/11">
	
  <!-- SEO base -->
  <title>Tra Le Linee – Sistemi di influenza integrati</title>

  <meta name="description" content="Agenzia di comunicazione cross mediale e interdisciplinare specializzata nell'elaborazione e gestione di sistemi di influenza integrati.">

  <meta name="keywords" content="agenzia, agenzia di comunicazione, speculative design, branding, comunicazione, UI/UX design, media relation, PR, Digital strategy, eventi">

  <meta name="robots" content="index,follow">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Open Graph (Facebook, LinkedIn, WhatsApp, ecc.) -->
  <meta property="og:title" content="Tra Le Linee – Sistemi di influenza integrati">
  <meta property="og:description" content="Agenzia di comunicazione cross mediale e interdisciplinare specializzata nell'elaborazione e gestione di sistemi di influenza integrati.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tralelinee.com">
  <meta property="og:site_name" content="Tra Le Linee">
  <!-- Sostituisci l'URL sotto con l'immagine reale della hero -->
  <meta property="og:image" content="https://tralelinee.com/wp-content/uploads/2025/11/Tra-Le-Linee.jpg">
  <meta property="og:locale" content="it_IT">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Tra Le Linee – Sistemi di influenza integrati">
  <meta name="twitter:description" content="Agenzia di comunicazione cross mediale e interdisciplinare specializzata nell'elaborazione e gestione di sistemi di influenza integrati.">
  <!-- Stessa immagine dell'OG o una dedicata -->
  <meta name="twitter:image" content="https://tralelinee.com/wp-content/uploads/2025/11/Tra-Le-Linee.jpg">

  <!-- FONT -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap" rel="stylesheet">

  <!-- SWIPER -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />

  <!-- LENIS -->
  <script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis"></script>

  <!-- GSAP -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

  <!-- SplitType -->
  <script src="https://unpkg.com/split-type"></script>
	
  <!-- Google Search Console -->
  <meta name="google-site-verification" content="wiVheDmmx5VICM-_UMtMS7ktwnG2zzixWZbxneCqdMU" />	

  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

  <?php
  if (function_exists('wp_body_open')) {
    wp_body_open();
  } else {
    do_action('wp_body_open');
  }
  ?>

  <div id="page" class="site">
    <header id="masthead" class="site-header" role="banner">
      <nav>
        <div class="container-fluid custom-header">
          <div class="row">
            <div class="col-md-3 col-6 h-logo">
              <!-- Logo scuro per tema chiaro -->
				<div>


<div class="logo-theme logo-dark">
  <span class="logo-letter">|</span>

  <!-- TRA -->
  <span class="hoverable">
    <span class="logo-letter">T</span>
    <span class="logo-reveal">
      <span class="logo-letter">R</span>
      <span class="logo-letter">A</span>
    </span>
  </span>

  <span class="logo-letter">|</span>
	 <span class="hoverable">
	  <span class="logo-letter">L</span>
	 <span class="logo-reveal">
      <span class="logo-letter">E</span>
	</span>
	</span>

  <span class="logo-letter">|</span>

  <!-- LINEE -->
  <span class="hoverable">
    <span class="logo-letter">L</span>
    <span class="logo-reveal">
      <span class="logo-letter">I</span>
      <span class="logo-letter">N</span>
      <span class="logo-letter">E</span>
      <span class="logo-letter">E</span>
    </span>
  </span>

  <span class="logo-letter">|</span>
</div>

<div class="logo-theme logo-light">
  <span class="logo-letter">|</span>

  <!-- TRA -->
  <span class="hoverable">
    <span class="logo-letter">T</span>
    <span class="logo-reveal">
      <span class="logo-letter">R</span>
      <span class="logo-letter">A</span>
    </span>
  </span>

  <span class="logo-letter">|</span>
		 <span class="hoverable">
	  <span class="logo-letter">L</span>
	 <span class="logo-reveal">
      <span class="logo-letter">E</span>
	</span>
	</span>
  <span class="logo-letter">|</span>

  <!-- LINEE -->
  <span class="hoverable">
    <span class="logo-letter">L</span>
    <span class="logo-reveal">
      <span class="logo-letter">I</span>
      <span class="logo-letter">N</span>
      <span class="logo-letter">E</span>
      <span class="logo-letter">E</span>
    </span>
  </span>

  <span class="logo-letter">|</span>
</div>
					
					
				</div>
            </div>
            <div class="col-md-6 col-6 hambergur">
              <div class="d-flex justify-content-end align-items-center">
                <div class="menu-items d-none d-xl-flex">
					<div>
						
					
                  <?php
                  wp_nav_menu(array(
                    'theme_location' => 'primary',
                    'menu_class' => 'main-menu',
                    'container' => false,
                  ));
                  ?>
						</div>
                </div>
				    <button id="theme-switcher" class="theme-toggle d-none d-xl-flex">
                Dark
              </button>
				      <div class="right-header d-flex d-xl-none">
				
              <button class="navbar-toggler menu-hamburger" type="button" data-bs-toggle="offcanvas" data-bs-target="#main-nav" aria-controls="offcanvasExample">
                <span class="navbar-toggler-icon"></span>
              </button>
            </div>
              </div>
            </div>
			
          </div>
        </div>
		  
		  	
      </nav>
		
		  <div class="offcanvas offcanvas-start" tabindex="-1" id="main-nav" aria-labelledby="offcanvasExampleLabel">
            <div class="container">
              <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasExampleLabel" style="font-size: 0.95rem;">
        <div class="logo-theme logo-dark">
            <span class="logo-letter">|</span>
            <span class="hoverable">
                <span class="logo-letter">T</span>
                <span class="logo-reveal">
                    <span class="logo-letter">R</span>
                    <span class="logo-letter">A</span>
                </span>
            </span>
            <span class="logo-letter">|</span>
            <span class="hoverable">
                <span class="logo-letter">L</span>
                <span class="logo-reveal">
                    <span class="logo-letter">E</span>
                </span>
            </span>
            <span class="logo-letter">|</span>
            <span class="hoverable">
                <span class="logo-letter">L</span>
                <span class="logo-reveal">
                    <span class="logo-letter">I</span>
                    <span class="logo-letter">N</span>
                    <span class="logo-letter">E</span>
                    <span class="logo-letter">E</span>
                </span>
            </span>
            <span class="logo-letter">|</span>
        </div>

        <div class="logo-theme logo-light">
            <span class="logo-letter">|</span>
            <span class="hoverable">
                <span class="logo-letter">T</span>
                <span class="logo-reveal">
                    <span class="logo-letter">R</span>
                    <span class="logo-letter">A</span>
                </span>
            </span>
            <span class="logo-letter">|</span>
            <span class="hoverable">
                <span class="logo-letter">L</span>
                <span class="logo-reveal">
                    <span class="logo-letter">E</span>
                </span>
            </span>
            <span class="logo-letter">|</span>
            <span class="hoverable">
                <span class="logo-letter">L</span>
                <span class="logo-reveal">
                    <span class="logo-letter">I</span>
                    <span class="logo-letter">N</span>
                    <span class="logo-letter">E</span>
                    <span class="logo-letter">E</span>
                </span>
            </span>
            <span class="logo-letter">|</span>
        </div>
    </h5>
    <button type="button" class="btn-close text-reset" style="color:#333 !important;" data-bs-dismiss="offcanvas" aria-label="Close"></button>
</div>
				<div class="m-main-menu">
					
				
              <?php
              wp_nav_menu(array(
                'theme_location'    => 'primary',
                'menu_id'         => false,
                'menu_class'      => 'navbar-nav flex-column mb-3',
                'depth'           => 3
              
               
              ));
              ?>
					</div>
					<div class="offcanvas-body pt-5">
						<h5 class="offcanvas-title mb-3" id="offcanvasExampleLabel" style="font-size: 0.95rem;"></h5>

						 <div>
							<button id="theme-switcher-mobile" class="theme-toggle">
								Dark
							</button>
						</div>

				</div>
            </div>
          </div>
    </header>
	  
	<div id="cursor"></div>
	<div id="cursor-shadow"></div>  
	  
	  

    <div class="cursor"></div>
    <div id="content" class="site-content">
