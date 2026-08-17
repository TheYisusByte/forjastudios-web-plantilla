/**
 * Variantes de imagen de WordPress — evita el optimizador de Vercel.
 * ---------------------------------------------------------------------------
 * El plan Hobby de Vercel incluye 5.000 transformaciones de imagen al mes. Con
 * ~60 imágenes por página y un `srcSet` de 9 anchos cada una, esa cuota se agota
 * en días y las imágenes nuevas empiezan a devolver
 * `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`.
 *
 * WordPress YA genera tamaños intermedios de cada imagen (245w, 768w, 1024w,
 * 1536w, 2048w…) y los expone en el campo `srcSet` de WPGraphQL. Servirlos
 * directamente cuesta 0 transformaciones.
 *
 * Para que `next/image` pueda elegir la variante correcta sin que cada
 * componente tenga que recibir la lista, se codifica en el FRAGMENTO de la URL
 * (`#wp=…`). El fragmento nunca se envía al servidor, así que la URL sigue
 * siendo válida en cualquier otro contexto (`<video poster>`, texturas WebGL,
 * og:image): quien la use tal cual recibe el original.
 *
 * Formato:  <sourceUrl>#wp=<stem>:<WxH>,<WxH>,…
 * Ejemplo:  …/2026/06/tiefling-scaled.jpg#wp=tiefling:245x300,768x941,835x1024
 *
 * El `stem` va explícito porque no siempre coincide con el nombre del
 * `sourceUrl`: WordPress renombra los originales grandes a `-scaled` pero genera
 * las variantes a partir del nombre sin ese sufijo.
 *
 * Lo consume `src/lib/image-loader.ts` (loader global de next/image).
 */

/** Marca del fragmento que lleva las variantes. */
export const WP_VARIANTS_MARK = "#wp=";

/**
 * Prefijo same-origin que proxea los uploads de WordPress. Lo resuelve un
 * rewrite declarado en `next.config.ts` (si cambias uno, cambia el otro).
 *
 * Solo hace falta para WebGL: WordPress no envía cabeceras CORS, y una textura
 * cross-origin sin CORS "contamina" el canvas y no se puede pintar. Un rewrite
 * es un proxy, no una transformación, así que no toca la cuota de imágenes.
 */
export const WP_MEDIA_PROXY = "/wp-media/";

const UPLOADS_PATH = "/wp-content/uploads/";

/**
 * Reescribe una URL de uploads de WordPress a su equivalente same-origin.
 * Cualquier otra URL se devuelve sin tocar.
 */
export function toSameOriginMedia(url: string): string {
  const i = url.indexOf(UPLOADS_PATH);
  if (i === -1 || !url.startsWith("http")) return url;
  return WP_MEDIA_PROXY + url.slice(i + UPLOADS_PATH.length);
}

/**
 * Anexa las variantes de WordPress a la URL de la imagen.
 *
 * @param sourceUrl URL del archivo original (campo `sourceUrl` de WPGraphQL).
 * @param srcSet    Campo `srcSet` de WPGraphQL. WordPress solo incluye ahí las
 *                  variantes que conservan el aspecto del original (descarta las
 *                  recortadas como `thumbnail` 150x150), así que es la fuente
 *                  correcta: usar `mediaDetails.sizes` mezclaría recortes.
 * @returns la URL con el fragmento, o la original si no hay variantes usables.
 */
export function withWpVariants(
  sourceUrl: string | undefined | null,
  srcSet: string | undefined | null,
): string | undefined {
  if (!sourceUrl) return undefined;
  const parsed = parseWpSrcSet(srcSet);
  if (!parsed) return sourceUrl;
  return `${sourceUrl}${WP_VARIANTS_MARK}${parsed.stem}|${parsed.ext}:${parsed.sizes.join(",")}`;
}

/** Quita el fragmento de variantes. Para contextos que necesiten la URL limpia. */
export function stripWpVariants(url?: string): string | undefined {
  if (!url) return url;
  const i = url.indexOf(WP_VARIANTS_MARK);
  return i === -1 ? url : url.slice(0, i);
}

/**
 * Resuelve una URL con variantes al archivo de WordPress más pequeño que cubra
 * `width` píxeles. Si la URL no lleva variantes, o ninguna llega a ese ancho,
 * devuelve el original.
 *
 * Lo usa el loader de `next/image` y también los sitios donde la URL va a un
 * atributo HTML crudo (`<video poster>`, og:image), que de otro modo cargarían
 * el original a tamaño completo.
 */
export function resolveWpVariant(src: string, width: number): string {
  const mark = src.indexOf(WP_VARIANTS_MARK);
  if (mark === -1) return src;

  const url = src.slice(0, mark);
  const spec = src.slice(mark + WP_VARIANTS_MARK.length);
  const sep = spec.indexOf(":");
  const bar = spec.indexOf("|");
  if (sep === -1 || bar === -1 || bar > sep) return url;

  const stem = spec.slice(0, bar);
  const ext = spec.slice(bar + 1, sep);

  // Variante más pequeña que aún cubre el ancho pedido. Las de WP vienen
  // ordenadas de menor a mayor, pero no lo damos por hecho.
  let best: { w: number; size: string } | null = null;
  for (const size of spec.slice(sep + 1).split(",")) {
    const w = Number.parseInt(size, 10);
    if (!Number.isFinite(w) || w < width) continue;
    if (!best || w < best.w) best = { w, size };
  }

  // Ninguna variante llega al ancho pedido → el original es lo más grande que hay.
  if (!best) return url;

  const slash = url.lastIndexOf("/");
  return `${url.slice(0, slash + 1)}${stem}-${best.size}${ext}`;
}

// Una entrada de srcSet de WP: `…/dir/nombre-800x600.jpg 800w`. La extensión se
// captura entera y puede ser compuesta: con la conversión a WebP activada,
// WordPress nombra los derivados `nombre-800x600.jpg.webp`.
const SRCSET_ENTRY = /\/([^/\s]+?)-(\d+x\d+)((?:\.\w+)+)\s+\d+w/g;

/**
 * Extrae de un `srcSet` de WordPress el nombre base común, la extensión de los
 * derivados y los sufijos `WxH`.
 *
 * Devuelve `null` si el srcSet está vacío o si las entradas no comparten nombre
 * base y extensión (caso anómalo: mejor caer al original que construir URLs
 * inexistentes y provocar 404s).
 */
function parseWpSrcSet(
  srcSet?: string | null,
): { stem: string; ext: string; sizes: string[] } | null {
  if (!srcSet) return null;

  let stem: string | null = null;
  let ext: string | null = null;
  const sizes: string[] = [];

  for (const [, name, size, extension] of srcSet.matchAll(SRCSET_ENTRY)) {
    if (stem === null) stem = name;
    else if (stem !== name) return null;
    if (ext === null) ext = extension;
    else if (ext !== extension) return null;
    if (!sizes.includes(size)) sizes.push(size);
  }

  return stem && ext && sizes.length ? { stem, ext, sizes } : null;
}
