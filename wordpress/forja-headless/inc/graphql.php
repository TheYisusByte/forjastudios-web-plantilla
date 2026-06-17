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
 * Galería de proyecto (página interna) = MEDIOS ADJUNTOS al post.
 * ----------------------------------------------------------------
 * El front (ProjectDetailGalleryE / ProjectsE) muestra una galería masonry con
 * imágenes y videos, usando las dimensiones reales para conservar el aspecto.
 * Como el campo Gallery de ACF es PRO, exponemos en su lugar los archivos
 * ADJUNTOS al proyecto (Subir/Adjuntar al post) vía un campo GraphQL propio
 * `galeria` en el tipo `Proyecto`. Imágenes y videos, en orden de menú.
 *
 * Edición en WP: en el proyecto, "Subir/insertar" imágenes y .mp4 y dejarlos
 * adjuntos al post; ordénalos con el "orden" del adjunto. El poster del video
 * es la imagen destacada del propio adjunto de video (si se asigna).
 */
add_action('graphql_register_types', function (): void {
    register_graphql_object_type('ForjaGaleriaItem', [
        'description' => 'Item de galería de un proyecto (imagen o video adjunto).',
        'fields'      => [
            'sourceUrl' => ['type' => 'String', 'description' => 'URL del archivo.'],
            'mimeType'  => ['type' => 'String', 'description' => 'MIME type (image/* o video/*).'],
            'width'     => ['type' => 'Int',    'description' => 'Ancho real (imágenes).'],
            'height'    => ['type' => 'Int',    'description' => 'Alto real (imágenes).'],
            'poster'    => ['type' => 'String', 'description' => 'Poster del video (imagen destacada del adjunto).'],
        ],
    ]);

    register_graphql_field('Proyecto', 'galeria', [
        'type'        => ['list_of' => 'ForjaGaleriaItem'],
        'description' => 'Medios adjuntos al proyecto (imágenes y videos), en orden de menú.',
        'resolve'     => function ($post): array {
            $parent_id = $post->databaseId ?? ($post->ID ?? 0);
            if (! $parent_id) {
                return [];
            }
            $atts = get_posts([
                'post_parent'    => $parent_id,
                'post_type'      => 'attachment',
                'post_mime_type' => ['image', 'video'],
                'post_status'    => 'inherit',
                'orderby'        => 'menu_order',
                'order'          => 'ASC',
                'numberposts'    => 50,
            ]);

            $out = [];
            foreach ($atts as $att) {
                $mime = get_post_mime_type($att->ID) ?: '';
                $item = [
                    'sourceUrl' => wp_get_attachment_url($att->ID) ?: null,
                    'mimeType'  => $mime,
                    'width'     => null,
                    'height'    => null,
                    'poster'    => null,
                ];
                if (strpos($mime, 'image/') === 0) {
                    $meta = wp_get_attachment_metadata($att->ID);
                    if (is_array($meta)) {
                        $item['width']  = isset($meta['width'])  ? (int) $meta['width']  : null;
                        $item['height'] = isset($meta['height']) ? (int) $meta['height'] : null;
                    }
                } else {
                    $thumb_id = get_post_thumbnail_id($att->ID);
                    if ($thumb_id) {
                        $item['poster'] = wp_get_attachment_url($thumb_id) ?: null;
                    }
                }
                $out[] = $item;
            }
            return $out;
        },
    ]);
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
