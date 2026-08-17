<?php
/**
 * Plugin Name:       Forja Headless
 * Plugin URI:        https://www.forjastudios.com/
 * Description:        Custom Post Types, taxonomías y campos ACF de Forja Studios, expuestos en WPGraphQL para el front headless en Next.js. Define proyecto, ip, miembro y cliente.
 * Version:           1.8.0
 * Author:            Forja Studios
 * Text Domain:       forja-headless
 * Requires at least: 6.4
 * Requires PHP:      8.0
 *
 * --------------------------------------------------------------------------
 *  Instalación (multisite — sitio /forja/, ID 4)
 * --------------------------------------------------------------------------
 *  Opción A (recomendada · plugin normal):
 *    1. Sube la carpeta `forja-headless/` a  wp-content/plugins/
 *    2. Activa "Forja Headless" SOLO en el sitio /forja/
 *       (…/forja/wp-admin/plugins.php). No lo actives en red salvo que
 *       quieras los CPT en todos los sitios del multisite.
 *
 *  Opción B (must-use · carga automática, sin activar):
 *    1. Copia la carpeta `forja-headless/` a  wp-content/mu-plugins/
 *    2. Crea  wp-content/mu-plugins/forja-headless-loader.php  con:
 *         <?php require __DIR__ . '/forja-headless/forja-headless.php';
 *       (los mu-plugins solo autocargan archivos en la raíz, no subcarpetas).
 *
 *  Opción C (rápida · functions.php del theme):
 *    Pega el contenido de los archivos de /inc dentro del functions.php del
 *    theme activo. Menos recomendable: se pierde al cambiar de theme.
 *
 * --------------------------------------------------------------------------
 *  Plugins requeridos (instalar/activar en el sitio /forja/)
 * --------------------------------------------------------------------------
 *    - WPGraphQL                         (expone el esquema GraphQL)
 *    - Advanced Custom Fields  (free)    (los campos usados son free)
 *    - WPGraphQL for ACF       (v2+)     (expone los grupos ACF en GraphQL)
 *  Para i18n ES/EN (filtro `where: { language: ... }` que usa el front):
 *    - Polylang  +  WPGraphQL Polylang   (ver inc/graphql.php)
 *
 *  Endpoint GraphQL resultante:  https://<dominio>/graphql
 *
 * --------------------------------------------------------------------------
 *  Changelog
 * --------------------------------------------------------------------------
 *  1.8.0
 *    - Campo ACF `clienteLogo` en los proyectos: el logo del cliente que el
 *      front muestra bajo la portada de la página interna, junto a su nombre.
 *      Si se deja vacío, el front busca el logo en el CPT «Cliente» que se
 *      llame igual, así que solo hace falta rellenarlo en las excepciones.
 *  1.7.0
 *    - Miniatura propia para los vídeos de galería: un adjunto de vídeo puede
 *      llevar imagen destacada (su fotograma de portada) y el campo `galeria`
 *      la expone como `poster` + `posterSrcSet`. Antes la galería enseñaba la
 *      portada del proyecto en todos los vídeos. Los fotogramas los genera
 *      `scripts/wp-video-posters.py` en el repo del front.
 *    - `galeria` devuelve también el ancho y el alto de los VÍDEOS (los saca
 *      WordPress con getID3 al subirlos), para que el masonry del front
 *      respete su proporción real en vez de asumir 16:9.
 *  1.6.0
 *    - Optimización de medios (inc/media-optimization.php): los tamaños
 *      derivados se generan en WebP (nativo de WP 5.8+, ~50-70 % menos peso),
 *      dos anchos intermedios (1280/1600) para que el srcSet no dé saltos, y
 *      techo del original en 2048. Solo afecta a subidas nuevas: para el
 *      material ya subido hay que regenerar miniaturas (`wp media regenerate`).
 *  1.5.0
 *    - El campo GraphQL `galeria` expone `srcSet`. El front sirve esas variantes
 *      en lugar de pasar las imágenes por el optimizador de Vercel, cuya cuota
 *      se agotaba y devolvía 402 (imágenes rotas). Ver inc/graphql.php.
 *  1.4.0
 *    - Revalidación on-demand del front (inc/revalidate.php): al guardar/borrar
 *      contenido o medios, WordPress avisa a /api/revalidate en Vercel y los
 *      cambios se ven SIN redeploy. Se configura en Ajustes → Forja Headless
 *      (URL + secreto) o con las constantes FORJA_REVALIDATE_URL/_SECRET.
 *  1.3.0
 *    - Metabox "Galería" visible en el editor de Proyecto e IP (inc/galeria-metabox.php):
 *      selecciona/ordena/quita imágenes y videos con la Biblioteca de Medios.
 *      Guarda los IDs en el meta `_forja_galeria`; el campo GraphQL `galeria` lo
 *      lee (con fallback a medios adjuntos). La forma en GraphQL no cambia.
 *  1.2.0
 *    - IPs equiparadas a proyectos: nuevo campo ACF `cover` (imagen) en camposIp
 *      y campo GraphQL `galeria` (medios adjuntos) también en el tipo `Ip`.
 *  1.1.0
 *    - Redirección headless del front al sitio público (inc/headless-redirect.php),
 *      con exenciones para /graphql, REST, admin, login, cron, medios y entorno local.
 *    - Campos ACF expuestos en REST (`show_in_rest`) para poder crear/editar
 *      proyectos y subir medios por la API REST además de GraphQL.
 *  1.0.0
 *    - CPTs (proyecto/ip/miembro/cliente), taxonomía `categoria`, campos ACF y
 *      exposición en WPGraphQL.
 */

if (! defined('ABSPATH')) {
    exit; // Sin acceso directo.
}

define('FORJA_HEADLESS_DIR', plugin_dir_path(__FILE__));

require_once FORJA_HEADLESS_DIR . 'inc/post-types.php';
require_once FORJA_HEADLESS_DIR . 'inc/taxonomies.php';
require_once FORJA_HEADLESS_DIR . 'inc/acf-fields.php';
require_once FORJA_HEADLESS_DIR . 'inc/graphql.php';
require_once FORJA_HEADLESS_DIR . 'inc/galeria-metabox.php';
require_once FORJA_HEADLESS_DIR . 'inc/headless-redirect.php';
require_once FORJA_HEADLESS_DIR . 'inc/revalidate.php';
require_once FORJA_HEADLESS_DIR . 'inc/media-optimization.php';

/**
 * Al activar, refresca las reglas de reescritura para que los slugs de los
 * CPT funcionen de inmediato sin tener que re-guardar los enlaces permanentes.
 */
register_activation_hook(__FILE__, function () {
    forja_register_post_types();
    forja_register_taxonomies();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});
