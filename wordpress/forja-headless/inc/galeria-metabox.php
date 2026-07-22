<?php
/**
 * Metabox "Galería" para Proyecto e IP.
 * ----------------------------------------------------------------------------
 * ACF libre no tiene campo Gallery (es PRO). En su lugar, este metabox usa la
 * Biblioteca de Medios nativa de WordPress para seleccionar, ORDENAR (drag) y
 * quitar imágenes/videos. Guarda los IDs (en orden) en el meta `_forja_galeria`.
 *
 * El campo GraphQL `galeria` (inc/graphql.php) lee ese meta; si está vacío, cae
 * a los medios adjuntos al post (post_parent), así no se pierde lo ya cargado.
 * La forma en GraphQL no cambia → el front no necesita cambios.
 */

if (! defined('ABSPATH')) {
    exit;
}

const FORJA_GALERIA_META = '_forja_galeria';

/** Post types que tienen galería. */
function forja_galeria_post_types(): array {
    return ['proyecto', 'ip'];
}

/**
 * IDs de la galería en orden.
 * - Si el meta ya se guardó alguna vez (aunque sea vacío) → se respeta tal cual
 *   (vacío = galería vacía a propósito).
 * - Si nunca se guardó → fallback a los medios adjuntos (post_parent), para no
 *   perder lo ya cargado (p. ej. el cover importado).
 */
function forja_galeria_ids(int $post_id): array {
    if (metadata_exists('post', $post_id, FORJA_GALERIA_META)) {
        $raw = (string) get_post_meta($post_id, FORJA_GALERIA_META, true);
        return $raw === ''
            ? []
            : array_values(array_filter(array_map('intval', explode(',', $raw))));
    }
    $atts = get_posts([
        'post_parent'    => $post_id,
        'post_type'      => 'attachment',
        'post_mime_type' => ['image', 'video'],
        'post_status'    => 'inherit',
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
        'numberposts'    => 50,
        'fields'         => 'ids',
    ]);
    return array_map('intval', $atts);
}

add_action('add_meta_boxes', function (): void {
    foreach (forja_galeria_post_types() as $pt) {
        add_meta_box(
            'forja_galeria',
            'Galería (imágenes y videos)',
            'forja_galeria_render',
            $pt,
            'normal',
            'default'
        );
    }
});

add_action('admin_enqueue_scripts', function ($hook): void {
    if (! in_array($hook, ['post.php', 'post-new.php'], true)) {
        return;
    }
    $screen = get_current_screen();
    if (! $screen || ! in_array($screen->post_type, forja_galeria_post_types(), true)) {
        return;
    }
    wp_enqueue_media();
    wp_enqueue_script('jquery-ui-sortable');
});

