"use client";

/**
 * Loader global de `next/image` (configurado en `next.config.ts`).
 * ---------------------------------------------------------------------------
 * Reemplaza al optimizador de Vercel, cuya cuota de transformaciones (5.000/mes
 * en Hobby) se agotaba y devolvía `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`
 * dejando las imágenes rotas. Con este loader el sitio consume 0
 * transformaciones: `next/image` sigue generando el `srcSet` responsivo y el
 * lazy loading, pero cada entrada apunta a un archivo que ya existe.
 *
 * Tres casos:
 *
 * 1. Imagen de WordPress con variantes (`…jpg#wp=stem:245x300,768x941,…`):
 *    devuelve el tamaño generado por WP inmediatamente MAYOR O IGUAL al ancho
 *    pedido. Ver `src/lib/wp/media.ts` para el formato del fragmento.
 * 2. Imagen sin variantes (WP no las generó, o asset local de `/public`):
 *    se sirve el archivo tal cual. Vercel lo entrega desde su CDN con cache
 *    inmutable; no cuesta transformaciones.
 * 3. Cualquier otra URL: tal cual.
 *
 * Contrapartida asumida: se pierde la conversión automática a AVIF/WebP, así
 * que los archivos pesan más que los que generaba Vercel. Se recupera activando
 * conversión WebP en el propio WordPress (LiteSpeed/QUIC.cloud, ShortPixel o
 * EWWW): este loader no necesita cambios, WP sirve el .webp en su lugar.
 */

import { resolveWpVariant } from "@/lib/wp/media";

interface LoaderArgs {
  src: string;
  width: number;
  /** Ignorado: no reencodificamos, servimos archivos ya generados por WP. */
  quality?: number;
}

export default function forjaImageLoader({ src, width }: LoaderArgs): string {
  return resolveWpVariant(src, width);
}
