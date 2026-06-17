import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Allow optimizing images served from the WordPress CMS.
    remotePatterns: [
      { protocol: "https", hostname: "cms.forjastudios.com" },
      // Multisite actual en Hostinger (sitio /forja/, ID 4) hasta migrar a cms.*
      { protocol: "https", hostname: "powderblue-gazelle-820281.hostingersite.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
