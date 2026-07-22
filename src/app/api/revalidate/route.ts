import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Revalidación on-demand del contenido de WordPress.
 *
 * WordPress dispara un webhook (al publicar/actualizar cualquier CPT: proyecto,
 * ip, miembro, cliente) contra este endpoint, que invalida el tag `site-content`
 * con el que `wpFetch` etiqueta TODAS las respuestas de WPGraphQL
 * (ver `src/lib/wp/fetcher.ts`). Las páginas SSG que consumieron ese contenido
 * se regeneran en la próxima visita, sin necesidad de un redeploy.
 *
 * Autenticación: el secreto debe coincidir con `REVALIDATE_SECRET` y llegar por
 * la cabecera `x-revalidate-secret` (preferida) o el query `?secret=` (para
 * plugins de webhook que solo permiten configurar una URL).
 *
 * Métodos: `POST` (webhook) y `GET` (prueba manual desde el navegador).
 */

const TAG = "site-content";

// Nunca cachear la respuesta ni prerenderizar: siempre debe ejecutarse.
export const dynamic = "force-dynamic";

/** Comparación en tiempo constante para no filtrar el secreto por timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  // Sin secreto configurado en el entorno, nunca autorizamos (fail-closed).
  if (!expected) return false;
  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret") ??
    "";
  return safeEqual(provided, expected);
}

function revalidate(request: NextRequest): Response {
  if (!isAuthorized(request)) {
    return Response.json(
      { revalidated: false, message: "No autorizado" },
      { status: 401 },
    );
  }
  // `{ expire: 0 }`: expiración inmediata (caso webhook), en vez de la semántica
  // stale-while-revalidate de `"max"`. Así la siguiente visita ya trae el dato
  // fresco de WordPress.
  revalidateTag(TAG, { expire: 0 });
  return Response.json({ revalidated: true, tag: TAG, now: Date.now() });
}

export async function POST(request: NextRequest): Promise<Response> {
  return revalidate(request);
}

export async function GET(request: NextRequest): Promise<Response> {
  return revalidate(request);
}
