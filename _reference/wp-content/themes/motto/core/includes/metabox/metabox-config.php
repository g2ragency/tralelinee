<?php

if (!class_exists('RWMB_Loader')) return;

use WGL_Extensions\WGL_Framework_Global_Variables as WGL_Globals;

class Motto_Metaboxes
{
    public function __construct()
    {
        // General
        add_filter( 'rwmb_meta_boxes', [ $this, 'general_meta_boxes' ] );

        // Team
        add_filter( 'rwmb_meta_boxes', [ $this, 'team_meta_boxes' ] );

        // Portfolio
        add_filter( 'rwmb_meta_boxes', [ $this, 'portfolio_meta_boxes' ] );
        add_filter( 'rwmb_meta_boxes', [ $this, 'portfolio_post_settings_meta_boxes' ] );
        add_filter( 'rwmb_meta_boxes', [ $this, 'portfolio_related_meta_boxes' ] );

        // Blog
        add_filter( 'rwmb_meta_boxes', [ $this, 'blog_settings_meta_boxes' ] );
        add_filter( 'rwmb_meta_boxes', [ $this, 'blog_meta_boxes' ] );
        add_filter( 'rwmb_meta_boxes', [ $this, 'blog_related_meta_boxes' ] );

        // Page
        add_filter( 'rwmb_meta_boxes', [ $this, 'page_layout_meta_boxes' ] );

        // Colors
        add_filter( 'rwmb_meta_boxes', [ $this, 'page_color_meta_boxes' ] );

        // Header Builder
        add_filter( 'rwmb_meta_boxes', [ $this, 'page_header_meta_boxes' ] );

        // Title
        add_filter( 'rwmb_meta_boxes', [ $this, 'page_title_meta_boxes' ] );

        // Side Panel
        add_filter( 'rwmb_meta_boxes', [ $this, 'page_side_panel_meta_boxes' ] );

        // Social Shares
        add_filter( 'rwmb_meta_boxes', [ $this, 'page_soc_icons_meta_boxes' ] );

        // Footer
        add_filter( 'rwmb_meta_boxes', [ $this, 'page_footer_meta_boxes' ] );

        // Copyright
        add_filter( 'rwmb_meta_boxes', [ $this, 'page_copyright_meta_boxes' ] );
    }

