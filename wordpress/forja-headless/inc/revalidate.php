<?php
/**
 * Revalidación on-demand del front Next.js (webhook).
 * ----------------------------------------------------------------------------
 * Al publicar/actualizar/borrar contenido en este WordPress, avisamos al sitio
 * en Vercel para que refresque su caché. El front expone `/api/revalidate`
 * (ver src/app/api/revalidate/route.ts), que invalida el tag `site-content`
 * con el que se etiquetan TODAS las respuestas de WPGraphQL. Las páginas se
 * regeneran en la siguiente visita: **sin redeploy**.
 *
 * Qué dispara el aviso:
 *   - Guardar/publicar/borrar/restaurar un proyecto, ip, miembro o cliente.
 *   - Subir, editar o borrar un adjunto (imágenes y videos de la galería).
 *   - Crear/editar/borrar términos de la taxonomía `categoria`.
 * Todos los cambios de una misma petición se agrupan en UN solo aviso (shutdown).
 *
 * Configuración — Ajustes → Forja Headless (o constantes en wp-config.php,
 * que tienen prioridad sobre lo guardado en la base de datos):
 *   define('FORJA_REVALIDATE_URL',    'https://www.forjastudios.com/api/revalidate');
 *   define('FORJA_REVALIDATE_SECRET', '…el mismo valor que REVALIDATE_SECRET en Vercel…');
 * Desactivar:
 *   define('FORJA_REVALIDATE_DISABLE', true);
 */

if (! defined('ABSPATH')) {
    exit;
}

const FORJA_REVALIDATE_OPT_URL    = 'forja_revalidate_url';
const FORJA_REVALIDATE_OPT_SECRET = 'forja_revalidate_secret';
const FORJA_REVALIDATE_OPT_LAST   = 'forja_revalidate_last';

/** URL del endpoint de revalidación en el front. */
function forja_revalidate_url(): string {
    if (defined('FORJA_REVALIDATE_URL') && FORJA_REVALIDATE_URL) {
        return (string) FORJA_REVALIDATE_URL;
    }
    $saved = (string) get_option(FORJA_REVALIDATE_OPT_URL, '');
    if ($saved) {
        return $saved;
    }
    // Por defecto, el front público + la ruta del endpoint.
    $front = function_exists('forja_headless_front_url')
        ? forja_headless_front_url()
        : 'https://forjastudios.com';
    return untrailingslashit($front) . '/api/revalidate';
}

/** Secreto compartido con el front (`REVALIDATE_SECRET` en Vercel). */
function forja_revalidate_secret(): string {
    if (defined('FORJA_REVALIDATE_SECRET') && FORJA_REVALIDATE_SECRET) {
        return (string) FORJA_REVALIDATE_SECRET;
    }
    return (string) get_option(FORJA_REVALIDATE_OPT_SECRET, '');
}

/** Post types cuyo contenido consume el front. */
function forja_revalidate_post_types(): array {
    return apply_filters(
        'forja_revalidate_post_types',
        ['proyecto', 'ip', 'miembro', 'cliente', 'attachment']
    );
}

/**
 * Marca que esta petición debe avisar al front. El POST se envía una sola vez,
 * en `shutdown`, aunque se hayan tocado varios objetos (p. ej. un guardado que
 * dispara save_post + ACF + adjuntos).
 */
function forja_revalidate_schedule(string $reason = ''): void {
    static $scheduled = false;
    if ($scheduled) {
        return;
    }
    if (defined('FORJA_REVALIDATE_DISABLE') && FORJA_REVALIDATE_DISABLE) {
        return;
    }
    $scheduled = true;
    add_action('shutdown', function () use ($reason): void {
        forja_revalidate_send($reason, false);
    }, 99);
}

/**
 * Envía el webhook. Devuelve un array con el resultado (también se guarda en la
 * option `forja_revalidate_last` para mostrarlo en la pantalla de ajustes).
 *
 * @param bool $blocking Esperar la respuesta del front. Los disparadores
 *                       automáticos NO esperan (así guardar un post o subir 20
 *                       imágenes no se ralentiza); el botón "Probar ahora" sí,
 *                       porque su único propósito es verificar la conexión.
 */
