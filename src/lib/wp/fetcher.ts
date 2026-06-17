import "server-only";

/**
 * Cliente GraphQL mínimo sobre `fetch` nativo (sin dependencias). Pensado para
 * Server Components / SSG + ISR en Next 16.
 *
 * - Lee el endpoint de `WP_GRAPHQL_URL` (p. ej. https://.../forja/graphql).
 * - Etiqueta la respuesta con el tag `site-content` para revalidación
 *   on-demand desde el webhook de WordPress (revalidateTag, doc 03).
 */

export const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL;

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

  const res = await fetch(WP_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // ISR: cachea y revalida vía tag (webhook WP → revalidateTag('site-content')).
    next: { tags: ["site-content"] },
  });

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