    public function general_meta_boxes( $meta_boxes )
    {
        $meta_boxes[] = [
            'title' => esc_html__('General', 'motto'),
            'post_types' => ['page' , 'post', 'team', 'portfolio', 'product'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_body_switch',
                    'name' => esc_html__( 'Body Styles', 'motto' ),
                    'type' => 'button_group',
                    'inline' => true,
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'on' => esc_html__( 'Enable', 'motto' ),
                        'off' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_body_color_bg',
                    'name' => esc_html__('Body Background', 'motto'),
                    'type' => 'wgl_background',
                    'image' => '',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_body_switch', '=', 'on']
                        ]],
                    ],
                    'repeat' => esc_attr(WGL_Framework::get_option('body_color_bg')['background-repeat'] ?? ''),
                    'size' => esc_attr(WGL_Framework::get_option('body_color_bg')['background-size'] ?? ''),
                    'attachment' => esc_attr(WGL_Framework::get_option('body_color_bg')['background-attachment'] ?? ''),
                    'position' => esc_attr(WGL_Framework::get_option('body_color_bg')['background-position'] ?? ''),
                    'color' => esc_attr(WGL_Framework::get_option('body_color_bg')['background-color'] ?? ''),
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function team_meta_boxes( $meta_boxes )
    {
        $meta_boxes[] = [
            'title' => esc_html__('Team Options', 'motto'),
            'post_types' => ['team'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'highlighted_info',
                    'name' => esc_html__('Highlighted Info', 'motto'),
                    'type' => 'text',
                    'class' => 'field-inputs'
                ],
                [
                    'id' => 'info_items',
                    'name' => esc_html__('Member Info', 'motto'),
                    'type' => 'social',
                    'clone' => true,
                    'sort_clone' => true,
                    'options' => [
                        'name' => [
                            'name' => esc_html__('Name', 'motto'),
                            'type_input' => 'text'
                        ],
                        'description' => [
                            'name' => esc_html__('Description', 'motto'),
                            'type_input' => 'text'
                        ],
                        'link' => [
                            'name' => esc_html__('Link', 'motto'),
                            'type_input' => 'text'
                        ],
                    ],
                ],
                [
                    'id' => 'soc_icon',
                    'name' => esc_html__('Member Socials', 'motto'),
                    'type' => 'select_icon',
                    'placeholder' => esc_attr__('Select an icon', 'motto'),
                    'clone' => true,
                    'sort_clone' => true,
                    'multiple' => false,
                    'options' => WGLAdminIcon()->get_icons_name(),
                    'std' => 'default',
                ],
                [
                    'id' => 'info_bg_color',
                    'name' => esc_html__('Info Background Color', 'motto'),
                    'type' => 'color',
                    'validate' => 'color',
                    'std' => '',
                ],
                [
                    'id' => 'mb_info_bg',
                    'name' => esc_html__('Info Background Image', 'motto'),
                    'type' => 'file_advanced',
                    'mime_type' => 'image',
                    'max_file_uploads' => 1,
                ],
                [
                    'id' => 'mb_team_single_sticky_image',
                    'name' => esc_html__('Sticky Image', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'yes' => esc_html__( 'Enable', 'motto' ),
                        'no' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function portfolio_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Portfolio Options', 'motto'),
            'post_types' => ['portfolio'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_portfolio_featured_image_conditional',
                    'name' => esc_html__('Featured Image', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto'),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_portfolio_featured_image_type',
                    'name' => esc_html__('Featured Image Settings', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                                ['mb_portfolio_featured_image_conditional', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'off' => esc_html__('Off', 'motto'),
                        'replace' => esc_html__('Replace', 'motto'),
                    ],
                    'std' => 'off',
                ],
                [
                    'id' => 'mb_portfolio_featured_image_replace',
                    'name' => esc_html__('Featured Image Replace', 'motto'),
                    'type' => 'image_advanced',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_portfolio_featured_image_conditional', '=', 'custom'],
                            ['mb_portfolio_featured_image_type', '=', 'replace'],
                        ]],
                    ],
                    'max_file_uploads' => 1,
                ],
                [
                    'id' => 'mb_portfolio_title',
                    'name' => esc_html__('Show Title on single', 'motto'),
                    'type' => 'switch',
                    'std' => 'true',
                ],
                [
                    'id' => 'mb_portfolio_link',
                    'name' => esc_html__('Add Custom Link for Portfolio Grid', 'motto'),
                    'type' => 'switch',
                ],
                [
                    'id' => 'portfolio_custom_url',
                    'name' => esc_html__('Custom Url for Portfolio Grid', 'motto'),
                    'type' => 'text',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_portfolio_link', '=', '1']
                        ]],
                    ],
                    'class' => 'field-inputs',
                ],
                [
                    'id' => 'mb_portfolio_single_meta_categories',
                    'name' => esc_html__('Categories', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'yes' => esc_html__( 'Enable', 'motto' ),
                        'no' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_portfolio_single_meta_date',
                    'name' => esc_html__('Date', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'yes' => esc_html__( 'Enable', 'motto' ),
                        'no' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_portfolio_above_content_cats',
                    'name' => esc_html__('Tags', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'yes' => esc_html__( 'Enable', 'motto' ),
                        'no' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_portfolio_above_content_share',
                    'name' => esc_html__('Share Links', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'yes' => esc_html__( 'Enable', 'motto' ),
                        'no' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function portfolio_post_settings_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Portfolio Post Settings', 'motto'),
            'post_types' => ['portfolio'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_portfolio_post_conditional',
                    'name' => esc_html__('Post Layout', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto'),
                    ],
                    'std' => 'default',
                ],
                [
                    'name' => esc_html__('Post Layout Settings', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_portfolio_post_conditional', '=', 'custom']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_portfolio_single_type_layout',
                    'name' => esc_html__('Layout', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_portfolio_post_conditional', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        '1' => esc_html__('Title First', 'motto'),
                        '2' => esc_html__('Image First', 'motto'),
                    ],
                    'std' => '2',
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function portfolio_related_meta_boxes( $meta_boxes )
    {
        $meta_boxes[] = [
            'title' => esc_html__( 'Related Portfolio', 'motto' ),
            'post_types' => [ 'portfolio' ],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_portfolio_related_switch',
                    'name' => esc_html__( 'Portfolio Related', 'motto' ),
                    'type' => 'button_group',
                    'inline' => true,
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'on' => esc_html__( 'Enable', 'motto' ),
                        'off' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default'
                ],
                [
                    'name' => esc_html__( 'Portfolio Related Settings', 'motto' ),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_portfolio_related_switch', '=', 'on' ]
                        ] ],
                    ],
                ],
                [
                    'id' => 'mb_pf_carousel_r',
                    'name' => esc_html__( 'Display items withiin carousel for this post', 'motto' ),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_portfolio_related_switch', '=', 'on' ]
                        ] ],
                    ],
                    'std' => 1,
                ],
                [
                    'id' => 'mb_portfolio_related_title',
                    'name' => esc_html__( 'Title', 'motto' ),
                    'type' => 'text',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_portfolio_related_switch', '=', 'on' ]
                        ] ],
                    ],
                    'std' => esc_html( WGL_Framework::get_option( 'portfolio_related_title' ) ),
                ],
                [
                    'id' => 'mb_pf_cat_r',
                    'name' => esc_html__( 'Categories', 'motto' ),
                    'type' => 'taxonomy_advanced',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_portfolio_related_switch', '=', 'on' ]
                        ] ],
                    ],
                    'multiple' => true,
                    'taxonomy' => 'portfolio-category',
                ],
                [
                    'id' => 'mb_pf_column_r',
                    'name' => esc_html__( 'Columns', 'motto' ),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_portfolio_related_switch', '=', 'on' ]
                        ] ],
                    ],
                    'multiple' => false,
                    'options' => [
                        '2' => esc_html__( '2', 'motto' ),
                        '3' => esc_html__( '3', 'motto' ),
                        '4' => esc_html__( '4', 'motto' ),
                    ],
                    'std' => '3',
                ],
                [
                    'id' => 'mb_pf_number_r',
                    'name' => esc_html__( 'Number of Related Items', 'motto' ),
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            ['mb_portfolio_related_switch', '=', 'on']
                        ] ],
                    ],
                    'min' => 0,
                    'step' => 1,
                    'std' => 3,
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function blog_settings_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Post Settings', 'motto'),
            'post_types' => ['post'],
            'context' => 'advanced',
            'fields' => [
                [
                    'name' => esc_html__('Post Layout Settings', 'motto'),
                    'type' => 'wgl_heading',
                ],
                [
                    'id' => 'mb_post_layout_conditional',
                    'name' => esc_html__('Post Layout', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto'),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_single_type_layout',
                    'name' => esc_html__('Post Layout Type', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_post_layout_conditional', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        '1' => esc_html__('Title First', 'motto'),
                        '2' => esc_html__('Image First', 'motto'),
                        '3' => esc_html__('Overlay Image', 'motto'),
                    ],
                    'std' => esc_attr(WGL_Framework::get_option('single_type_layout')),
                ],
                [
                    'id' => 'mb_single_padding_layout_3',
                    'name' => esc_html__('Padding Top/Bottom', 'motto'),
                    'type' => 'wgl_offset',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_post_layout_conditional', '=', 'custom'],
                            ['mb_single_type_layout', '=', '3'],
                        ]],
                    ],
                    'options' => [
                        'mode' => 'padding',
                        'top' => true,
                        'right' => false,
                        'bottom' => true,
                        'left' => false,
                    ],
                    'std' => [
                        'padding-top' => esc_attr(WGL_Framework::get_option('single_padding_layout_3')['padding-top']),
                        'padding-bottom' => esc_attr(WGL_Framework::get_option('single_padding_layout_3')['padding-bottom']),
                    ],
                ],
                [
                    'id' => 'mb_single_apply_animation',
                    'name' => esc_html__('Apply Animation', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_post_layout_conditional', '=', 'custom'],
                            ['mb_single_type_layout', '=', '3'],
                        ]],
                    ],
                    'std' => 1,
                ],
                [
                    'name' => esc_html__('Featured Image Settings', 'motto'),
                    'type' => 'wgl_heading',
                ],
                [
                    'id' => 'mb_featured_image_conditional',
                    'name' => esc_html__('Featured Image', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto'),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_featured_image_type',
                    'name' => esc_html__('Featured Image Settings', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_featured_image_conditional', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'off' => esc_html__('Off', 'motto'),
                        'replace' => esc_html__('Replace', 'motto'),
                    ],
                    'std' => 'off',
                ],
                [
                    'id' => 'mb_featured_image_replace',
                    'name' => esc_html__('Featured Image Replace', 'motto'),
                    'type' => 'image_advanced',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_featured_image_conditional', '=', 'custom'],
                            ['mb_featured_image_type', '=', 'replace'],
                        ]],
                    ],
                    'max_file_uploads' => 1,
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function blog_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Post Format Layout', 'motto'),
            'post_types' => ['post'],
            'context' => 'advanced',
            'fields' => [
                // Standard Post Format
                [
                    'id' => 'post_format_standard',
                    'name' => esc_html__('Standard Post( Enabled only Featured Image for this post format)', 'motto'),
                    'type' => 'static-text',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['formatdiv', '=', '0']
                        ]],
                    ],
                ],
                // Gallery Post Format
                [
                    'name' => esc_html__('Gallery Settings', 'motto'),
                    'type' => 'wgl_heading',
                ],
                [
                    'id' => 'post_format_gallery',
                    'name' => esc_html__('Add Images', 'motto'),
                    'type' => 'image_advanced',
                    'max_file_uploads' => '',
                ],
                // Video Post Format
                [
                    'name' => esc_html__('Video Settings', 'motto'),
                    'type' => 'wgl_heading',
                ],
                [
                    'id' => 'post_format_video_style',
                    'name' => esc_html__('Video Style', 'motto'),
                    'type' => 'select',
                    'multiple' => false,
                    'options' => [
                        'bg_video' => esc_html__('Background Video', 'motto'),
                        'popup' => esc_html__('Popup', 'motto'),
                    ],
                    'std' => 'bg_video',
                ],
                [
                    'id' => 'start_video',
                    'name' => esc_html__('Start Video', 'motto'),
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['post_format_video_style', '=', 'bg_video'],
                        ]],
                    ],
                    'std' => '0',
                ],
                [
                    'id' => 'end_video',
                    'name' => esc_html__('End Video', 'motto'),
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['post_format_video_style', '=', 'bg_video'],
                        ]],
                    ],
                ],
                [
                    'id' => 'post_format_video_url',
                    'name' => esc_html__('oEmbed URL', 'motto'),
                    'type' => 'oembed',
                ],
                // Quote Post Format
                [
                    'name' => esc_html__('Quote Settings', 'motto'),
                    'type' => 'wgl_heading',
                ],
                [
                    'id' => 'post_format_qoute_text',
                    'name' => esc_html__('Quote Text', 'motto'),
                    'type' => 'textarea',
                ],
                [
                    'id' => 'post_format_qoute_name',
                    'name' => esc_html__('Author Name', 'motto'),
                    'type' => 'text',
                ],
                [
                    'id' => 'post_format_qoute_position',
                    'name' => esc_html__('Author Position', 'motto'),
                    'type' => 'text',
                ],
                [
                    'id' => 'post_format_qoute_avatar',
                    'name' => esc_html__('Author Avatar', 'motto'),
                    'type' => 'image_advanced',
                    'max_file_uploads' => 1,
                ],
                // Audio Post Format
                [
                    'name' => esc_html__('Audio Settings', 'motto'),
                    'type' => 'wgl_heading',
                ],
                [
                    'id' => 'post_format_audio_url',
                    'name' => esc_html__('oEmbed URL', 'motto'),
                    'type' => 'oembed',
                ],
                // Link Post Format
                [
                    'name' => esc_html__('Link Settings', 'motto'),
                    'type' => 'wgl_heading',
                ],
                [
                    'id' => 'post_format_link_url',
                    'name' => esc_html__('URL', 'motto'),
                    'type' => 'url',
                ],
                [
                    'id' => 'post_format_link_text',
                    'name' => esc_html__('Text', 'motto'),
                    'type' => 'text',
                ],
            ]
        ];

        return $meta_boxes;
    }

    public function blog_related_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Related Blog Post', 'motto'),
            'post_types' => ['post'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_blog_show_r',
                    'name' => esc_html__( 'Related Posts', 'motto' ),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'custom' => esc_html__( 'Custom', 'motto' ),
                        'off' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'name' => esc_html__('Related Settings', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_blog_show_r', '=', 'custom']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_blog_title_r',
                    'name' => esc_html__('Title', 'motto'),
                    'type' => 'text',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_blog_show_r', '=', 'custom']
                        ]],
                    ],
                    'std' => esc_html__('Related Posts', 'motto'),
                ],
                [
                    'id' => 'mb_blog_cat_r',
                    'name' => esc_html__('Categories', 'motto'),
                    'type' => 'taxonomy_advanced',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_blog_show_r', '=', 'custom']
                        ]],
                    ],
                    'multiple' => true,
                    'taxonomy' => 'category',
                ],
                [
                    'id' => 'mb_blog_column_r',
                    'name' => esc_html__('Columns', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_blog_show_r', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        '12' => esc_html__('1', 'motto'),
                        '6' => esc_html__('2', 'motto'),
                        '4' => esc_html__('3', 'motto'),
                        '3' => esc_html__('4', 'motto'),
                    ],
                    'std' => '6',
                ],
                [
                    'name' => esc_html__('Number of Related Items', 'motto'),
                    'id' => 'mb_blog_number_r',
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_blog_show_r', '=', 'custom']
                        ]],
                    ],
                    'min' => 0,
                    'std' => 2,
                ],
                [
                    'id' => 'mb_blog_carousel_r',
                    'name' => esc_html__('Display items carousel for this blog post', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_blog_show_r', '=', 'custom']
                        ]],
                    ],
                    'std' => 1,
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function page_layout_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Page Sidebar Layout', 'motto'),
            'post_types' => ['page', 'post', 'team', 'portfolio', 'product'],
            'context' => 'advanced',
            'fields' => [
                [
                    'name' => esc_html__('Page Sidebar Layout', 'motto'),
                    'id' => 'mb_page_sidebar_layout',
                    'type' => 'wgl_image_select',
                    'options' => [
                        'default' => get_template_directory_uri() . '/core/admin/img/options/1c.png',
                        'none' => get_template_directory_uri() . '/core/admin/img/options/none.png',
                        'left' => get_template_directory_uri() . '/core/admin/img/options/2cl.png',
                        'right' => get_template_directory_uri() . '/core/admin/img/options/2cr.png',
                    ],
                    'std' => 'default',
                ],
                [
                    'name' => esc_html__('Sidebar Settings', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_sidebar_layout', '!=', 'default'],
                            ['mb_page_sidebar_layout', '!=', 'none'],
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_page_sidebar_def',
                    'name' => esc_html__('Page Sidebar', 'motto'),
                    'type' => 'select',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_sidebar_layout', '!=', 'default'],
                            ['mb_page_sidebar_layout', '!=', 'none'],
                        ]],
                    ],
                    'placeholder' => esc_html__('Select a Sidebar', 'motto'),
                    'multiple' => false,
                    'options' => motto_get_all_sidebars(),
                ],
                [
                    'id' => 'mb_page_sidebar_def_width',
                    'name' => esc_html__('Page Sidebar Width', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_sidebar_layout', '!=', 'default'],
                            ['mb_page_sidebar_layout', '!=', 'none'],
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        '9' => esc_html( '25%' ),
                        '8' => esc_html( '33%' ),
                    ],
                    'std' => '9',
                ],
                [
                    'id' => 'mb_sticky_sidebar',
                    'name' => esc_html__( 'Sticky Sidebar?', 'motto' ),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_sidebar_layout', '!=', 'default'],
                            ['mb_page_sidebar_layout', '!=', 'none'],
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_sidebar_gap',
                    'name' => esc_html__( 'Sidebar Side Gap', 'motto' ),
                    'type' => 'select',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_page_sidebar_layout', '!=', 'default' ],
                            [ 'mb_page_sidebar_layout', '!=', 'none' ],
                        ] ],
                    ],
                    'multiple' => false,
                    'options' => [
                        'def' => esc_html__( 'Default', 'motto' ),
                        '0' => esc_html( '15' ),
	                    '15' => esc_html( '30' ),
	                    '20' => esc_html( '35' ),
	                    '25' => esc_html( '40' ),
	                    '30' => esc_html( '45' ),
	                    '35' => esc_html( '50' ),
	                    '40' => esc_html( '55' ),
	                    '45' => esc_html( '60' ),
                    ],
                    'std' => 'def',
                ],
            ]
        ];

        return $meta_boxes;
    }

    public function page_color_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Page Colors', 'motto'),
            'post_types' => ['page' , 'post', 'team', 'portfolio'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_page_colors_switch',
                    'name' => esc_html__('Page Colors', 'motto'),
                    'type' => 'button_group',
                    'inline' => true,
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto'),
                    ],
                    'std' => 'default',
                ],
                [
                    'name' => esc_html__('Main', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_theme-primary-color',
                    'name' => esc_html__('Primary Theme Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Globals::get_primary_color() ) ],
                    'std' => esc_attr( WGL_Globals::get_primary_color() ),
                ],
                [
                    'id' => 'mb_theme-secondary-color',
                    'name' => esc_html__('Secondary Theme Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Globals::get_secondary_color() ) ],
                    'std' => esc_attr( WGL_Globals::get_secondary_color() ),
                ],
                [
                    'id' => 'mb_theme-tertiary-color',
                    'name' => esc_html__('Tertiary Theme Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Globals::get_tertiary_color() ) ],
                    'std' => esc_attr( WGL_Globals::get_tertiary_color() ),
                ],
                [
                    'id' => 'mb_theme-content-color',
                    'name' => esc_html__( 'Content Color', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Globals::get_main_font_color() ) ],
                    'std' => esc_attr( WGL_Globals::get_main_font_color() ),
                ],
                [
                    'id' => 'mb_theme-content-secondary-color',
                    'name' => esc_html__( 'Content Secondary Color', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Globals::get_content_secondary_color() ) ],
                    'std' => esc_attr( WGL_Globals::get_content_secondary_color() ),
                ],
                [
                    'id' => 'mb_theme-headings-color',
                    'name' => esc_html__( 'Headings Color', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            [ 'mb_page_colors_switch', '=', 'custom' ],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Globals::get_h_font_color() ) ],
                    'std' => esc_attr( WGL_Globals::get_h_font_color() ),
                ],
                [
                    'id' => 'mb_form-bg-color',
                    'name' => esc_html__('Comments Form Background', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'form-bg-color' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'form-bg-color' ) ),
                ],
                [
                    'name' => esc_html__( 'Button', 'motto' ),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_page_colors_switch', '=', 'custom' ]
                        ] ],
                    ],
                ],
                [
                    'id' => 'mb_button-color-idle',
                    'name' => esc_html__('Button Color Idle', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'button-color-idle' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'button-color-idle' ) ),
                ],
                [
                    'id' => 'mb_button-bg-idle',
                    'name' => esc_html__( 'Button Background Idle', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'button-bg-idle' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'button-bg-idle' ) ),
                ],
                [
                    'id' => 'mb_button-border-idle',
                    'name' => esc_html__( 'Button Border Color Idle', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'button-border-idle' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'button-border-idle' ) ),
                ],
                [
                    'id' => 'mb_button-color-hover',
                    'name' => esc_html__('Button Color Hover', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'button-color-hover' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'button-color-hover' ) ),
                ],
                [
                    'id' => 'mb_button-bg-hover',
                    'name' => esc_html__( 'Button Background Hover', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_page_colors_switch', '=', 'custom' ],
                        ] ],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'button-bg-hover' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'button-bg-hover' ) ),
                ],
                [
                    'id' => 'mb_button-border-hover',
                    'name' => esc_html__( 'Button Border Color Hover', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_page_colors_switch', '=', 'custom' ],
                        ] ],
                    ],
                    'validate' => 'color',
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'button-border-hover' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'button-border-hover' ) ),
                ],
                [
                    'name' => esc_html__( 'Back to Top', 'motto' ),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_page_colors_switch', '=', 'custom' ]
                        ] ],
                    ],
                ],
                [
                    'id' => 'mb_scroll_up_arrow_color',
                    'name' => esc_html__('Button Arrow Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => ['defaultColor' => esc_attr(WGL_Framework::get_option('scroll_up_arrow_color'))],
                    'std' => esc_attr(WGL_Framework::get_option('scroll_up_arrow_color')),
                ],
                [
                    'id' => 'mb_scroll_up_arrow_color_bg',
                    'name' => esc_html__('Button Arrow Background Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => ['defaultColor' => esc_attr(WGL_Framework::get_option('scroll_up_arrow_color_bg'))],
                    'std' => esc_attr(WGL_Framework::get_option('scroll_up_arrow_color_bg')),
                ],
                [
                    'id' => 'mb_scroll_up_arrow_color_border',
                    'name' => esc_html__('Button Arrow Background Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_colors_switch', '=', 'custom'],
                        ]],
                    ],
                    'validate' => 'color',
                    'js_options' => ['defaultColor' => esc_attr(WGL_Framework::get_option('scroll_up_arrow_color_border'))],
                    'std' => esc_attr(WGL_Framework::get_option('scroll_up_arrow_color_border')),
                ],
            ]
        ];

        return $meta_boxes;
    }

    public function page_header_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Header', 'motto'),
            'post_types' => ['page', 'post', 'portfolio', 'product'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_customize_header_layout',
                    'name' => esc_html__( 'Header Settings', 'motto' ),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto'),
                        'custom' => esc_html__( 'Custom', 'motto' ),
                        'hide' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_header_content_type',
                    'name' => esc_html__('Header Template', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_header_layout', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto')
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_customize_header',
                    'name' => esc_html__('Template', 'motto'),
                    'type' => 'post',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_header_layout', '=', 'custom'],
                            ['mb_header_content_type', '=', 'custom'],
                        ]],
                    ],
                    'post_type' => 'header',
                    'multiple' => false,
                    'query_args' => [
                        'post_status' => 'publish',
                        'posts_per_page' => - 1,
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_header_sticky',
                    'name' => esc_html__('Sticky Header', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_header_layout', '=', 'custom']
                        ]],
                    ],
                    'std' => 1,
                ],
                [
                    'id' => 'mb_sticky_header_content_type',
                    'name' => esc_html__('Sticky Header Template', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_header_layout', '=', 'custom'],
                            ['mb_header_sticky', '=', '1'],
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto')
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_customize_sticky_header',
                    'name' => esc_html__('Template', 'motto'),
                    'type' => 'post',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_header_layout', '=', 'custom'],
                            ['mb_sticky_header_content_type', '=', 'custom'],
                            ['mb_header_sticky', '=', '1'],
                        ]],
                    ],
                    'multiple' => false,
                    'post_type' => 'header',
                    'query_args' => [
                        'post_status' => 'publish',
                        'posts_per_page' => - 1,
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_mobile_menu_custom',
                    'name' => esc_html__('Mobile Menu Template', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_header_layout', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto')
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_mobile_menu_header',
                    'name' => esc_html__('Mobile Menu ', 'motto'),
                    'type' => 'select',
                    'attributes' => [
                        'data-conditional-logic'  =>  [[
                            ['mb_customize_header_layout', '=', 'custom'],
                            ['mb_mobile_menu_custom', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => $menus = wgl_get_custom_menu(),
                    'default' => reset($menus),
                ],
            ]
        ];

        return $meta_boxes;
    }

    public function page_title_meta_boxes( $meta_boxes )
    {
        $meta_boxes[] = [
            'title' => esc_html__( 'Page Title', 'motto' ),
            'post_types' => [ 'page', 'post', 'team', 'portfolio', 'product' ],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_page_title_switch',
                    'name' => esc_html__( 'Page Title', 'motto' ),
                    'type' => 'button_group',
                    'inline' => true,
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'on' => esc_html__( 'Enable', 'motto' ),
                        'off' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'name' => esc_html__('Page Title Settings', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_page_title_bg_switch',
                    'name' => esc_html__('Use Background Image/Color?', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                    'std' => true,
                ],
                [
                    'id' => 'mb_page_title_tag',
                    'name' => esc_html__('Title HTML tag', 'motto'),
                    'type' => 'select',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                    'options' => [
                        'def' => 'Theme Default',
                        'div' => '‹div›',
                        'h1' => '‹h1›',
                        'h2' => '‹h2›',
                        'h3' => '‹h3›',
                        'h4' => '‹h4›',
                        'h5' => '‹h5›',
                        'h6' => '‹h6›',
                    ],
                    'default' => 'def'
                ],
                [
                    'id' => 'mb_page_title_bg',
                    'name' => esc_html__('Background', 'motto'),
                    'type' => 'wgl_background',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_page_title_switch', '=', 'on' ],
                            [ 'mb_page_title_bg_switch', '=', true ],
                        ] ],
                    ],
                    'image' => '',
                    'repeat' => esc_attr(WGL_Framework::get_option('page_title_bg_image')['background-repeat'] ?? ''),
                    'size' => esc_attr(WGL_Framework::get_option('page_title_bg_image')['background-size'] ?? ''),
                    'attachment' => esc_attr(WGL_Framework::get_option('page_title_bg_image')['background-attachment'] ?? ''),
                    'position' => esc_attr(WGL_Framework::get_option('page_title_bg_image')['background-position'] ?? ''),
                    'color' => esc_attr(WGL_Framework::get_option('page_title_bg_image')['background-color'] ?? ''),
                ],
                [
                    'id' => 'mb_page_title_height',
                    'name' => esc_html__('Min Height', 'motto'),
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on'],
                            ['mb_page_title_bg_switch', '=', true],
                        ]],
                    ],
                    'desc' => esc_html__('Choose `0px` in order to use `min-height: auto;`', 'motto'),
                    'min' => 0,
                    'std' => esc_attr((int) WGL_Framework::get_option('page_title_height')['height']),
                ],
                [
                    'id' => 'mb_page_title_align',
                    'name' => esc_html__('Title Alignment', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'left' => esc_html__('left', 'motto'),
                        'center' => esc_html__('center', 'motto'),
                        'right' => esc_html__('right', 'motto'),
                    ],
                    'std' => esc_attr(WGL_Framework::get_option('page_title_align')),
                ],
                [
                    'id' => 'mb_page_title_padding',
                    'name' => esc_html__('Paddings Top/Bottom', 'motto'),
                    'type' => 'wgl_offset',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                    'options' => [
                        'mode' => 'padding',
                        'top' => true,
                        'right' => false,
                        'bottom' => true,
                        'left' => false,
                    ],
                    'std' => [
                        'padding-top' => esc_attr((int) WGL_Framework::get_option('page_title_padding')['padding-top'] ?? ''),
                        'padding-bottom' => esc_attr((int) WGL_Framework::get_option('page_title_padding')['padding-bottom'] ?? ''),
                    ],
                ],
                [
                    'id' => 'mb_page_title_margin',
                    'name' => esc_html__('Margin Bottom', 'motto'),
                    'type' => 'wgl_offset',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                    'options' => [
                        'mode' => 'margin',
                        'top' => false,
                        'right' => false,
                        'bottom' => true,
                        'left' => false,
                    ],
                    'std' => ['margin-bottom' => esc_attr((int) WGL_Framework::get_option('page_title_margin')['margin-bottom'] ?? '')],
                ],
                [
                    'id' => 'mb_page_title_parallax',
                    'name' => esc_html__('Parallax Switch', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_page_title_parallax_speed',
                    'name' => esc_html__('Parallax Speed', 'motto'),
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_parallax', '=', true],
                            ['mb_page_title_switch', '=', 'on'],
                        ]],
                    ],
                    'step' => 0.1,
                    'std' => 0.3,
                ],
                [
                    'id' => 'mb_page_title_breadcrumbs_switch',
                    'name' => esc_html__('Show Breadcrumbs', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                    'std' => esc_attr( WGL_Framework::get_option( 'page_title_breadcrumbs_switch' ) ),
                ],
                [
                    'id' => 'mb_page_title_breadcrumbs_align',
                    'name' => esc_html__('Breadcrumbs Alignment', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_page_title_switch', '=', 'on' ],
                            [ 'mb_page_title_breadcrumbs_switch', '=', true ]
                        ] ],
                    ],
                    'multiple' => false,
                    'options' => [
                        'left' => esc_html__('left', 'motto'),
                        'center' => esc_html__('center', 'motto'),
                        'right' => esc_html__('right', 'motto'),
                    ],
                    'std' => esc_attr(WGL_Framework::get_option('page_title_breadcrumbs_align')),
                ],
                [
                    'id' => 'mb_page_title_breadcrumbs_block_switch',
                    'name' => esc_html__('Breadcrumbs Full Width', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_page_title_switch', '=', 'on' ],
                            [ 'mb_page_title_breadcrumbs_switch', '=', true ]
                        ] ],
                    ],
                    'std' => esc_attr(WGL_Framework::get_option('page_title_breadcrumbs_block_switch')),
                ],
                [
                    'name' => esc_html__('Page Title Typography', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_page_title_font',
                    'name' => esc_html__('Page Title Font', 'motto'),
                    'type' => 'wgl_font',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                    'options' => [
                        'font-size' => true,
                        'line-height' => true,
                        'font-weight' => false,
                        'color' => true,
                        'letter-spacing' => true,
                    ],
                    'std' => [
                        'font-size' => esc_attr((int) WGL_Framework::get_option('page_title_font')['font-size'] ?? ''),
                        'line-height' => esc_attr((int) WGL_Framework::get_option('page_title_font')['line-height'] ?? ''),
                        'color' => esc_attr(WGL_Framework::get_option('page_title_font')['color'] ?? ''),
                        'letter-spacing' => esc_attr(WGL_Framework::get_option('page_title_font')['letter-spacing'] ?? ''),
                    ],
                ],
                [
                    'id' => 'mb_page_title_breadcrumbs_font',
                    'name' => esc_html__('Page Title Breadcrumbs Font', 'motto'),
                    'type' => 'wgl_font',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                    'options' => [
                        'font-size' => true,
                        'line-height' => true,
                        'font-weight' => false,
                        'color' => true,
                        'letter-spacing' => true,
                    ],
                    'std' => [
                        'font-size' => esc_attr((int) WGL_Framework::get_option('page_title_breadcrumbs_font')['font-size']),
                        'line-height' => esc_attr((int) WGL_Framework::get_option('page_title_breadcrumbs_font')['line-height']),
                        'color' => esc_attr(WGL_Framework::get_option('page_title_breadcrumbs_font')['color']),
                        'letter-spacing' => esc_attr(WGL_Framework::get_option('page_title_breadcrumbs_font')['letter-spacing'] ?? ''),
                    ],
                ],
                [
                    'name' => esc_html__('Responsive Layout', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_page_title_resp_switch',
                    'name' => esc_html__('Responsive Layout On/Off', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_page_title_resp_resolution',
                    'name' => esc_html__('Screen breakpoint', 'motto'),
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on'],
                            ['mb_page_title_resp_switch', '=', '1'],
                        ]],
                    ],
                    'min' => 1,
                    'std' => esc_attr(WGL_Framework::get_option('page_title_resp_resolution')),
                ],
                [
                    'id' => 'mb_page_title_resp_padding',
                    'name' => esc_html__('Padding Top/Bottom', 'motto'),
                    'type' => 'wgl_offset',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on'],
                            ['mb_page_title_resp_switch', '=', '1'],
                        ]],
                    ],
                    'options' => [
                        'mode' => 'padding',
                        'top' => true,
                        'right' => false,
                        'bottom' => true,
                        'left' => false,
                    ],
                    'std' => [
                        'padding-top' => esc_attr( (int) WGL_Framework::get_option( 'page_title_resp_padding' )[ 'padding-top' ] ?? '' ),
                        'padding-bottom' => esc_attr( (int) WGL_Framework::get_option( 'page_title_resp_padding' )[ 'padding-bottom' ] ?? '' ),
                    ],
                ],
                [
                    'id' => 'mb_page_title_resp_font',
                    'name' => esc_html__('Page Title Font', 'motto'),
                    'type' => 'wgl_font',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on'],
                            ['mb_page_title_resp_switch', '=', '1'],
                        ]],
                    ],
                    'options' => [
                        'font-size' => true,
                        'line-height' => true,
                        'font-weight' => false,
                        'color' => true,
                    ],
                    'std' => [
                        'font-size' => esc_attr((int) WGL_Framework::get_option('page_title_resp_font')['font-size']),
                        'line-height' => esc_attr((int) WGL_Framework::get_option('page_title_resp_font')['line-height']),
                        'color' => esc_attr(WGL_Framework::get_option('page_title_resp_font')['color']),
                    ],
                ],
                [
                    'id' => 'mb_page_title_resp_breadcrumbs_switch',
                    'name' => esc_html__('Show Breadcrumbs', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on'],
                            ['mb_page_title_resp_switch', '=', '1'],
                        ]],
                    ],
                    'std' => 1,
                ],
                [
                    'id' => 'mb_page_title_resp_breadcrumbs_font',
                    'name' => esc_html__('Page Title Breadcrumbs Font', 'motto'),
                    'type' => 'wgl_font',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_page_title_switch', '=', 'on'],
                            ['mb_page_title_resp_switch', '=', '1'],
                            ['mb_page_title_resp_breadcrumbs_switch', '=', '1'],
                        ]],
                    ],
                    'options' => [
                        'font-size' => true,
                        'line-height' => true,
                        'font-weight' => false,
                        'color' => true,
                    ],
                    'std' => [
                        'font-size' => esc_attr((int) WGL_Framework::get_option('page_title_breadcrumbs_font')['font-size']),
                        'line-height' => esc_attr((int) WGL_Framework::get_option('page_title_breadcrumbs_font')['line-height']),
                        'color' => esc_attr(WGL_Framework::get_option('page_title_breadcrumbs_font')['color']),
                    ],
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function page_side_panel_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Side Panel', 'motto'),
            'post_types' => ['page'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_customize_side_panel',
                    'name' => esc_html__('Side Panel', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'inline' => true,
                    'options' => [
                        'default' => esc_html__('Default', 'motto'),
                        'custom' => esc_html__('Custom', 'motto'),
                    ],
                    'std' => 'default',
                ],
                [
                    'name' => esc_html__('Side Panel Settings', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_side_panel', '=', 'custom']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_side_panel_building_tool',
                    'name' => esc_html__('Content Type', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_side_panel', '=', 'custom']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'widgets' => esc_html__('Wordpress Widgets', 'motto'),
                        'elementor' => esc_html__('Elementor', 'motto')
                    ],
                    'std' => 'widgets',
                ],
                [
                    'id' => 'mb_side_panel_page_select',
                    'name' => esc_html__('Select a page', 'motto'),
                    'type' => 'post',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_side_panel', '=', 'custom'],
                            ['mb_side_panel_building_tool', '=', 'elementor'],
                        ]],
                    ],
                    'post_type' => 'side_panel',
                    'field_type' => 'select_advanced',
                    'placeholder' => esc_html__('Select a page', 'motto'),
                    'query_args' => [
                        'post_status' => 'publish',
                        'posts_per_page' => - 1,
                    ],
                ],
                [
                    'id' => 'mb_side_panel_spacing',
                    'name' => esc_html__( 'Margins', 'motto' ),
                    'type' => 'wgl_offset',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_side_panel', '=', 'custom'],
                            ['mb_side_panel_building_tool', '=', 'widgets'],
                        ]],
                    ],
                    'options' => [
                        'mode' => 'margin',
                        'top' => true,
                        'right' => true,
                        'bottom' => true,
                        'left' => true,
                    ],
                    'std' => [
                        'margin-top' => esc_attr(WGL_Framework::get_option('side_panel_spacing')['margin-top'] ?? ''),
                        'margin-right' => esc_attr(WGL_Framework::get_option('side_panel_spacing')['margin-right'] ?? ''),
                        'margin-bottom' => esc_attr(WGL_Framework::get_option('side_panel_spacing')['margin-bottom'] ?? ''),
                        'margin-left' => esc_attr(WGL_Framework::get_option('side_panel_spacing')['margin-left'] ?? ''),
                    ],
                ],
                [
                    'id' => 'mb_side_panel_title_color',
                    'name' => esc_html__('Title Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_side_panel', '=', 'custom'],
                            ['mb_side_panel_building_tool', '=', 'widgets'],
                        ]],
                    ],
                    'js_options' => ['defaultColor' => esc_attr(WGL_Framework::get_option('side_panel_title_color'))],
                    'std' => esc_attr(WGL_Framework::get_option('side_panel_title_color')),
                ],
                [
                    'id' => 'mb_side_panel_text_color',
                    'name' => esc_html__( 'Text Color', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_customize_side_panel', '=', 'custom' ],
                            [ 'mb_side_panel_building_tool', '=', 'widgets' ],
                        ] ],
                    ],
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Globals::get_h_font_color() ) ],
                    'std' => esc_attr( WGL_Globals::get_h_font_color() ),
                ],
                [
                    'id' => 'mb_side_panel_bg',
                    'name' => esc_html__('Background Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_side_panel', '=', 'custom'],
                            ['mb_side_panel_building_tool', '=', 'widgets'],
                        ]],
                    ],
                    'alpha_channel' => true,
                    'js_options' => ['defaultColor' => esc_attr(WGL_Framework::get_option('side_panel_bg')['rgba'] ?? '')],
                    'std' => esc_attr(WGL_Framework::get_option('side_panel_bg')['rgba'] ?? ''),
                ],
                [
                    'id' => 'mb_side_panel_text_alignment',
                    'name' => esc_html__('Text Align', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_side_panel', '=', 'custom'],
                            ['mb_side_panel_building_tool', '=', 'widgets'],
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'left' => esc_html__('Left', 'motto'),
                        'center' => esc_html__('Center', 'motto'),
                        'right' => esc_html__('Right', 'motto'),
                    ],
                    'std' => esc_attr(WGL_Framework::get_option('side_panel_text_alignment')),
                ],
                [
                    'id' => 'mb_side_panel_width',
                    'name' => esc_html__('Width', 'motto'),
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_side_panel', '=', 'custom'],
                            ['mb_side_panel_building_tool', '=', 'widgets'],
                        ]],
                    ],
                    'min' => 50,
                    'std' => esc_attr(WGL_Framework::get_option('side_panel_width')['width'] ?? ''),
                ],
                [
                    'id' => 'mb_side_panel_position',
                    'name' => esc_html__('Position', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                                ['mb_customize_side_panel', '=', 'custom'],
                                ['mb_side_panel_building_tool', '=', 'widgets'],
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'left' => esc_html__('Left', 'motto'),
                        'right' => esc_html__('Right', 'motto'),
                    ],
                    'std' => esc_attr(WGL_Framework::get_option('side_panel_position')),
                ],
            ]
        ];

        return $meta_boxes;
    }

    public function page_soc_icons_meta_boxes($meta_boxes)
    {
        $meta_boxes[] = [
            'title' => esc_html__('Social Shares', 'motto'),
            'post_types' => ['page'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_customize_soc_shares',
                    'name' => esc_html__('Social Shares', 'motto'),
                    'type' => 'button_group',
                    'inline' => true,
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'on' => esc_html__( 'Enable', 'motto' ),
                        'off' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'id' => 'mb_soc_icon_style',
                    'name' => esc_html__('Socials visibility', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_soc_shares', '=', 'on']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'standard' => esc_html__('Always', 'motto'),
                        'hovered' => esc_html__('On Hover', 'motto'),
                    ],
                    'std' => 'standard',
                ],
                [
                    'id' => 'mb_soc_icon_offset',
                    'name' => esc_html__('Offset Top', 'motto'),
                    'type' => 'number',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_soc_shares', '=', 'on']
                        ]],
                    ],
                    'min' => 0,
                    'std' => 250,
                ],
                [
                    'id' => 'mb_soc_icon_offset_units',
                    'name' => esc_html__('Offset Top Units', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_soc_shares', '=', 'on']
                        ]],
                    ],
                    'desc' => esc_html__('If measurement units defined as "%" then social buttons will be fixed relative to viewport.', 'motto'),
                    'multiple' => false,
                    'options' => [
                        'pixel' => esc_html__('pixels (px)', 'motto'),
                        'percent' => esc_html__('percents (%)', 'motto'),
                    ],
                    'std' => 'pixel',
                ],
                [
                    'id' => 'mb_soc_icon_facebook',
                    'name' => esc_html__('Facebook Button', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_soc_shares', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_soc_icon_twitter',
                    'name' => esc_html__('Twitter Button', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_soc_shares', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_soc_icon_linkedin',
                    'name' => esc_html__('Linkedin Button', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_soc_shares', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_soc_icon_pinterest',
                    'name' => esc_html__('Pinterest Button', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_soc_shares', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_soc_icon_tumblr',
                    'name' => esc_html__('Tumblr Button', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_customize_soc_shares', '=', 'on']
                        ]],
                    ],
                ],
            ]
        ];

        return $meta_boxes;
    }

    public function page_footer_meta_boxes( $meta_boxes )
    {
        $meta_boxes[] = [
            'title' => esc_html__('Footer', 'motto'),
            'post_types' => ['page'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_footer_switch',
                    'name' => esc_html__('Footer', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'on' => esc_html__( 'Enable', 'motto' ),
                        'off' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'name' => esc_html__('Footer Settings', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_footer_switch', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_footer_building_tool',
                    'name' => esc_html__('Layout Building Tool', 'motto'),
                    'type' => 'button_group',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_footer_switch', '=', 'on']
                        ]],
                    ],
                    'multiple' => false,
                    'options' => [
                        'widgets' => esc_html__('Wordpress Widgets', 'motto'),
                        'elementor' => esc_html__('Elementor', 'motto')
                    ],
                    'std' => 'elementor',
                ],
                [
                    'id' => 'mb_footer_page_select',
                    'name' => esc_html__('Select a page', 'motto'),
                    'type' => 'post',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_footer_switch', '=', 'on'],
                            ['mb_footer_building_tool', '=', 'elementor']
                        ]],
                    ],
                    'post_type' => 'footer',
                    'field_type' => 'select_advanced',
                    'placeholder' => esc_html__('Select a page', 'motto'),
                    'query_args' => [
                        'post_status' => 'publish',
                        'posts_per_page' => - 1,
                    ],
                ],
                [
                    'id' => 'mb_footer_spacing',
                    'name' => esc_html__('Paddings', 'motto'),
                    'type' => 'wgl_offset',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_footer_switch', '=', 'on'],
                            ['mb_footer_building_tool', '=', 'widgets'],
                        ]],
                    ],
                    'options' => [
                        'mode' => 'padding',
                        'top' => true,
                        'right' => true,
                        'bottom' => true,
                        'left' => true,
                    ],
                    'std' => [
                        'padding-top' => '0',
                        'padding-right' => '0',
                        'padding-bottom' => '0',
                        'padding-left' => '0'
                    ],
                ],
                [
                    'id' => 'mb_footer_bg',
                    'name' => esc_html__('Background', 'motto'),
                    'type' => 'wgl_background',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_footer_switch', '=', 'on'],
                            ['mb_footer_building_tool', '=', 'widgets'],
                        ]],
                    ],
                    'image' => '',
                    'position' => 'center center',
                    'attachment' => 'scroll',
                    'size' => 'cover',
                    'repeat' => 'no-repeat',
                    'color' => '#ffffff',
                ],
                [
                    'id' => 'mb_footer_add_border',
                    'name' => esc_html__('Add Border Top', 'motto'),
                    'type' => 'switch',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_footer_switch', '=', 'on'],
                            ['mb_footer_building_tool', '=', 'widgets'],
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_footer_border_color',
                    'name' => esc_html__('Border Color', 'motto'),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_footer_switch', '=', 'on'],
                            ['mb_footer_add_border', '=', '1'],
                        ]],
                    ],
                    'alpha_channel' => true,
                    'js_options' => ['defaultColor' => '#e5e5e5'],
                    'std' => '#e5e5e5',
                ],
            ],
        ];

        return $meta_boxes;
    }

    public function page_copyright_meta_boxes( $meta_boxes )
    {
        $meta_boxes[] = [
            'title' => esc_html__('Copyright', 'motto'),
            'post_types' => ['page'],
            'context' => 'advanced',
            'fields' => [
                [
                    'id' => 'mb_copyright_switch',
                    'name' => esc_html__('Copyright', 'motto'),
                    'type' => 'button_group',
                    'multiple' => false,
                    'options' => [
                        'default' => esc_html__( 'Default', 'motto' ),
                        'on' => esc_html__( 'Enable', 'motto' ),
                        'off' => esc_html__( 'Disable', 'motto' ),
                    ],
                    'std' => 'default',
                ],
                [
                    'name' => esc_html__('Copyright Settings', 'motto'),
                    'type' => 'wgl_heading',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_copyright_switch', '=', 'on']
                        ]],
                    ],
                ],
                [
                    'id' => 'mb_copyright_editor',
                    'name' => esc_html__('Editor', 'motto'),
                    'type' => 'textarea',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_copyright_switch', '=', 'on']
                        ]],
                    ],
                    'cols' => 20,
                    'rows' => 3,
                    'std' => esc_html__('Copyright © 2024 Motto by WebGeniusLab. All Rights Reserved', 'motto'),
                ],
                [
                    'id' => 'mb_copyright_text_color',
                    'name' => esc_html__( 'Text Color', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_copyright_switch', '=', 'on' ]
                        ] ],
                    ],
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'copyright_text_color' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'copyright_text_color' ) ),
                ],
                [
                    'id' => 'mb_copyright_bg_color',
                    'name' => esc_html__( 'Background Color', 'motto' ),
                    'type' => 'color',
                    'attributes' => [
                        'data-conditional-logic' => [ [
                            [ 'mb_copyright_switch', '=', 'on' ]
                        ] ],
                    ],
                    'js_options' => [ 'defaultColor' => esc_attr( WGL_Framework::get_option( 'copyright_bg_color' ) ) ],
                    'std' => esc_attr( WGL_Framework::get_option( 'copyright_bg_color' ) ),
                ],
                [
                    'id' => 'mb_copyright_spacing',
                    'name' => esc_html__('Paddings', 'motto'),
                    'type' => 'wgl_offset',
                    'attributes' => [
                        'data-conditional-logic' => [[
                            ['mb_copyright_switch', '=', 'on']
                        ]],
                    ],
                    'options' => [
                        'mode' => 'padding',
                        'top' => true,
                        'right' => false,
                        'bottom' => true,
                        'left' => false,
                    ],
                    'std' => [
                        'padding-top' => esc_attr(WGL_Framework::get_option('copyright_spacing')['padding-top'] ?? ''),
                        'padding-bottom' => esc_attr(WGL_Framework::get_option('copyright_spacing')['padding-bottom'] ?? ''),
                    ],
                ],
            ],
        ];

        return $meta_boxes;
    }
}

new Motto_Metaboxes();
