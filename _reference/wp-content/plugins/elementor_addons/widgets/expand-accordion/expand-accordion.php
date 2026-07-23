<?php
if (!defined('ABSPATH')) exit;

class Elementor_Widget_Expand_Accordion extends \Elementor\Widget_Base {

    public function __construct($data = [], $args = null) {
        parent::__construct($data, $args);

        // Register the CSS file
        wp_register_style('expand-accordion-css', plugins_url('expand-accordion.css', __FILE__));
    }

    public function get_style_depends() {
        return ['expand-accordion-css'];
    }

    public function get_name() {
        return 'expand-accordion';
    }

    public function get_title() {
        return __('Expand Accordion', 'elementor_addon');
    }

    public function get_icon() {
        return 'eicon-time-line'; // A suitable icon
    }

    public function get_categories() {
        return ['general']; // Or a custom category
    }

    protected function register_controls() {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Impostazioni Accordion', 'elementor_addon'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        // Example: Add a Repeater Control for multiple accordion items
        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'item_title',
            [
                'label' => __('Titolo Sezione', 'elementor_addon'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __('Titolo Sezione', 'elementor_addon'),
                'placeholder' => __('Inserisci il titolo', 'elementor_addon'),
                'label_block' => true,
            ]
        );

        $repeater->add_control(
            'item_content',
            [
                'label' => __('Contenuto Sezione', 'elementor_addon'),
                'type' => \Elementor\Controls_Manager::WYSIWYG, // Rich text editor for content
                'default' => __('Contenuto espanso da mostrare...', 'elementor_addon'),
                'placeholder' => __('Inserisci il contenuto', 'elementor_addon'),
                'show_label' => false,
            ]
        );

        $this->add_control(
            'accordion_items',
            [
                'label' => __('Elementi Accordion', 'elementor_addon'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    [
                        'item_title' => __('Anticipazione Strategica', 'elementor_addon'),
                        'item_content' => __('Immaginare scenari futuri per aiutare clienti, istituzioni o brand a posizionarsi prima che accadano i cambiamenti', 'elementor_addon'),
                    ],
                    [
                        'item_title' => __('Issue Shaping', 'elementor_addon'),
                        'item_content' => __('Costruisci mondi futuri e fai in modo che il tuo cliente plasmi il dibattito', 'elementor_addon'),
                    ],
                    [
                        'item_title' => __('Creazione di nuovi frame culturali', 'elementor_addon'),
                        'item_content' => __('Nuovi modi di pensare problemi consolidati (es. lavoro, benessere, identità) e creare un “campo semantico” dove il cliente è già leader', 'elementor_addon'),
                    ],
                    [
                        'item_title' => __('Stimolazione delle policy', 'elementor_addon'),
                        'item_content' => __('Testo di esempio per Stimolazione delle policy.', 'elementor_addon'),
                    ],
                ],
                'title_field' => '{{{ item_title }}}',
            ]
        );

        $this->end_controls_section();

        // You could add style controls here if you wish (e.g., colors, fonts)
        // For simplicity, I'm keeping them in the CSS for now.
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        ?>
  <div class="accordion-container-expand">
  <?php foreach ($settings['accordion_items'] as $item): ?>
    <section class="accordion-item">
      <div class="accordion-header expand-accordion">
        <span class="vertical-line"></span>
        <h2 class="accordion-title"><?php echo esc_html($item['item_title']); ?></h2>
      </div>
      <div class="accordion-content">
        <p><?php echo $item['item_content']; ?></p>
      </div>
    </section>
  <?php endforeach; ?>
</div>


<script>
document.addEventListener('DOMContentLoaded', function () {
  const accordionHeaders = document.querySelectorAll('.expand-accordion');

  accordionHeaders.forEach(header => {
    const content = header.nextElementSibling;
    const verticalLine = header.querySelector('.vertical-line');

    // Altezza base della linea
    const baseHeight = 58;

    // Stato iniziale
    content.style.maxHeight = '0';
    content.style.padding = '0 0 0 calc(3px + 15px)';
    content.style.opacity = '0';
    verticalLine.style.transform = 'scaleY(1)';

    header.addEventListener('mouseover', function () {
      const contentHeight = content.scrollHeight;
      content.style.maxHeight = contentHeight + '10px';
      content.style.padding = '5px 0 5px calc(3px + 15px)';
      content.style.opacity = '1';

      // Calcola fattore di scala
      const scaleFactor = (baseHeight + contentHeight + 40) / baseHeight;
      verticalLine.style.transform = 'scaleY(' + scaleFactor + ')';
    });

    header.addEventListener('mouseout', function () {
      content.style.maxHeight = '0';
      content.style.padding = '0 0 0 calc(3px + 15px)';
      content.style.opacity = '0';
      verticalLine.style.transform = 'scaleY(1)';
    });
  });
});
</script>

        <?php
    }

    protected function content_template() {}
}