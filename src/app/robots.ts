import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // /sandbox alberga pruebas de conceptos/componentes — fuera del índice.
    // Las rutas llevan prefijo de locale (/es/sandbox, /en/sandbox).
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/sandbox", "/en/sandbox", "/es/sandbox"],
    },
    sitemap: "https://forjastudios.com/sitemap.xml",
  };
}