function forja_revalidate_send(string $reason = 'manual', bool $blocking = true): array {
    $url    = forja_revalidate_url();
    $secret = forja_revalidate_secret();

    $result = ['time' => time(), 'reason' => $reason, 'url' => $url];

    if (! $url || ! $secret) {
        $result['ok']      = false;
        $result['message'] = 'Falta la URL o el secreto (Ajustes → Forja Headless).';
        update_option(FORJA_REVALIDATE_OPT_LAST, $result, false);
        return $result;
    }

    $response = wp_remote_post($url, [
        'timeout'   => $blocking ? 8 : 1,
        'blocking'  => $blocking,
        'headers'   => [
            'Content-Type'       => 'application/json',
            'x-revalidate-secret' => $secret,
        ],
        'body'      => wp_json_encode(['reason' => $reason, 'site' => home_url()]),
        'sslverify' => true,
    ]);

    if (is_wp_error($response)) {
        $result['ok']      = false;
        $result['message'] = $response->get_error_message();
    } elseif (! $blocking) {
        // Sin respuesta que leer: solo confirmamos que la petición salió.
        $result['ok']      = true;
        $result['message'] = 'Aviso enviado al front (sin esperar respuesta).';
    } else {
        $code           = (int) wp_remote_retrieve_response_code($response);
        $result['ok']   = $code >= 200 && $code < 300;
        $result['code'] = $code;
        if ($result['ok']) {
            $result['message'] = 'Front revalidado.';
        } else {
            // 401 = el secreto no coincide con REVALIDATE_SECRET en Vercel.
            $body              = trim((string) wp_remote_retrieve_body($response));
            $result['message'] = 'HTTP ' . $code . ($body ? ' — ' . $body : '');
        }
    }

    update_option(FORJA_REVALIDATE_OPT_LAST, $result, false);
    return $result;
}

// ── Disparadores ─────────────────────────────────────────────────────────────

add_action('save_post', function ($post_id, $post): void {
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
        return;
    }
    if ($post->post_status === 'auto-draft') {
        return;
    }
    if (! in_array($post->post_type, forja_revalidate_post_types(), true)) {
        return;
    }
    forja_revalidate_schedule($post->post_type . ':' . $post_id);
}, 20, 2);

// Papelera / restaurar / borrado definitivo.
foreach (['trashed_post', 'untrashed_post', 'deleted_post'] as $hook) {
    add_action($hook, function ($post_id) use ($hook): void {
        $type = get_post_type($post_id);
        if ($type && ! in_array($type, forja_revalidate_post_types(), true)) {
            return;
        }
        forja_revalidate_schedule($hook . ':' . $post_id);
    }, 20, 1);
}

// Medios: subir, editar (título/alt) o borrar afecta portadas y galerías.
foreach (['add_attachment', 'edit_attachment', 'delete_attachment'] as $hook) {
    add_action($hook, function ($post_id) use ($hook): void {
        forja_revalidate_schedule($hook . ':' . $post_id);
    }, 20, 1);
}

// Taxonomía `categoria` (etiqueta de categoría en las tarjetas del front).
foreach (['created_term', 'edited_term', 'delete_term'] as $hook) {
    add_action($hook, function ($term_id, $tt_id, $taxonomy) use ($hook): void {
        if ($taxonomy !== 'categoria') {
            return;
        }
        forja_revalidate_schedule($hook . ':' . $term_id);
    }, 20, 3);
}

// ── Pantalla de ajustes (Ajustes → Forja Headless) ───────────────────────────

add_action('admin_menu', function (): void {
    add_options_page(
        'Forja Headless',
        'Forja Headless',
        'manage_options',
        'forja-headless',
        'forja_revalidate_settings_page'
    );
});

add_action('admin_init', function (): void {
    register_setting('forja_headless', FORJA_REVALIDATE_OPT_URL, [
        'type'              => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default'           => '',
    ]);
    register_setting('forja_headless', FORJA_REVALIDATE_OPT_SECRET, [
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => '',
    ]);
});

