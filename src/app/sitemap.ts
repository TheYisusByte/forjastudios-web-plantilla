import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteContent } from "@/lib/wp/client";
import { absoluteUrl } from "@/lib/seo";

// Rutas estáticas del sitio live (concepto Vanguardia). Las pruebas viven en
// /sandbox y quedan fuera del sitemap (y bloqueadas en robots.ts).
// La prioridad es relativa dentro del propio sitio: le dice al buscador qué
// rastrear antes cuando no puede con todo, no cuánto vale la página.
const staticPaths: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/team", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Detalle de proyectos e IPs (mismos slugs en ambos locales).
  const content = await getSiteContent(routing.defaultLocale);
  const paths = [
    ...staticPaths,
    ...content.ips.map((ip) => ({ path: `/ip/${ip.slug}`, priority: 0.8 })),
    ...content.projects.map((p) => ({
      // Los proyectos destacados son la mejor puerta de entrada del portafolio.
      path: `/proyecto/${p.slug}`,
      priority: p.featured ? 0.8 : 0.6,
    })),
  ];

  // El contenido cambia cuando el cliente publica en WordPress, no cuando se
  // despliega; sin fecha real de modificación, la del build es la mejor
  // aproximación honesta (el webhook de WP relanza la revalidación).
  const lastModified = new Date();

  return paths.flatMap(({ path, priority }) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      // hreflang de cada variante + x-default: sin él, Google elige por su
      // cuenta qué idioma servir a quien no encaja en ninguno.
      alternates: {
        languages: {
          ...Object.fromEntries(
            routing.locales.map((l) => [l, absoluteUrl(l, path)]),
          ),
          "x-default": absoluteUrl(routing.defaultLocale, path),
        },
      },
    })),
  );
}
