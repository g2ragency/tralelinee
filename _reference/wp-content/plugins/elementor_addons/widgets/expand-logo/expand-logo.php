<?php
if (!defined('ABSPATH')) exit; 

class Elementor_Widget_Expand_Logo extends \Elementor\Widget_Base {

   public function __construct($data = [], $args = null) {
		parent::__construct($data, $args);

		wp_register_style('expand-logo-css', plugins_url('expand-logo.css', __FILE__));
		wp_register_script('gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', [], null, true);
    	wp_register_script('morphsvg', plugins_url('MorphSVGPlugin.min.js', __FILE__), ['gsap'], null, true);
	    wp_enqueue_script('expand-logo-js', plugins_url('expand-logo.js', __FILE__), ['gsap', 'morphsvg'], null, true);
	}
	
	public function get_script_depends() {
		return ['gsap', 'morphsvg', 'expand-logo-js'];
	}

    public function get_style_depends() {
        return ['expand-logo-css'];
    }

    public function get_name() {
        return 'expand-logo';
    }

    public function get_title() {
        return __('Expand Logo', 'elementor_addon');
    }

    public function get_icon() {
        return 'eicon-time-line';
    }

    public function get_categories() {
        return ['general'];
    }

    protected function register_controls() { 
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Impostazioni', 'elementor_addon'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {  
    $settings = $this->get_settings_for_display(); ?>

	<div class="logo-wrapper">
		<div class="logo-block">
			<div class="separator">|</div>
			<div class="letter-box" data-word="RA">
				<span class="letter">T</span>
				<span class="rest">RA</span>
			</div>
			<div class="separator separator-right">|</div>
		</div>

		<div class="logo-block">
			<div class="separator">|</div>
			<div class="letter-box" data-word="E">
				<span class="letter">L</span>
				<span class="rest">E</span>
			</div>
			<div class="separator separator-right">|</div>
		</div>

		<div class="logo-block">
			<div class="separator">|</div>
			<div class="letter-box" data-word="INEE">
				<span class="letter">L</span>
				<span class="rest">INEE</span>
			</div>
			<div class="separator separator-right">|</div>
		</div>
	</div>
    <?php
  }	
  
  protected function content_template() {}
}