/**
 * /llms.txt — resumen del sitio en texto plano para modelos de lenguaje.
 * ---------------------------------------------------------------------------
 * Convención de llmstxt.org: un índice legible que da a un motor de respuesta
 * lo esencial del sitio sin obligarle a rastrear y desmontar 90 páginas de HTML
 * con animaciones. No sustituye a nada —los buscadores clásicos lo ignoran—,
 * pero es barato y hoy es la vía más directa para que una IA describa bien el
 * estudio y enlace a la página correcta.
 *
 * Se escribe en inglés, el idioma por defecto del sitio, y sale del mismo
 * contenido de WordPress que la web: se regenera con cada publicación.
 */
import { getSiteContent } from "@/lib/wp/client";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

// Estático: se resuelve en el build y se revalida con el resto del contenido.
export const dynamic = "force-static";

export async function GET() {
  const locale = routing.defaultLocale;
  const content = await getSiteContent(locale);
  const { meta } = content;

  const line = (title: string, url: string, note?: string) =>
    `- [${title}](${url})${note ? `: ${note}` : ""}`;

  // El descriptor lo escribe el cliente en WP y unas veces trae punto final y
  // otras no; sin normalizarlo, la frase siguiente se le pega.
  const descriptor = /[.!?]$/.test(meta.descriptor.trim())
    ? meta.descriptor.trim()
    : `${meta.descriptor.trim()}.`;

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${descriptor} ${meta.stats.years}+ years, ${meta.stats.blacksmiths} artists ("blacksmiths") and ${meta.stats.projects}+ delivered projects. Tagline: "${meta.tagline}".`,
    "",
    `${SITE_NAME} is a creative studio working across ${content.services
      .map((s) => s.label.toLowerCase())
      .join(", ")}. It produces work for external clients and develops its own IPs.`,
    "",
    "## Site",
    "",
    line("Home", absoluteUrl(locale, ""), "studio overview, showreel, selected work"),
    line("Team", absoluteUrl(locale, "/team"), `the ${meta.stats.blacksmiths} people behind the studio`),
    line("Spanish version", absoluteUrl("es", ""), "same content in Spanish"),
    "",
    "## Services",
    "",
    ...content.services.map((s) => `- ${s.label}`),
    "",
    "## Original IPs",
    "",
    ...content.ips.map((ip) =>
      line(ip.name, absoluteUrl(locale, `/ip/${ip.slug}`), ip.description.replace(/\s+/g, " ").trim()),
    ),
    "",
    "## Selected projects",
    "",
    ...content.projects
      .filter((p) => p.featured)
      .map((p) =>
        line(
          p.title,
          absoluteUrl(locale, `/proyecto/${p.slug}`),
          `${p.categoryLabel} for ${p.client}, ${p.year}`,
        ),
      ),
    "",
    "## All projects",
    "",
    ...content.projects
      .filter((p) => !p.featured)
      .map((p) =>
        line(p.title, absoluteUrl(locale, `/proyecto/${p.slug}`), `${p.categoryLabel}, ${p.year}`),
      ),
    "",
    "## Contact",
    "",
    `- Email: ${meta.contact.email}`,
    ...meta.socials.map((s) => `- ${s.label}: ${s.href}`),
    "",
    "## Notes",
    "",
    `- Canonical domain: ${SITE_URL}`,
    "- Languages: English (/en, default) and Spanish (/es).",
    "- Full URL index: /sitemap.xml",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
