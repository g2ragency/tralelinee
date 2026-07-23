<?php
class Elementor_Widget_Swiper_Partners extends \Elementor\Widget_Base {

    public function __construct($data = [], $args = null) {
        parent::__construct($data, $args);
        wp_register_style('swiper-partners-css', plugin_dir_url(__FILE__) . 'swiper-partners.css');
    }

    public function get_style_depends() {
        return ['swiper-partners-css'];
    }

    public function get_name() {
        return 'swiper-partners';
    }

    public function get_title() {
        return __('Slider Partners', 'elementor-addon');
    }

    public function get_icon() {
        return 'eicon-slider-push';
    }

    public function get_categories() {
        return ['general'];
    }

    // Definizione dei controlli del widget (pannello di Elementor)
    protected function _register_controls() {
        
        // Sezione Contenuto
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Loghi dei Partner', 'elementor-addon'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        // Controllo GALLERIA per caricare i loghi
        $this->add_control(
            'partner_logos',
            [
                'label' => __('Seleziona i loghi', 'elementor-addon'),
                'type' => \Elementor\Controls_Manager::GALLERY,
                'default' => [],
                'description' => 'Seleziona tutte le immagini dei partner che vuoi mostrare nello slider.',
            ]
        );

        $this->end_controls_section();
    }

    // Funzione che genera l'HTML nel frontend
    protected function render() {
    $settings = $this->get_settings_for_display();
    $logos    = $settings['partner_logos'];

    if (empty($logos)) {
        return; // Non mostrare nulla se non ci sono loghi
    }

    $id = 'partners-marquee-' . $this->get_id(); // ID unico
    ?>
    <div id="<?php echo esc_attr($id); ?>" class="partners-marquee">
        <div class="partners-marquee-track">
            <?php
            // 1° giro loghi
            foreach ($logos as $logo) :
                $image_url = wp_get_attachment_image_url($logo['id'], 'full');
                if ($image_url) : ?>
                    <div class="partners-marquee-slide">
                        <img src="<?php echo esc_url($image_url); ?>" alt="Partner Logo">
                    </div>
                <?php endif;
            endforeach;

            // 2° giro loghi (duplicazione per l’effetto infinito)
            foreach ($logos as $logo) :
                $image_url = wp_get_attachment_image_url($logo['id'], 'full');
                if ($image_url) : ?>
                    <div class="partners-marquee-slide">
                        <img src="<?php echo esc_url($image_url); ?>" alt="Partner Logo">
                    </div>
                <?php endif;
            endforeach;
            ?>
        </div>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var container = document.getElementById('<?php echo esc_js($id); ?>');
        if (!container) return;

        var track = container.querySelector('.partners-marquee-track');
        if (!track) return;

        // Larghezza totale del nastro (due serie di loghi)
        var totalWidth = track.scrollWidth;

        // Larghezza di una sola serie (metà nastro)
        var oneSetWidth = totalWidth / 2;

        // Velocità base in px/sec (desktop e mobile)
        var speedDesktop = 80;   // più alto = più veloce
        var speedMobile  = 130;  // mobile più rapido

        var isMobile = window.matchMedia('(max-width: 767px)').matches;
        var speed = isMobile ? speedMobile : speedDesktop;

        // Durata = spazio da percorrere / velocità
        var duration = oneSetWidth / speed; // in secondi

        // Impostiamo le CSS custom properties
        track.style.setProperty('--marquee-distance', oneSetWidth + 'px');
        track.style.setProperty('--marquee-duration', duration + 's');
    });
    </script>
    <?php
}

  protected function _content_template() {
    ?>
    <?php
  }
}