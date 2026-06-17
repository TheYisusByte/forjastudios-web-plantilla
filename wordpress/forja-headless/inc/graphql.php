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
