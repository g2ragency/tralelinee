<?php
/**
 * Navigation section template.
 *
 *
 * @package motto\templates
 * @author WebGeniusLab <webgeniuslab@gmail.com>
 * @since 1.0.0
 */

use WGL_Extensions\WGL_Framework_Global_Variables;

$prevPost = get_adjacent_post(false, '', true);
$nextPost  = get_adjacent_post(false, '', false);

// KSES Allowed HTML
$allowed_html = [
    'a' => [
        'href' => true, 'title' => true,
        'class' => true, 'style' => true,
        'rel' => true, 'target' => true
    ],
    'br' => ['class' => true, 'style' => true],
    'b' => ['class' => true, 'style' => true],
    'em' => ['class' => true, 'style' => true],
    'strong' => ['class' => true, 'style' => true],
];

if ($nextPost || $prevPost) :

    echo '<section class="motto-post-navigation">';
        $icon_arrow = '<i class="link-icon flaticon flaticon-down-right-arrow"></i>';

        if (is_a($prevPost, 'WP_Post') ) :
            echo '<div class="prev-link_wrapper">',
                '<div class="info_wrapper">',
                    '<a href="', esc_url(get_permalink($prevPost->ID)), '" title="', esc_attr($prevPost->post_title), '">',
                        '<div class="prev-link-info_wrapper">',
                            '<div class="prev_title-info_wrap">', $icon_arrow, '<div class="prev_title-info">', esc_html__('PREV','motto'), '</div></div>',
                            '<h4 class="prev_title">', wp_kses( $prevPost->post_title, $allowed_html ), '</h4>',
                        '</div>',
                    '</a>',
                '</div>',
            '</div>';
        endif;

        if (is_a($nextPost, 'WP_Post') ) :
            echo '<div class="next-link_wrapper">',
                '<div class="info_wrapper">',
                    '<a href="', esc_url(get_permalink($nextPost->ID)), '" title="', esc_attr( $nextPost->post_title ), '">',
                        '<div class="next-link-info_wrapper">',
                            '<div class="next_title-info_wrap"><div class="next_title-info">', esc_html__('NEXT','motto'), '</div>', $icon_arrow, '</div>',
                            '<h4 class="next_title">', wp_kses( $nextPost->post_title, $allowed_html ), '</h4>',
                        '</div>',
                    '</a>',
                '</div>',
            '</div>';
        endif;

    echo '</section>';

endif;
