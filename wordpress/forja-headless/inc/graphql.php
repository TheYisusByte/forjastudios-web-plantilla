<?php
/**
 * Ajustes de GraphQL e i18n para el front headless.
 */

if (! defined('ABSPATH')) {
    exit;
}

/**
 * i18n (Polylang) — hace traducibles los CPT de Forja para que el filtro
 * `where: { language: $locale }` de las queries del front devuelva el contenido
 * en el idioma correcto (ES/EN).
 *
 * Requiere los plugins: Polylang + WPGraphQL Polylang.
 * Tras activarlos: Idiomas → Configuración → marca proyecto, ip, miembro y
 * cliente como traducibles (o se fuerza aquí abajo).
 */
add_filter('pll_get_post_types', function (array $post_types, bool $is_settings): array {
    foreach (['proyecto', 'ip', 'miembro', 'cliente'] as $cpt) {
        $post_types[$cpt] = $cpt;
    }
    return $post_types;
}, 10, 2);

/**
 * Sube el techo de resultados por página en GraphQL (por defecto 100).
 * Útil si el equipo crece o hay muchos proyectos y se piden todos de una.
 */
add_filter('graphql_connection_max_query_amount', function (int $max): int {
    return 200;
});

/**
 * Galería (página interna) = MEDIOS ADJUNTOS al post.
 * ----------------------------------------------------------------
 * El front muestra una galería masonry con imágenes y videos, usando las
 * dimensiones reales para conservar el aspecto. Como el campo Gallery de ACF es
 * PRO, exponemos en su lugar los archivos ADJUNTOS al post (Subir/Adjuntar) vía
 * un campo GraphQL propio `galeria`, registrado en los tipos `Proyecto` e `Ip`.
 * Imágenes y videos, en orden de menú.
 *
 * Edición en WP: en el proyecto/IP, "Subir/insertar" imágenes y .mp4 y dejarlos
 * adjuntos al post; ordénalos con el "orden" del adjunto. El poster del video
 * es la imagen destacada del propio adjunto de video (si se asigna).
 */
