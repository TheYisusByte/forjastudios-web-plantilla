import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // /sandbox alberga pruebas de conceptos/componentes y /documentacion es la
    // doc interna de handover — ambas fuera del índice. Las rutas llevan prefijo
    // de locale (/es/sandbox, /en/documentacion, …).
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/sandbox",
        "/en/sandbox",
        "/es/sandbox",
        "/documentacion",
        "/en/documentacion",
        "/es/documentacion",
      ],
    },
    sitemap: "https://forjastudios.com/sitemap.xml",
  };
}
