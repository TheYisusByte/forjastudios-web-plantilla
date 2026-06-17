<?php
/**
 * Custom Post Types de Forja Studios.
 *
 * Los nombres GraphQL (graphql_single_name / graphql_plural_name) están
 * alineados con las queries del front en src/lib/wp/queries.ts:
 *   proyecto  -> proyectos
 *   ip        -> ips
 *   miembro   -> miembros
 *   cliente   -> clientes
 *
 * NO cambiar los plurales sin actualizar también queries.ts.
 */

if (! defined('ABSPATH')) {
    exit;
}

function forja_register_post_types(): void {

    // ── Proyecto ──────────────────────────────────────────────────────────
    register_post_type('proyecto', [
        'labels' => [
            'name'          => 'Proyectos',
            'singular_name' => 'Proyecto',
            'add_new_item'  => 'Añadir proyecto',
            'edit_item'     => 'Editar proyecto',
            'menu_name'     => 'Proyectos',
        ],
        'public'              => true,
        'has_archive'         => false,
        'menu_icon'           => 'dashicons-format-video',
        'menu_position'       => 20,
        // page-attributes => permite ordenar manualmente (menu_order) en el front.
        'supports'            => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes'],
        'rewrite'             => ['slug' => 'proyectos'],
        // Headless: visible en REST y GraphQL.
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'proyecto',
        'graphql_plural_name' => 'proyectos',
    ]);

    // ── IP (propiedad intelectual) ──────────────────────────────────────────
    register_post_type('ip', [
        'labels' => [
            'name'          => 'IPs',
            'singular_name' => 'IP',
            'add_new_item'  => 'Añadir IP',
            'edit_item'     => 'Editar IP',
            'menu_name'     => 'IPs',
        ],
        'public'              => true,
        'has_archive'         => false,
        'menu_icon'           => 'dashicons-star-filled',
        'menu_position'       => 21,
        'supports'            => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes'],
        'rewrite'             => ['slug' => 'ips'],
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'ip',
        'graphql_plural_name' => 'ips',
    ]);

    // ── Miembro (equipo · blacksmiths) ──────────────────────────────────────
    register_post_type('miembro', [
        'labels' => [
            'name'          => 'Equipo',
            'singular_name' => 'Miembro',
            'add_new_item'  => 'Añadir miembro',
            'edit_item'     => 'Editar miembro',
            'menu_name'     => 'Equipo',
        ],
        'public'              => true,
        'has_archive'         => false,
        'menu_icon'           => 'dashicons-groups',
        'menu_position'       => 22,
        'supports'            => ['title', 'thumbnail', 'custom-fields', 'page-attributes'],
        'rewrite'             => ['slug' => 'equipo'],
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'miembro',
        'graphql_plural_name' => 'miembros',
    ]);

    // ── Cliente (logos / prueba social) ─────────────────────────────────────
    register_post_type('cliente', [
        'labels' => [
            'name'          => 'Clientes',
            'singular_name' => 'Cliente',
            'add_new_item'  => 'Añadir cliente',
            'edit_item'     => 'Editar cliente',
            'menu_name'     => 'Clientes',
        ],
        'public'              => true,
        'has_archive'         => false,
        'menu_icon'           => 'dashicons-awards',
        'menu_position'       => 23,
        'supports'            => ['title', 'thumbnail', 'custom-fields', 'page-attributes'],
        'rewrite'             => ['slug' => 'clientes'],
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'cliente',
        'graphql_plural_name' => 'clientes',
    ]);
}
add_action('init', 'forja_register_post_types');
