import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteContent } from "@/lib/wp/client";

const base = "https://forjastudios.com";
// Rutas estáticas del sitio live (concepto Vanguardia). Las pruebas viven en
// /sandbox y quedan fuera del sitemap (y bloqueadas en robots.ts).
const staticPaths = ["", "/team"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Detalle de proyectos (mismos slugs en ambos locales).
  const content = await getSiteContent(routing.defaultLocale);
  const projectPaths = content.projects.map((p) => `/proyecto/${p.slug}`);
  const paths = [...staticPaths, ...projectPaths];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      // hreflang alternates for each localized variant.
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}/${l}${path}`]),
        ),
      },
    })),
  );
}
