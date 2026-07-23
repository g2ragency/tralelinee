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

        <div class="expand-digit-widget" id="expand-digit-widget-<?php echo esc_attr($widget_id); ?>">
            <div class="expand-digit-pin-wrap">
                <div class="expand-digit-sticky" id="expand-digit-sticky-<?php echo esc_attr($widget_id); ?>">
                    <span id="expand-digit-number-text-<?php echo esc_attr($widget_id); ?>" class="digit-text">
                        <?php echo esc_html($settings['sections'][0]['section_number'] ?? '01'); ?>
                    </span>
                </div>
            </div>
            <div class="expand-digit-content">
                <?php foreach ($settings['sections'] as $section) : ?>
                    <div class="expand-digit-section" data-number="<?php echo esc_attr($section['section_number']); ?>">
                        <h2 class="sec-title"><?php echo esc_html($section['section_title']); ?></h2>
                     <div class="faq-tll accordion" id="accordion-<?php echo esc_attr($widget_id); ?>">
  <?php foreach ($section['accordion_items'] as $index => $item) :
    $collapse_id = 'collapse-' . $widget_id . '-' . $index;
    $heading_id = 'heading-' . $widget_id . '-' . $index;
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
        data-bs-parent="#accordion-<?php echo esc_attr($widget_id); ?>">
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
            gsap.registerPlugin(ScrollTrigger);

            const widgetId = "<?php echo esc_js($widget_id); ?>";
            const widget = document.getElementById("expand-digit-widget-" + widgetId);
            const sticky = document.getElementById("expand-digit-sticky-" + widgetId);
            const numberText = document.getElementById("expand-digit-number-text-" + widgetId);
            const sections = widget.querySelectorAll(".expand-digit-section");

            if (!widget || !sticky || !numberText || sections.length === 0) return;

            ScrollTrigger.create({
                trigger: widget,
                start: "top top+=100",
                end: "bottom center",
                pin: sticky,
                pinSpacing: false
            });

            ScrollTrigger.create({
                trigger: widget,
                start: "top bottom",
                end: "bottom top",
                onEnter: () => sticky.style.display = "flex",
                onLeave: () => sticky.style.display = "none",
                onEnterBack: () => sticky.style.display = "flex",
                onLeaveBack: () => sticky.style.display = "none"
            });

            sections.forEach(section => {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top",
                    onEnter: () => numberText.textContent = section.dataset.number,
                    onEnterBack: () => numberText.textContent = section.dataset.number
                });
            });

            ScrollTrigger.refresh();
        });

        </script>

        <?php
    }

    protected function _content_template() {}
}
