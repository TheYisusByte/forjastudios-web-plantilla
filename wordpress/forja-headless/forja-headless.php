<?php
/**
 * Plugin Name:       Forja Headless
 * Plugin URI:        https://www.forjastudios.com/
 * Description:        Custom Post Types, taxonomías y campos ACF de Forja Studios, expuestos en WPGraphQL para el front headless en Next.js. Define proyecto, ip, miembro y cliente.
 * Version:           1.4.0
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
