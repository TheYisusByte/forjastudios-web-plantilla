import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Allow optimizing images served from the WordPress CMS.
    remotePatterns: [
      // CMS headless en producción (api.forjastudios.com).
      { protocol: "https", hostname: "api.forjastudios.com" },
      { protocol: "https", hostname: "cms.forjastudios.com" },
      // Multisite anterior en Hostinger (sitio /forja/, ID 4) — legado.
      { protocol: "https", hostname: "powderblue-gazelle-820281.hostingersite.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
