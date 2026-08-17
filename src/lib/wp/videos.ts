/**
 * Videos servidos desde WordPress.
 * ---------------------------------------------------------------------------
 * Antes vivían en Vercel Blob, pero su capa gratuita corta el servicio al pasar
 * la cuota de datos: los videos desaparecían del sitio a mitad de mes. Los
 * uploads de WordPress (Hostinger) no tienen ese tope y ya alojan el resto del
 * material, así que son el origen único de medios.
 *
 * WordPress los sirve con `Accept-Ranges: bytes` y ambos archivos llevan el
 * índice al principio (fast start), así que el navegador hace streaming
 * progresivo: empieza a reproducir sin esperar a descargar el archivo entero.
 * Lo que controla el front es CUÁNDO arranca esa descarga —ver
 * `HeroBgVideoFile` (no carga nada en móvil ni con Save-Data) y `ReelE` (no
 * asigna fuentes hasta acercarse al viewport)— y CUÁNTO pesa lo que se
 * descarga: ver `wordpress/README.md`, sección "Vídeo".
 *
 * ⚠️ Los archivos deben subirse por la **mediateca** de WordPress, no por FTP:
 * LiteSpeed no conoce la extensión `.webm` y la sirve como `text/plain`
 * (Chrome la reproduce igual por sniffing; Firefox y Safari no). Con `.mp4`
 * subido por la mediateca el `Content-Type` sale correcto.
 */

const WP_URL = (process.env.NEXT_PUBLIC_WP_URL ?? "https://api.forjastudios.com").replace(
  /\/$/,
  "",
);

/** URL absoluta de un archivo de `wp-content/uploads`. */
export function wpUpload(path: string): string {
  return `${WP_URL}/wp-content/uploads/${path.replace(/^\//, "")}`;
}

/** Fuente de un `<video>`: URL + tipo MIME declarado (el navegador elige la 1ª que soporta). */
export type VideoSource = { src: string; type: string };

/**
 * Fondo del hero — loop de 30 s, sin audio.
 * Versión web (1920×1080, H.264, CRF 30 → 5,9 MB) del máster de 2560×1440 que
 * pesaba 20,5 MB. Va detrás de un overlay oscuro y del canvas de humo, así que
 * la diferencia no se ve; el ahorro sí.
 */
export const HERO_VIDEO_SOURCES: VideoSource[] = [
  { src: wpUpload("2026/08/animation-loop-web.mp4"), type: "video/mp4" },
];

/** Showreel de la home (~1:41, 1280×720, 23 MB). Solo se descarga al llegar a él. */
export const REEL_VIDEO_SOURCES: VideoSource[] = [
  { src: wpUpload("2026/08/REEL-FORJA-STUDIOS-ANIMACION-2023.mp4"), type: "video/mp4" },
];
