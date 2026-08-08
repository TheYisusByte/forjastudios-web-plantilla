import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Base pública de WordPress, de donde cuelgan los uploads.
const WP_URL = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "") ?? "https://api.forjastudios.com";

const nextConfig: NextConfig = {
  images: {
    // Loader propio en lugar del optimizador de Vercel: sirve los tamaños que
    // WordPress ya generó, así el sitio no consume transformaciones de imagen
    // (la cuota del plan se agotaba y devolvía 402 → imágenes rotas).
    // Ver src/lib/image-loader.ts y src/lib/wp/media.ts.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",

    // Anchos del srcSet. Recortados respecto al default porque cada entrada
    // extra solo añade HTML: WordPress genera ~5 tamaños por imagen (245w, 768w,
    // 1024w, 1536w, 2048w) y varios anchos caerían en el mismo archivo.
    // Sin 3840: ningún elemento del sitio necesita más de 2048 de origen.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [128, 256, 384],

    // `remotePatterns` ya no lo usa el loader propio, pero se conserva por si se
    // vuelve al optimizador integrado (bastaría con quitar loader/loaderFile).
    remotePatterns: [
      // CMS headless en producción (api.forjastudios.com).
      { protocol: "https", hostname: "api.forjastudios.com" },
      { protocol: "https", hostname: "cms.forjastudios.com" },
      // Multisite anterior en Hostinger (sitio /forja/, ID 4) — legado.
      { protocol: "https", hostname: "powderblue-gazelle-820281.hostingersite.com" },
    ],
  },

  async rewrites() {
    return [
      {
        // Proxy same-origin de los uploads de WordPress: lo necesitan las
        // texturas WebGL de la sección de IPs, porque WordPress no manda
        // cabeceras CORS y una textura cross-origin sin ellas no se puede
        // pintar. Es un proxy, no una optimización: no consume cuota de
        // imágenes. El prefijo está en WP_MEDIA_PROXY (src/lib/wp/media.ts).
        source: "/wp-media/:path*",
        destination: `${WP_URL}/wp-content/uploads/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
