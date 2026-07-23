<?php
if (!defined('ABSPATH')) exit;

class Elementor_Widget_Expand_Digit_Accordian extends \Elementor\Widget_Base {

    public function __construct($data = [], $args = null) {
        parent::__construct($data, $args);

        wp_register_style(
            'expand-digit-accordian-css',
            plugins_url('expand-digit-accordian.css', __FILE__)
        );

        wp_register_script(
            'expand-digit-accordian-js',
            plugins_url('expand-digit-accordian.js', __FILE__),
            ['jquery'],
            false,
            true
        );
    }

    public function get_style_depends() {
        return ['expand-digit-accordian-css'];
    }

    public function get_script_depends() {
        return ['expand-digit-accordian-js'];
    }

    public function get_name() {
        return 'expand-digit-accordion';
    }

    public function get_title() {
        return __('Expand Digit Accordion', 'elementor_addon');
    }

    public function get_icon() {
        return 'eicon-accordion';
    }

    public function get_categories() {
        return ['general'];
    }

    protected function _register_controls() {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Accordion Sections', 'elementor-addon'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        // Top Nav Repeater
        $this->add_control(
            'top_navigation',
            [
                'label' => __('Top Navigation', 'elementor-addon'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => [
                    [
                        'name' => 'nav_number',
                        'label' => __('Nav Number', 'elementor-addon'),
                        'type' => \Elementor\Controls_Manager::TEXT,
                        'default' => '01',
                    ],
                    [
                        'name' => 'nav_title',
                        'label' => __('Nav Title', 'elementor-addon'),
                        'type' => \Elementor\Controls_Manager::TEXT,
                        'default' => __('Section Title', 'elementor-addon'),
                    ],
                ],
                'title_field' => '{{{ nav_number }}} – {{{ nav_title }}}',
            ]
        );

        // Accordion Items
        $repeater_item = new \Elementor\Repeater();
        $repeater_item->add_control(
            'accordion_item_title',
            [
                'label' => __('Item Title', 'elementor-addon'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __('Accordion Title', 'elementor-addon'),
            ]
        );
        $repeater_item->add_control(
            'accordion_item_content',
            [
                'label' => __('Content', 'elementor-addon'),
                'type' => \Elementor\Controls_Manager::WYSIWYG,
                'default' => __('Accordion Description', 'elementor-addon'),
            ]
        );

        $repeater = new \Elementor\Repeater();
        $repeater->add_control(
            'section_number',
            [
                'label' => __('Section Number', 'elementor-addon'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '01',
            ]
        );
        $repeater->add_control(
            'section_title',
            [
                'label' => __('Section Title', 'elementor-addon'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __('Section Title', 'elementor-addon'),
            ]
        );
        $repeater->add_control(
            'accordion_items',
            [
                'label' => __('Accordion Items', 'elementor-addon'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater_item->get_controls(),
                'title_field' => '{{{ accordion_item_title }}}',
            ]
        );

        $this->add_control(
            'sections',
            [
                'label' => __('Sections', 'elementor-addon'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'title_field' => '{{{ section_number }}} – {{{ section_title }}}',
            ]
        );

        $this->end_controls_section();
    }

  protected function render() {
    $settings = $this->get_settings_for_display();
    $widget_id = $this->get_id();
    ?>
<div class="container-fluid px-0">
    <?php if (!empty($settings['top_navigation'])) : ?>
        <div class="expand-digit-top-nav pb-5">
            <ul class="expand-digit-nav-list">
                <?php foreach ($settings['top_navigation'] as $nav_item) :
                    // L'ID della sezione è reso univoco aggiungendo l'indice
                    $nav_section_id = 'section-' . sanitize_title($nav_item['nav_number']);
                    ?>
                    <li>
                        <a href="#<?php echo esc_attr($nav_section_id); ?>" class="expand-digit-nav-link">
                            <span><?php echo esc_html($nav_item['nav_number']); ?></span>
                            <?php echo esc_html($nav_item['nav_title']); ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <div class="expand-digit-widget pt-5" id="expand-digit-widget-<?php echo esc_attr($widget_id); ?>">
        <div class="expand-digit-pin-wrap">
            <div class="expand-digit-sticky" id="expand-digit-sticky-<?php echo esc_attr($widget_id); ?>">
                <span id="expand-digit-number-text-<?php echo esc_attr($widget_id); ?>" class="digit-text">
                    <?php echo esc_html($settings['sections'][0]['section_number'] ?? '01'); ?>
                </span>
            </div>
        </div>

        <div class="expand-digit-content">
            <?php 
            // Ciclo sulle sezioni (l'accordion esterno)
            foreach ($settings['sections'] as $section_index => $section) :
                // Creiamo un ID univoco basato sull'ID del widget e sull'indice di sezione
                $section_id = 'section-' . sanitize_title($section['section_number']) . '-' . $section_index . '-' . $widget_id;
                $accordion_parent_id = 'accordion-parent-' . $widget_id . '-' . $section_index; // ID unico per il contenitore (parent)
                ?>
                <div class="expand-digit-section" id="<?php echo esc_attr($section_id); ?>" data-number="<?php echo esc_attr($section['section_number']); ?>">
				<h2 class="sec-title">
					<span class="section-number-mobile">[<?php echo esc_html($section['section_number']); ?>]</span> 
					<?php echo esc_html($section['section_title']); ?>
				</h2>                    
                    <div class="faq-tll accordion" id="<?php echo esc_attr($accordion_parent_id); ?>">
                        <?php 
                        // Ciclo sugli elementi dell'accordion interno
                        foreach ($section['accordion_items'] as $item_index => $item) :
                            // ID di collapse e heading resi unici includendo l'indice di sezione e di item
                            $collapse_id = 'collapse-' . $widget_id . '-' . $section_index . '-' . $item_index;
                            $heading_id = 'heading-' . $widget_id . '-' . $section_index . '-' . $item_index;
                            ?>
                            <div class="accordion-item">
                                <div class="accordion-header" id="<?php echo esc_attr($heading_id); ?>">
                                    <button class="accordion-button collapsed" type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#<?php echo esc_attr($collapse_id); ?>"
                                            aria-expanded="false"
                                            aria-controls="<?php echo esc_attr($collapse_id); ?>">
                                        <?php echo esc_html($item['accordion_item_title']); ?>
                                    </button>
                                </div>
                                <div id="<?php echo esc_attr($collapse_id); ?>"
                                     class="accordion-collapse collapse"
                                     aria-labelledby="<?php echo esc_attr($heading_id); ?>"
                                     data-bs-parent="#<?php echo esc_attr($accordion_parent_id); ?>">
                                    <div class="accordion-body">
                                        <?php echo $item['accordion_item_content']; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>


    <script>
    document.addEventListener("DOMContentLoaded", function () {
        // Se non stai caricando la libreria GSAP in modo globale tramite wp_register_script/wp_enqueue_script,
        // assicurati che sia caricata prima di questo script inline.
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        } else {
            console.warn('GSAP or ScrollTrigger not loaded. Skipping scroll animations.');
        }

        const widgetId = "<?php echo esc_js($widget_id); ?>";
        const widget = document.getElementById("expand-digit-widget-" + widgetId);
        const sticky = document.getElementById("expand-digit-sticky-" + widgetId);
        const numberText = document.getElementById("expand-digit-number-text-" + widgetId);
        const sections = widget.querySelectorAll(".expand-digit-section");

        if (!widget || !sticky || !numberText || sections.length === 0) return;

        // Assicurati che ScrollTrigger sia disponibile prima di usarlo
        if (typeof ScrollTrigger !== 'undefined') {
            // Animazione Sticky
            ScrollTrigger.create({
                trigger: widget,
                start: "top top+=100",
                end: "bottom center",
                pin: sticky,
                pinSpacing: false
            });

            // Visibilità Sticky
            ScrollTrigger.create({
                trigger: widget,
                start: "top bottom",
                end: "bottom top",
                onEnter: () => sticky.style.display = "flex",
                onLeave: () => sticky.style.display = "none",
                onEnterBack: () => sticky.style.display = "flex",
                onLeaveBack: () => sticky.style.display = "none"
            });

            // Cambio Numero Digit
            sections.forEach(section => {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top",
                    onEnter: () => numberText.textContent = section.dataset.number,
                    onEnterBack: () => numberText.textContent = section.dataset.number
                });
            });


            widget.querySelectorAll('.expand-digit-nav-link').forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const href = this.getAttribute('href');
                    const target = widget.querySelector(href); // scoped inside this widget only

                    if (target) {
                        const stickyHeight = sticky ? sticky.offsetHeight : 0;
                        const offset = 30; // extra spacing to prevent overlap
                        // ScrollTo usa il top della sezione. Sottraiamo l'altezza dell'elemento sticky
                        // per non farlo finire sotto
                        const scrollTarget = target.getBoundingClientRect().top + window.scrollY - stickyHeight - offset;

                        window.scrollTo({
                            top: scrollTarget,
                            behavior: 'smooth'
                        });
                    }
                });
            });

            ScrollTrigger.refresh();
        }
    });
    </script>
</div>
    <?php
}
    protected function _content_template() {}
}
