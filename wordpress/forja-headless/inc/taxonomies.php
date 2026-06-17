<?php
/**
 * Taxonomías de Forja Studios.
 *
 * `categoria` clasifica los proyectos (Animación 2D/3D, VFX, Concept Art,
 * Videojuego, Ilustración…). El front la consulta como `categorias` sobre cada
 * proyecto (src/lib/wp/queries.ts → `categorias { nodes { name } }`).
 *
 * Sugerencia: crear los términos con un slug estable que coincida con el enum
 * ProjectCategory del front (src/lib/content/types.ts) para mapear sin lógica
 * extra:
 *   animation-2d, animation-3d, vfx, concept-art, game, illustration
 */

if (! defined('ABSPATH')) {
    exit;
}

function forja_register_taxonomies(): void {

    register_taxonomy('categoria', ['proyecto'], [
        'labels' => [
            'name'          => 'Categorías',
            'singular_name' => 'Categoría',
            'menu_name'     => 'Categorías',
        ],
        'public'              => true,
        'hierarchical'        => true, // se comporta como "categoría" (no como tag)
        'show_admin_column'   => true,
        'rewrite'             => ['slug' => 'categoria'],
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'categoria',
        'graphql_plural_name' => 'categorias',
    ]);
}
add_action('init', 'forja_register_taxonomies');

/**
 * Siembra los términos de categoría con los slugs que espera el front,
 * la primera vez (idempotente). Se ejecuta tras registrar la taxonomía.
 */
add_action('init', function () {
    $terms = [
        'animation-2d' => 'Animación 2D',
        'animation-3d' => 'Animación 3D',
        'vfx'          => 'VFX',
        'concept-art'  => 'Concept Art',
        'game'         => 'Videojuego',
        'illustration' => 'Ilustración',
    ];

    foreach ($terms as $slug => $name) {
        if (! term_exists($slug, 'categoria')) {
            wp_insert_term($name, 'categoria', ['slug' => $slug]);
        }
    }
}, 11); // prioridad 11: después del register_taxonomy (prioridad 10)