/** Botón "Probar ahora": envía el webhook de inmediato y muestra el resultado. */
add_action('admin_post_forja_revalidate_test', function (): void {
    if (! current_user_can('manage_options')) {
        wp_die('Sin permisos.');
    }
    check_admin_referer('forja_revalidate_test');
    $result = forja_revalidate_send('test');
    wp_safe_redirect(add_query_arg(
        ['page' => 'forja-headless', 'forja_test' => $result['ok'] ? '1' : '0'],
        admin_url('options-general.php')
    ));
    exit;
});

function forja_revalidate_settings_page(): void {
    $last       = get_option(FORJA_REVALIDATE_OPT_LAST, []);
    $url_const  = defined('FORJA_REVALIDATE_URL') && FORJA_REVALIDATE_URL;
    $sec_const  = defined('FORJA_REVALIDATE_SECRET') && FORJA_REVALIDATE_SECRET;
    ?>
    <div class="wrap">
        <h1>Forja Headless</h1>
        <p>
            Avisa al sitio en Next.js/Vercel cada vez que cambia el contenido, para que
            los cambios se vean <strong>sin hacer un deploy</strong>. El secreto debe ser
            idéntico a la variable <code>REVALIDATE_SECRET</code> configurada en Vercel.
        </p>

        <?php if (isset($_GET['forja_test'])) : ?>
            <div class="notice notice-<?php echo $_GET['forja_test'] === '1' ? 'success' : 'error'; ?>">
                <p><?php echo esc_html($last['message'] ?? ''); ?></p>
            </div>
        <?php endif; ?>

        <form method="post" action="options.php">
            <?php settings_fields('forja_headless'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="forja_revalidate_url">URL de revalidación</label></th>
                    <td>
                        <input type="url" class="regular-text" id="forja_revalidate_url"
                               name="<?php echo esc_attr(FORJA_REVALIDATE_OPT_URL); ?>"
                               value="<?php echo esc_attr(get_option(FORJA_REVALIDATE_OPT_URL, '')); ?>"
                               placeholder="https://www.forjastudios.com/api/revalidate"
                               <?php disabled($url_const); ?>>
                        <p class="description">
                            <?php if ($url_const) : ?>
                                Definida en <code>wp-config.php</code>: <code><?php echo esc_html(FORJA_REVALIDATE_URL); ?></code>
                            <?php else : ?>
                                En uso: <code><?php echo esc_html(forja_revalidate_url()); ?></code>
                            <?php endif; ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="forja_revalidate_secret">Secreto</label></th>
                    <td>
                        <input type="password" class="regular-text" id="forja_revalidate_secret"
                               name="<?php echo esc_attr(FORJA_REVALIDATE_OPT_SECRET); ?>"
                               value="<?php echo esc_attr(get_option(FORJA_REVALIDATE_OPT_SECRET, '')); ?>"
                               autocomplete="off" <?php disabled($sec_const); ?>>
                        <p class="description">
                            <?php echo $sec_const
                                ? 'Definido en <code>wp-config.php</code>.'
                                : 'Debe coincidir con <code>REVALIDATE_SECRET</code> en Vercel.'; ?>
                        </p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

        <h2>Estado</h2>
        <?php if (! empty($last)) : ?>
            <p>
                Último aviso:
                <strong><?php echo ! empty($last['ok']) ? '✅ correcto' : '❌ falló'; ?></strong>
                — <?php echo esc_html($last['message'] ?? ''); ?><br>
                <span class="description">
                    <?php echo esc_html(
                        human_time_diff($last['time'] ?? time()) . ' atrás · motivo: ' . ($last['reason'] ?? '—')
                    ); ?>
                </span>
            </p>
        <?php else : ?>
            <p class="description">Todavía no se ha enviado ningún aviso.</p>
        <?php endif; ?>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="forja_revalidate_test">
            <?php wp_nonce_field('forja_revalidate_test'); ?>
            <?php submit_button('Probar ahora', 'secondary', 'submit', false); ?>
        </form>
    </div>
    <?php
}
