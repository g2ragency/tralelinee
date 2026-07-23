<?php
defined('ABSPATH') || exit;

/**
 * Template for displaying search forms
 *
 * @package motto
 * @author WebGeniusLab <webgeniuslab@gmail.com>
 * @since 1.0.0
 */

$unique_id = uniqid('search-form-');

echo '<form role="search" method="get" action="', esc_url(home_url('/')), '" class="search-form">',
    '<input',
        ' required',
        ' type="text"',
        ' id="', esc_attr($unique_id), '"',
        ' class="search-field"',
        ' placeholder="', esc_attr_x('Search...', 'placeholder', 'motto'), '"',
        ' value="', get_search_query(), '"',
        ' name="s"',
        '>',
    '<input class="search-button" type="submit" value="', esc_attr__('Search', 'motto'), '">',
    '<i class="search__icon flaticon-search"></i>',
'</form>';
