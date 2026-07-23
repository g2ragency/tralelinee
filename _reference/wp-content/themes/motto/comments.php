<?php
defined('ABSPATH') || exit;

/**
 * The template for displaying comments
 *
 * This is the template that displays the area of the page that contains both the current comments
 * and the comment form.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package motto
 * @author WebGeniusLab <webgeniuslab@gmail.com>
 * @since 1.0.0
 */

/*
 * If the current post is protected by a password and the visitor
 * has not yet entered the password then return without loading the comments.
 */
if (post_password_required()) return;

if (have_comments() || comments_open()) {
    echo '<div id="comments">';
}

if (have_comments()) :
    ?>
    <h4 class="comments-title">
        <?php
        $comments_number = get_comments_number();
        if ( '1' === $comments_number ) {
            /* translators: %s: post title */
            printf( _x( 'Comment<span class="number-comments">(01)</span>', 'comments title', 'motto' ));
        } else {
            $comments_number = (int) $comments_number < 10 ? '0'.$comments_number : $comments_number;
            printf(
                _nx(
                    'Comments<span class="number-comments">(%1$s)</span>',
                    'Comments<span class="number-comments">(%1$s)</span>',
                    $comments_number,
                    'comments title',
                    'motto'
                ),
                $comments_number
            );
        }
        ?>
    </h4>

    <ol class="commentlist">
        <?php
            wp_list_comments(array(
                'walker' => new Motto_Walker_Comment(),
                'avatar_size' => 70,
                'short_ping' => true
            ) );
        ?>
    </ol>
    <?php
    if (get_comment_pages_count() > 1) {
        ?>
        <div><?php paginate_comments_links(); ?></div>
        <?php
    }
endif;
    $args = array();
    $args['fields'] = array(
        'author' => '<div class="comment-form-author wgl_col-6"><label for="author" class="label-name"></label><input type="text" placeholder="' . esc_attr__('Your Name *', 'motto') . '" title="' . esc_attr__('Your Name *', 'motto') . '" id="author" name="author" class="form_field"></div>',
        'email' => '<div class="comment-form-email wgl_col-6"><label for="email" class="label-email"></label><input type="text" placeholder="' . esc_attr__('Your Email *', 'motto') . '" title="' . esc_attr__('Your Email *', 'motto') . '" id="email" name="email" class="form_field"></div>',
        'url' => '<div class="comment-form-url wgl_col-12"><label for="url" class="label-url"></label><input type="text" placeholder="' . esc_attr__('Website', 'motto') . '" title="' . esc_attr__('Website', 'motto') . '" id="url" name="url" class="form_field"></div>'
    );
    $args['comment_field'] = '<div class="comment-form-comment wgl_col-12"><label for="comment" class="label-message" ></label><textarea name="comment" cols="45" rows="5" placeholder="' . esc_attr__('Your Comment...', 'motto') . '" id="comment" class="form_field"></textarea></div>';
    $args['label_submit'] = esc_attr__('POST COMMENT', 'motto');
    $args['submit_button'] = '<button name="%1$s" type="submit" id="%2$s" class="%3$s" value="%4$s">%4$s</button>';

    ob_start();
    comment_form($args);
    $comment_form = ob_get_clean();
    echo trim($comment_form);


if (have_comments() || comments_open()) {
    echo '</div>';
}
