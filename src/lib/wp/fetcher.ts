import "server-only";

/**
 * Cliente GraphQL mínimo sobre `fetch` nativo (sin dependencias). Pensado para
 * Server Components / SSG + ISR en Next 16.
 *
 * - Lee el endpoint de `WP_GRAPHQL_URL` (p. ej. https://.../forja/graphql).
 * - Etiqueta la respuesta con el tag `site-content` para revalidación
 *   on-demand desde el webhook de WordPress (revalidateTag, doc 03).
 *
 * ⚠️ Caché: en Next 16 `fetch` NO se cachea por defecto ("auto no cache"), y en
 * una ruta prerenderizada eso significa consultar WP **una sola vez, durante
 * `next build`**: el dato queda congelado hasta el siguiente deploy y
 * `revalidateTag` no tiene nada que invalidar. Por eso pedimos caché explícita
 * (`force-cache`) + `next.revalidate`, que es lo que mete la respuesta en el
 * Data Cache con el tag y habilita el ISR.
 */

export const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL;

/**
 * Red de seguridad temporal del ISR (segundos). El webhook de WordPress hace
 * que los cambios se vean al instante; este intervalo es el respaldo por si el
 * webhook no está configurado o falla. `0`/negativo → sin caducidad por tiempo
 * (solo se refresca vía webhook).
 */
const REVALIDATE_SECONDS = (() => {
  const raw = Number(process.env.WP_REVALIDATE_SECONDS);
  if (!Number.isFinite(raw)) return 300; // 5 min por defecto
  return raw > 0 ? raw : false;
})();

/** ¿Hay backend WordPress configurado? Si no, el front usa el mock. */
export function isWpEnabled(): boolean {
  return Boolean(WP_GRAPHQL_URL);
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export async function wpFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!WP_GRAPHQL_URL) {
    throw new Error("WP_GRAPHQL_URL no está definido");
  }

  // Timeout duro: si WP está caído/lento, abortamos y dejamos que getSiteContent
  // caiga al mock en vez de colgar el render (build/ISR/SSR) esperando el TCP.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let res: Response;
  try {
    res = await fetch(WP_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      // Producción: entra al Data Cache con el tag `site-content`, así el webhook
      // de WP (→ revalidateTag) refresca el sitio sin redeploy, y `revalidate`
      // actúa de red de seguridad. Desarrollo: siempre fresco, para ver los
      // cambios del CMS con solo recargar.
      ...(process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : {
            cache: "force-cache" as const,
            next: { tags: ["site-content"], revalidate: REVALIDATE_SECONDS },
          }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`WPGraphQL HTTP ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(`WPGraphQL: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("WPGraphQL: respuesta sin datos");
  }

  return json.data;
}