add_action('graphql_register_types', function (): void {
    register_graphql_object_type('ForjaGaleriaItem', [
        'description' => 'Item de galería (imagen o video adjunto).',
        'fields'      => [
            'sourceUrl' => ['type' => 'String', 'description' => 'URL del archivo.'],
            'mimeType'  => ['type' => 'String', 'description' => 'MIME type (image/* o video/*).'],
            'width'     => ['type' => 'Int',    'description' => 'Ancho real (imágenes y videos).'],
            'height'    => ['type' => 'Int',    'description' => 'Alto real (imágenes y videos).'],
            'poster'    => ['type' => 'String', 'description' => 'Poster del video (imagen destacada del adjunto).'],
            'posterSrcSet' => ['type' => 'String', 'description' => 'srcSet del poster, para servirlo en el tamaño que toca.'],
            // El front sirve estas variantes tal cual en vez de pasar las
            // imágenes por el optimizador de Vercel (cuota limitada). Mismo
            // formato que el campo `srcSet` de los MediaItem de WPGraphQL.
            'srcSet'    => ['type' => 'String', 'description' => 'srcSet con los tamaños generados por WP (imágenes).'],
        ],
    ]);

    // Resolver compartido. Los IDs vienen del metabox "Galería" (meta
    // `_forja_galeria`, en orden) o, si está vacío, de los medios adjuntos
    // (post_parent). Ver inc/galeria-metabox.php (forja_galeria_ids).
    $resolve_galeria = function ($post): array {
        $parent_id = (int) ($post->databaseId ?? ($post->ID ?? 0));
        if (! $parent_id) {
            return [];
        }
        $ids = function_exists('forja_galeria_ids') ? forja_galeria_ids($parent_id) : [];

        $out = [];
        foreach ($ids as $id) {
            $mime = get_post_mime_type($id) ?: '';
            $item = [
                'sourceUrl'    => wp_get_attachment_url($id) ?: null,
                'mimeType'     => $mime,
                'width'        => null,
                'height'       => null,
                'poster'       => null,
                'posterSrcSet' => null,
                'srcSet'       => null,
            ];
            if (! $item['sourceUrl']) {
                continue; // adjunto borrado; lo saltamos
            }
            // Dimensiones reales. WordPress las guarda igual para imágenes y
            // para videos (de estos las saca con getID3 al subirlos), y el
            // front las necesita en ambos casos: el masonry reserva el hueco
            // con el aspecto exacto y así no da saltos al cargar.
            $meta = wp_get_attachment_metadata($id);
            if (is_array($meta)) {
                $item['width']  = isset($meta['width'])  ? (int) $meta['width']  : null;
                $item['height'] = isset($meta['height']) ? (int) $meta['height'] : null;
            }
            if (strpos($mime, 'image/') === 0) {
                // Solo incluye las variantes que conservan el aspecto del
                // original (WP descarta ahí los tamaños recortados).
                $item['srcSet'] = wp_get_attachment_image_srcset($id, 'full') ?: null;
            } else {
                // Póster del video, por este orden:
                //   1. Imagen destacada del adjunto de video. La asigna
                //      `scripts/wp-video-posters.py` (primer fotograma del
                //      video) y también se puede poner a mano en Medios →
                //      Editar. Lo habilita el soporte 'thumbnail' que añade
                //      inc/media-optimization.php.
                //   2. Convención de nombre: una imagen de la mediateca llamada
                //      igual que el video con el sufijo `-poster`. Red de
                //      seguridad para quien la suba sin asignar nada.
                // Sin ninguna de las dos, el front saca el fotograma él mismo,
                // que funciona pero descarga bastante más.
                $thumb_id = (int) get_post_thumbnail_id($id);
                if (! $thumb_id) {
                    $slug  = sanitize_title(pathinfo(get_attached_file($id) ?: '', PATHINFO_FILENAME) . '-poster');
                    $found = $slug ? get_page_by_path($slug, OBJECT, 'attachment') : null;
                    if ($found) {
                        $thumb_id = (int) $found->ID;
                    }
                }
                if ($thumb_id) {
                    $item['poster']       = wp_get_attachment_url($thumb_id) ?: null;
                    $item['posterSrcSet'] = wp_get_attachment_image_srcset($thumb_id, 'full') ?: null;
                }
            }
            $out[] = $item;
        }
        return $out;
    };

    // Mismo campo `galeria` en proyectos e IPs.
    foreach (['Proyecto', 'Ip'] as $gql_type) {
        register_graphql_field($gql_type, 'galeria', [
            'type'        => ['list_of' => 'ForjaGaleriaItem'],
            'description' => 'Medios adjuntos (imágenes y videos), en orden de menú.',
            'resolve'     => $resolve_galeria,
        ]);
    }
});

/**
 * (Opcional) CORS para el endpoint /graphql cuando el front consume desde
 * Vercel / localhost. WPGraphQL ya envía cabeceras básicas; descomenta y
 * ajusta los orígenes permitidos si necesitas afinarlo.
 */
// add_filter('graphql_response_headers_to_send', function (array $headers): array {
//     $allowed = [
//         'https://www.forjastudios.com',
//         'https://forjastudios.com',
//         'http://localhost:3000',
//     ];
//     $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
//     if (in_array($origin, $allowed, true)) {
//         $headers['Access-Control-Allow-Origin']      = $origin;
//         $headers['Access-Control-Allow-Credentials'] = 'true';
//     }
//     return $headers;
// });

/**
 * NOTA sobre `destacado` y metaQuery
 * ----------------------------------
 * La query FEATURED_PROJECTS del front usa `metaQuery` para filtrar por el
 * campo `destacado`. Si tu versión de WPGraphQL no soporta `metaQuery` en los
 * `where`, registra aquí un argumento `where: { destacado: true }` propio.
 * Déjalo comentado hasta confirmar la versión de WPGraphQL en producción.
 */
// add_action('graphql_register_types', function () {
//     register_graphql_field('RootQueryToProyectoConnectionWhereArgs', 'destacado', [
//         'type'        => 'Boolean',
//         'description' => 'Filtra proyectos marcados como destacados.',
//     ]);
//     add_filter('graphql_post_object_connection_query_args', function (array $args, $source, array $input) {
//         if (($input['where']['destacado'] ?? null) === true) {
//             $args['meta_query'][] = ['key' => 'destacado', 'value' => '1', 'compare' => '='];
//         }
//         return $args;
//     }, 10, 3);
// });
