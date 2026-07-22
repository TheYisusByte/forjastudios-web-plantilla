<?php
/**
 * Campos ACF de Forja Studios, registrados en código (no en la UI) para que
 * viajen versionados con el repo y se expongan automáticamente en GraphQL.
 *
 * Los nombres de grupo y de campo coinciden EXACTAMENTE con las queries del
 * front (src/lib/wp/queries.ts). No renombrar sin actualizar el front:
 *
 *   camposProyecto { cliente, anio, videoUrl, cover, destacado }
 *   camposIp       { cover, descripcion, videoId, enlace, logo }   (+ galeria = adjuntos)
 *
 * La GALERÍA de cada proyecto (imágenes y videos de la página interna) NO es un
 * campo ACF (Gallery es ACF PRO): se resuelve desde los MEDIOS ADJUNTOS al post
 * vía el campo GraphQL `galeria` registrado en inc/graphql.php.
 *   camposMiembro  { rol, foto, redes }
 *   camposCliente  { sitioWeb, logo }   (uso futuro)
 *
 * Todos los tipos usados (text, number, url, image, true_false, textarea)
 * están disponibles en ACF gratuito. La exposición en GraphQL la aporta el
 * plugin "WPGraphQL for ACF" (v2+): cada grupo se mapea a su tipo de CPT vía
 * `graphql_types` y cada campo es visible con `show_in_graphql`.
 */

if (! defined('ABSPATH')) {
    exit;
}

add_action('acf/init', 'forja_register_acf_fields');

function forja_register_acf_fields(): void {
    if (! function_exists('acf_add_local_field_group')) {
        return; // ACF no está activo.
    }

    // ── Campos · Proyecto ───────────────────────────────────────────────────
    acf_add_local_field_group([
        'key'    => 'group_forja_proyecto',
        'title'  => 'Campos · Proyecto',
        'fields' => [
            [
                'key'           => 'field_proyecto_cliente',
                'label'         => 'Cliente',
                'name'          => 'cliente',
                'type'          => 'text',
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_proyecto_anio',
                'label'         => 'Año',
                'name'          => 'anio',
                'type'          => 'number',
                'min'           => 1990,
                'max'           => 2100,
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_proyecto_videoUrl',
                'label'         => 'Video URL (YouTube/Vimeo)',
                'name'          => 'videoUrl',
                'type'          => 'url',
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_proyecto_cover',
                'label'         => 'Cover (miniatura)',
                'name'          => 'cover',
                'type'          => 'image',
                'return_format' => 'array', // WPGraphQL for ACF lo expone como conexión a MediaItem
                'preview_size'  => 'medium',
                'library'       => 'all',
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_proyecto_destacado',
                'label'         => 'Destacado (home)',
                'name'          => 'destacado',
                'type'          => 'true_false',
                'ui'            => 1,
                'default_value' => 0,
                'show_in_graphql' => 1,
            ],
        ],
        'location' => [
            [['param' => 'post_type', 'operator' => '==', 'value' => 'proyecto']],
        ],
        'active'             => true,
        'show_in_graphql'    => 1,
        'show_in_rest'       => 1, // expone/escribe los campos bajo `acf` en la REST API
        'graphql_field_name' => 'camposProyecto',
        'graphql_types'      => ['Proyecto'], // = graphql_single_name capitalizado
    ]);

    // ── Campos · IP ───────────────────────────────────────────────────────
    acf_add_local_field_group([
        'key'    => 'group_forja_ip',
        'title'  => 'Campos · IP',
        'fields' => [
            [
                'key'           => 'field_ip_cover',
                'label'         => 'Cover (imagen)',
                'name'          => 'cover',
                'type'          => 'image',
                'return_format' => 'array', // WPGraphQL for ACF lo expone como conexión a MediaItem
                'preview_size'  => 'medium',
                'library'       => 'all',
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_ip_descripcion',
                'label'         => 'Descripción',
                'name'          => 'descripcion',
                'type'          => 'textarea',
                'rows'          => 4,
                'new_lines'     => 'br',
                'show_in_graphql' => 1,
            ],
            [
                // Video de fondo de la sección IPs (concepto E). Solo el ID de
                // YouTube (p. ej. dQw4w9WgXcQ), no la URL completa.
                'key'           => 'field_ip_videoId',
                'label'         => 'Video de fondo (YouTube ID)',
                'name'          => 'videoId',
                'type'          => 'text',
                'instructions'  => 'Solo el ID del video de YouTube (ej. dQw4w9WgXcQ).',
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_ip_enlace',
                'label'         => 'Enlace',
                'name'          => 'enlace',
                'type'          => 'url',
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_ip_logo',
                'label'         => 'Logo / arte',
                'name'          => 'logo',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'medium',
                'library'       => 'all',
                'show_in_graphql' => 1,
            ],
        ],
        'location' => [
            [['param' => 'post_type', 'operator' => '==', 'value' => 'ip']],
        ],
        'active'             => true,
        'show_in_graphql'    => 1,
        'show_in_rest'       => 1,
        'graphql_field_name' => 'camposIp',
        'graphql_types'      => ['Ip'],
    ]);

    // ── Campos · Miembro ────────────────────────────────────────────────────
    acf_add_local_field_group([
        'key'    => 'group_forja_miembro',
        'title'  => 'Campos · Miembro',
        'fields' => [
            [
                'key'           => 'field_miembro_rol',
                'label'         => 'Rol',
                'name'          => 'rol',
                'type'          => 'text',
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_miembro_foto',
                'label'         => 'Foto',
                'name'          => 'foto',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'medium',
                'library'       => 'all',
                'show_in_graphql' => 1,
            ],
            [
                // Redes: una URL por línea (Instagram, ArtStation, LinkedIn…).
                'key'           => 'field_miembro_redes',
                'label'         => 'Redes (una URL por línea)',
                'name'          => 'redes',
                'type'          => 'textarea',
                'rows'          => 4,
                'show_in_graphql' => 1,
            ],
        ],
        'location' => [
            [['param' => 'post_type', 'operator' => '==', 'value' => 'miembro']],
        ],
        'active'             => true,
        'show_in_graphql'    => 1,
        'show_in_rest'       => 1,
        'graphql_field_name' => 'camposMiembro',
        'graphql_types'      => ['Miembro'],
    ]);

    // ── Campos · Cliente (uso futuro) ────────────────────────────────────────
    acf_add_local_field_group([
        'key'    => 'group_forja_cliente',
        'title'  => 'Campos · Cliente',
        'fields' => [
            [
                'key'           => 'field_cliente_sitioWeb',
                'label'         => 'Sitio web',
                'name'          => 'sitioWeb',
                'type'          => 'url',
                'show_in_graphql' => 1,
            ],
            [
                'key'           => 'field_cliente_logo',
                'label'         => 'Logo',
                'name'          => 'logo',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'medium',
                'library'       => 'all',
                'show_in_graphql' => 1,
            ],
        ],
        'location' => [
            [['param' => 'post_type', 'operator' => '==', 'value' => 'cliente']],
        ],
        'active'             => true,
        'show_in_graphql'    => 1,
        'show_in_rest'       => 1,
        'graphql_field_name' => 'camposCliente',
        'graphql_types'      => ['Cliente'],
    ]);
}
