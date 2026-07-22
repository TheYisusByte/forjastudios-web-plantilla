<?php
/**
 * Redirección "headless" del front de WordPress.
 * ----------------------------------------------------------------------------
 * Este WordPress es solo backend (API GraphQL para el front Next.js). Cuando
 * alguien abre el FRONT de WordPress (https://api.forjastudios.com/...) en un
 * navegador, lo enviamos al sitio público (https://forjastudios.com) para no
 * exponer el theme crudo.
 *
 * NO se redirige (exenciones):
 *   - /graphql (la API que consume el front), /wp-json (REST), /wp-admin,
 *     login/registro, cron, WP-CLI y los archivos de /wp-content (medios).
 *   - Entorno local: localhost / 127.0.0.1 / *.local / *.test, o cuando
 *     wp_get_environment_type() es 'local' | 'development'. Así puedes
 *     desarrollar/depurar el propio WordPress sin que te expulse.
 *   - Usuarios logueados que pueden editar (previsualizar el front).
 *
 * Personalizar el destino (en wp-config.php o en un mu-plugin):
 *   define('FORJA_HEADLESS_FRONT_URL', 'https://forjastudios.com');
 *   add_filter('forja_headless_front_url', fn() => 'https://www.forjastudios.com');
 * Mapear ruta a ruta (por defecto va a la home, porque el front lleva prefijo de
 * idioma y no mapea 1:1 con WP):
 *   add_filter('forja_headless_redirect_location', function ($url, $req) { ... });
 * Desactivar por completo:
 *   define('FORJA_HEADLESS_DISABLE_REDIRECT', true);
 *   add_filter('forja_headless_redirect_enabled', '__return_false');
 */

if (! defined('ABSPATH')) {
    exit;
}

/** URL pública del sitio Next.js (destino del redirect). */
function forja_headless_front_url(): string {
    $url = defined('FORJA_HEADLESS_FRONT_URL') ? FORJA_HEADLESS_FRONT_URL : 'https://forjastudios.com';
    return (string) apply_filters('forja_headless_front_url', $url);
}

/** ¿Estamos en un entorno local del propio WordPress? (exención de desarrollo) */
function forja_headless_is_local(): bool {
    if (function_exists('wp_get_environment_type')
        && in_array(wp_get_environment_type(), ['local', 'development'], true)) {
        return true;
    }
    $host = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]); // host sin puerto
    if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
        return true;
    }
    foreach (['.local', '.test', '.localhost'] as $suffix) {
        if (str_ends_with($host, $suffix)) {
            return true;
        }
    }
    return false;
}

/**
 * Redirige las vistas de front al sitio público.
 *
 * Se engancha en `template_redirect`, que solo corre en peticiones de FRONT
 * (no admin, no REST, no GraphQL, no cron), así que esos quedan exentos de base;
 * aun así reforzamos con guardas explícitas por si otro plugin altera el flujo.
 */
add_action('template_redirect', function (): void {
    // Interruptor general.
    if (defined('FORJA_HEADLESS_DISABLE_REDIRECT') && FORJA_HEADLESS_DISABLE_REDIRECT) {
        return;
    }
    if (! apply_filters('forja_headless_redirect_enabled', true)) {
        return;
    }

    // Exenciones de contexto: admin, AJAX, cron, CLI, REST y GraphQL.
    if (is_admin()
        || wp_doing_ajax()
        || wp_doing_cron()
        || (defined('WP_CLI') && WP_CLI)
        || (defined('REST_REQUEST') && REST_REQUEST)
        || (function_exists('is_graphql_request') && is_graphql_request())) {
        return;
    }

    // Exención local (desarrollo del WordPress).
    if (forja_headless_is_local()) {
        return;
    }

    // Exención por ruta: API GraphQL, REST, login/registro y medios de wp-content.
    $request = $_SERVER['REQUEST_URI'] ?? '';
    foreach (['/graphql', '/wp-json', '/wp-login.php', '/wp-register.php', '/wp-content/'] as $needle) {
        if (strpos($request, $needle) !== false) {
            return;
        }
    }

    // Exención por usuario: editores logueados pueden previsualizar el front.
    if (is_user_logged_in() && current_user_can('edit_posts')) {
        return;
    }

    // Destino (por defecto la home pública). Filtrable para mapear ruta a ruta.
    $location = (string) apply_filters(
        'forja_headless_redirect_location',
        forja_headless_front_url(),
        $request
    );
    if (! $location) {
        return;
    }

    // 302 por defecto (reversible). Usa 301 solo si mapeas las rutas 1:1.
    $status = (int) apply_filters('forja_headless_redirect_status', 302);

    wp_redirect($location, $status);
    exit;
}, 0);