function forja_galeria_render($post): void {
    wp_nonce_field('forja_galeria_save', 'forja_galeria_nonce');
    $ids = forja_galeria_ids((int) $post->ID);
    ?>
    <div class="forja-galeria">
        <p class="description">Selecciona y arrastra para ordenar. El primero suele ser el más prominente en la página interna.</p>
        <ul class="forja-galeria-list">
            <?php foreach ($ids as $id):
                $url      = wp_get_attachment_image_url($id, 'thumbnail');
                $is_video = strpos((string) get_post_mime_type($id), 'video/') === 0;
            ?>
                <li data-id="<?php echo esc_attr($id); ?>">
                    <?php if ($url): ?>
                        <img src="<?php echo esc_url($url); ?>" alt="">
                    <?php else: ?>
                        <span class="forja-galeria-ph">#<?php echo esc_html((string) $id); ?></span>
                    <?php endif; ?>
                    <?php if ($is_video): ?><span class="forja-galeria-badge">video</span><?php endif; ?>
                    <button type="button" class="forja-galeria-remove" aria-label="Quitar">&times;</button>
                </li>
            <?php endforeach; ?>
        </ul>
        <input type="hidden" name="forja_galeria_ids" class="forja-galeria-ids" value="<?php echo esc_attr(implode(',', $ids)); ?>">
        <p>
            <button type="button" class="button button-primary forja-galeria-add">Añadir imágenes / videos</button>
        </p>
    </div>

    <style>
        .forja-galeria-list { display:flex; flex-wrap:wrap; gap:10px; margin:12px 0; padding:0; list-style:none; }
        .forja-galeria-list li { position:relative; width:96px; height:96px; border:1px solid #dcdcde; border-radius:4px; overflow:hidden; background:#f6f7f7; cursor:move; }
        .forja-galeria-list li img { width:100%; height:100%; object-fit:cover; display:block; }
        .forja-galeria-ph { display:flex; width:100%; height:100%; align-items:center; justify-content:center; color:#646970; font-size:12px; }
        .forja-galeria-badge { position:absolute; left:4px; bottom:4px; background:rgba(0,0,0,.7); color:#fff; font-size:10px; padding:1px 5px; border-radius:3px; }
        .forja-galeria-remove { position:absolute; top:2px; right:2px; width:20px; height:20px; line-height:18px; padding:0; border:none; border-radius:50%; background:rgba(0,0,0,.65); color:#fff; cursor:pointer; font-size:14px; }
        .forja-galeria-remove:hover { background:#d63638; }
        .forja-galeria-list li.placeholder { border:2px dashed #c3c4c7; background:transparent; }
    </style>

    <script>
    (function ($) {
        $(function () {
            var $box   = $('.forja-galeria');
            if (!$box.length) { return; }
            var $list  = $box.find('.forja-galeria-list');
            var $input = $box.find('.forja-galeria-ids');
            var frame;

            function sync() {
                var ids = $list.find('li').map(function () { return $(this).data('id'); }).get();
                $input.val(ids.join(','));
            }
            function thumb(a) {
                if (a.sizes && a.sizes.thumbnail) { return a.sizes.thumbnail.url; }
                return a.icon || a.url || '';
            }
            function addItem(a) {
                if ($list.find('li[data-id="' + a.id + '"]').length) { return; }
                var badge = a.type === 'video' ? '<span class="forja-galeria-badge">video</span>' : '';
                $list.append(
                    '<li data-id="' + a.id + '"><img src="' + thumb(a) + '" alt="">' + badge +
                    '<button type="button" class="forja-galeria-remove" aria-label="Quitar">&times;</button></li>'
                );
            }

            if ($list.sortable) {
                $list.sortable({ placeholder: 'placeholder', update: sync });
            }

            $box.on('click', '.forja-galeria-remove', function () {
                $(this).closest('li').remove();
                sync();
            });

            $box.on('click', '.forja-galeria-add', function (e) {
                e.preventDefault();
                if (frame) { frame.open(); return; }
                frame = wp.media({
                    title: 'Galería del proyecto / IP',
                    multiple: true,
                    library: { type: ['image', 'video'] },
                    button: { text: 'Añadir a la galería' }
                });
                frame.on('select', function () {
                    frame.state().get('selection').toJSON().forEach(addItem);
                    sync();
                });
                frame.open();
            });
        });
    })(jQuery);
    </script>
    <?php
}

add_action('save_post', function ($post_id): void {
    if (! isset($_POST['forja_galeria_nonce'])
        || ! wp_verify_nonce(sanitize_key($_POST['forja_galeria_nonce']), 'forja_galeria_save')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (! current_user_can('edit_post', $post_id)) {
        return;
    }
    if (! isset($_POST['forja_galeria_ids'])) {
        return;
    }
    $raw = sanitize_text_field(wp_unslash($_POST['forja_galeria_ids']));
    $ids = array_values(array_filter(array_map('intval', explode(',', $raw))));
    update_post_meta($post_id, FORJA_GALERIA_META, implode(',', $ids));
});
