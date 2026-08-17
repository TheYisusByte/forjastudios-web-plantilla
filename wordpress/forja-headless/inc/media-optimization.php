<?php
/**
 * Optimización de medios para el consumo headless.
 * ---------------------------------------------------------------------------
 * El front NO pasa las imágenes por ningún optimizador externo: sirve
 * directamente los tamaños que genera WordPress (ver README, sección
 * "Imágenes"). Por tanto, lo que WordPress produzca al subir un archivo es
 * exactamente lo que descarga el visitante, y todo lo que se afine aquí se nota
 * en la web.
 *
 * Nada de esto toca los archivos ya subidos: solo afecta a los tamaños que
 * WordPress genera de ahí en adelante. Para aplicarlo al material existente hay
 * que regenerar las miniaturas (ver el final de este archivo).
 *
 * @package forja-headless
 */

if (! defined('ABSPATH')) {
    exit;
}

/**
 * 1. Los tamaños derivados se guardan en WebP.
 * ---------------------------------------------------------------------------
 * Nativo desde WordPress 5.8: el original conserva su formato y las variantes
 * (245w, 768w, 1024w…) pasan a WebP, que es lo que realmente sirve el sitio.
 * Recorta el peso entre un 50 % y un 70 % frente a JPEG/PNG, y es justo la
 * compresión que antes hacía el optimizador de Vercel.
 *
 * WordPress las nombra `imagen-768x941.jpg.webp`; el front lee la extensión del
 * propio `srcSet`, así que el cambio no le afecta (src/lib/wp/media.ts).
 *
 * Solo se activa si el servidor sabe escribir WebP: sin el guard, una GD o
 * Imagick sin soporte dejaría subidas sin miniaturas.
 */
add_filter('image_editor_output_format', function (array $formats): array {
    if (! wp_image_editor_supports(['mime_type' => 'image/webp'])) {
        return $formats;
    }
    $formats['image/jpeg'] = 'image/webp';
    $formats['image/png']  = 'image/webp';
    return $formats;
});

/**
 * 2. Calidad de compresión.
 * ---------------------------------------------------------------------------
 * WebP al 82 equivale visualmente a un JPEG al 90 pesando bastante menos. Para
 * JPEG se deja en 82 (el valor por defecto de WordPress es 82 desde 5.9; se fija
 * explícito para no depender de la versión).
 */
add_filter('wp_editor_set_quality', function (int $quality, string $mime): int {
    return $mime === 'image/webp' ? 82 : 82;
}, 10, 2);

/**
 * 3. Tamaños intermedios propios.
 * ---------------------------------------------------------------------------
 * De serie WordPress salta de 1024 a 1536 y de ahí a 2048. Con esos huecos, una
 * tarjeta que necesita 1100 px se lleva el archivo de 1536. Estos dos anchos
 * rellenan el salto; al declararlos sin recorte (`$crop = false`) conservan el
 * aspecto y WordPress los añade solo al `srcSet`.
 *
 * El alto va a 0 = sin límite: manda el ancho.
 */
add_action('after_setup_theme', function (): void {
    add_image_size('forja-1280', 1280, 0, false);
    add_image_size('forja-1600', 1600, 0, false);
});

/**
 * 4. Techo del original.
 * ---------------------------------------------------------------------------
 * WordPress reescala lo que supere 2560 px y guarda ese reescalado como
 * `-scaled`. El sitio nunca sirve una imagen por encima de 2048, así que ese
 * techo solo genera un archivo enorme que alguien acabará descargando cuando
 * ninguna variante cubra el ancho pedido.
 */
add_filter('big_image_size_threshold', function (): int {
    return 2048;
});

/**
 * 5. Los vídeos pueden tener imagen destacada (su póster).
 * ---------------------------------------------------------------------------
 * WordPress no saca un fotograma de los vídeos que se suben (no lleva ffmpeg),
 * así que la galería del front se quedaba sin miniatura propia y acababa
 * enseñando la portada del proyecto en todos los vídeos.
 *
 * Con este soporte, un adjunto de vídeo puede llevar su propia imagen
 * destacada, que es la que el campo `galeria` expone como `poster`
 * (inc/graphql.php). Se asigna de dos formas:
 *
 *   - En masa: `python3 scripts/wp-video-posters.py` en el repo del front —
 *     saca el primer fotograma de cada vídeo, lo sube y lo asigna.
 *   - A mano: Medios → (el vídeo) → Editar → "Imagen destacada".
 *
 * `show_in_rest` es lo que permite al script asignarla con
 * `POST /wp-json/wp/v2/media/<id> {"featured_media": <id-imagen>}`.
 */
add_action('init', function (): void {
    add_post_type_support('attachment', 'thumbnail');
});

/**
 * Aplicar esto al material YA subido
 * ---------------------------------------------------------------------------
 * Los filtros de arriba solo actúan al generar miniaturas. Para el contenido
 * existente hay que regenerarlas, con una de estas dos vías:
 *
 *   - WP-CLI (preferible, no depende del navegador):
 *       wp media regenerate --yes
 *
 *   - Plugin «Regenerate Thumbnails»: Herramientas → Regenerate Thumbnails.
 *
 * Ojo: con cientos de imágenes el proceso tarda y consume CPU. Conviene lanzarlo
 * fuera de horario. Después, purgar la caché del front para que recoja las
 * nuevas URLs: basta con guardar cualquier proyecto (dispara la revalidación de
 * inc/revalidate.php) o llamar al endpoint /api/revalidate.
 *
 * VÍDEOS
 * ---------------------------------------------------------------------------
 * WordPress NO transcodifica vídeo: lo sirve tal cual se sube, así que aquí no
 * hay nada que filtrar. Un .mp4 de 200 MB en una galería son 200 MB que se
 * descarga quien le dé al play. Hay que comprimirlos ANTES de subirlos —o
 * servirlos desde una plataforma de streaming— y subir solo la versión web.
 */
