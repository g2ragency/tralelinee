<?php
if (!defined('ABSPATH')) exit;

class Elementor_Widget_Slides_Horizontal extends \Elementor\Widget_Base {

    public function __construct($data = [], $args = null) {
        parent::__construct($data, $args);

        // Register the CSS file
        wp_register_style('slides-horizontal-css', plugins_url('slides-horizontal.css', __FILE__));
    }

    public function get_style_depends() {
        return ['slides-horizontal-css'];
    }

    public function get_name() {
        return 'slides-horizontal';
    }

    public function get_title() {
        return __('Slides Horizontal', 'elementor_addon');
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
		
		$repeater = new \Elementor\Repeater();

		$repeater->add_control(
			'slide_title',
			[
				'label' => __('Titolo', 'elementor_addon'),
				'type' => \Elementor\Controls_Manager::TEXTAREA,
				'default' => __('Titolo Slide', 'elementor_addon'),
			]
		);

		$this->add_control(
			'slides',
			[
				'label' => __('Slides'),
				'type' => \Elementor\Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => [
					['slide_title' => 'Slide 1'],
					['slide_title' => 'Slide 2'],
					['slide_title' => 'Slide 3'],
					['slide_title' => 'Slide 4'],
				],
			]
		);	

        $this->end_controls_section();

    }
	

    protected function render() {
        $settings = $this->get_settings_for_display();
        $slides = $settings['slides'];
		if (empty($slides)) return;
        $totalSlides = count($slides);
        ?>

        <div class="horizontal-scroll-section">
            <div class="horizontal-scroll-wrapper">
                <?php foreach ($slides as $index => $slide): ?>
                    <section class="h-slide">
                        <div class="slide-inner">
                            <h2><?php echo $slide['slide_title']; ?></h2>
                        </div>
                    </section>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Contatore fisso -->
        <div class="slide-counter-fixed">
            <span id="current-slide">1</span>/<?php echo $totalSlides; ?>
        </div>

        <script>
        document.addEventListener('DOMContentLoaded', function() {
            gsap.registerPlugin(ScrollTrigger);

            const container = document.querySelector(".horizontal-scroll-wrapper");
            const section = document.querySelector(".horizontal-scroll-section");
            const slides = gsap.utils.toArray(".h-slide");
            const counterWrapper = document.querySelector(".slide-counter-fixed");
            const slideCounter = document.getElementById("current-slide");

            let scrollLength = container.scrollWidth - window.innerWidth;

            let tween = gsap.to(container, {
                x: () => `-${scrollLength}px`,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => `+=${scrollLength}`,
                    scrub: true,
                    pin: true,
                    anticipatePin: 1,
                    onEnter: () => counterWrapper.style.display = "block",
                    onLeave: () => counterWrapper.style.display = "none",
                    onEnterBack: () => counterWrapper.style.display = "block",
                    onLeaveBack: () => counterWrapper.style.display = "none"
                }
            });

            slides.forEach((slide, i) => {
                ScrollTrigger.create({
                    trigger: slide,
                    containerAnimation: tween,
                    start: "left center",
                    onEnter: () => slideCounter.textContent = i + 1,
                    onEnterBack: () => slideCounter.textContent = i + 1
                });
            });
        });
        </script>
        <?php
    }

    protected function content_template() {}
}