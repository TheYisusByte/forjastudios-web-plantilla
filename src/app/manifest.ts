import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

/**
 * Web App Manifest.
 *
 * Habilita "Añadir a pantalla de inicio" en Android con nombre, icono y colores
 * propios en lugar del genérico del navegador. Va sin prefijo de idioma —es un
 * archivo por sitio, no por ruta—, de ahí que `start_url` apunte a la raíz, que
 * el proxy de next-intl redirige al idioma que corresponda.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Forge your flame`,
    short_name: SITE_NAME,
    description:
      "Creative studio: 2D/3D animation, VFX, concept art and illustration.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    icons: [
      { src: "/icon.png", sizes: "136x135", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
