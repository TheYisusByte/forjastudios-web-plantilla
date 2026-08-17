/**
 * Piezas compartidas de SEO/AEO.
 * ---------------------------------------------------------------------------
 * Un único sitio donde viven la URL canónica del sitio, los `alternates`
 * (canonical + hreflang) y los constructores de JSON-LD. Cada página compone
 * desde aquí en lugar de repetir literales: si cambia el dominio o el modelo de
 * datos estructurados, se cambia en un solo archivo.
 *
 * AEO (Answer Engine Optimization): los motores de respuesta —ChatGPT Search,
 * Perplexity, AI Overviews— se apoyan mucho más que un buscador clásico en
 * datos estructurados y en metadatos explícitos, porque no renderizan JS ni
 * interpretan un layout visual. De ahí que aquí haya más JSON-LD del mínimo
 * que pide Google.
 */
import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { clientDisplayName } from "@/lib/utils";
import { largestWpVariant } from "@/lib/wp/media";
import type { Project, IP, SiteContent } from "@/lib/content/types";

/**
 * Origen canónico del sitio. Sin barra final.
 *
 * CON `www`: el apex responde 308 hacia www, así que es www quien sirve las
 * páginas. Apuntar la canónica al apex mandaría a los buscadores a una URL que
 * redirige — justo lo que una canónica existe para evitar. Si algún día se
 * invierte el dominio primario en Vercel, este literal es lo único que cambia.
 */
export const SITE_URL = "https://www.forjastudios.com";

/** Nombre legal/comercial, tal cual debe aparecer en resultados. */
export const SITE_NAME = "Forja Studios";

/** Cuenta de X/Twitter, para la atribución de las Cards. */
export const TWITTER_HANDLE = "@StudiosForja";

/**
 * `og:locale` usa el formato `idioma_TERRITORIO` de Facebook, no el código
 * corto de la ruta. Con `es` a secas, Facebook ignora la etiqueta.
 */
const OG_LOCALE: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
};

/** URL absoluta de una ruta ya localizada (`path` empieza por `/` o es ""). */
export function absoluteUrl(locale: Locale, path = ""): string {
  return `${SITE_URL}/${locale}${path}`;
}

/**
 * Canonical + hreflang de una ruta. `path` va SIN prefijo de idioma
 * (`/team`, `/proyecto/glu-glus`, o "" para la home).
 *
 * `x-default` apunta al idioma por defecto: es la variante que Google sirve a
 * quien no encaja en ningún hreflang. Sin ella, las dos versiones compiten
 * entre sí en el índice.
 */
export function alternates(locale: Locale, path = ""): Metadata["alternates"] {
  return {
    canonical: absoluteUrl(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(l, path)])),
      "x-default": absoluteUrl(routing.defaultLocale, path),
    },
  };
}

/**
 * La tarjeta de marca que genera `[locale]/opengraph-image.tsx`.
 *
 * Se referencia a mano en vez de dejar que Next la inyecte sola porque el
 * archivo solo se aplica cuando la página NO declara su propio `openGraph`, y
 * aquí todas lo declaran para fijar la URL y el locale.
 */
export function defaultOgImage(locale: Locale) {
  return {
    url: `${SITE_URL}/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} — Forge your flame`,
  };
}

/**
 * Bloque `openGraph` común: URL, locale, locale alterno e imagen por defecto.
 *
 * Ojo con la herencia: Next NO fusiona `openGraph` ni `twitter` en profundidad
 * — el objeto de la página REEMPLAZA entero al del layout. Por eso todo lo que
 * deba salir en cada página se compone desde aquí y no se hereda: si no, las
 * internas se quedan sin imagen y sin cuenta de X.
 */
export function openGraphBase(locale: Locale, path = "") {
  return {
    url: absoluteUrl(locale, path),
    siteName: SITE_NAME,
    locale: OG_LOCALE[locale],
    alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    images: [defaultOgImage(locale)],
  };
}

/** Bloque `twitter` común. Mismo motivo que arriba: se repite, no se hereda. */
export function twitterBase(locale: Locale) {
  return {
    // `summary_large_image` es lo que convierte la tarjeta en un banner ancho;
    // con `summary` (el default) la imagen queda de miniatura.
    card: "summary_large_image" as const,
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    images: [defaultOgImage(locale)],
  };
}

/**
 * Recorta una descripción al límite que muestran buscadores y redes (~160
 * caracteres), cortando por palabra para no dejar una a medias.
 */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:]$/, "")}…`;
}

/**
 * Ancho mínimo para que una portada del CMS sirva como tarjeta social.
 * Por debajo, LinkedIn rechaza la imagen y el resto de redes la degradan a
 * miniatura; sale mejor la tarjeta de marca, que siempre es 1200×630.
 */
const MIN_OG_WIDTH = 600;

/**
 * Convierte la portada de un contenido en la entrada que espera
 * `openGraph.images`, con sus dimensiones reales.
 *
 * Devuelve `null` cuando la imagen no sirve como tarjeta (es demasiado
 * pequeña); quien llama debe entonces dejar la de marca que ya trae
 * `openGraphBase`.
 *
 * Las medidas salen de las variantes que WordPress generó, no de una
 * suposición: anunciar unas que no son las reales deforma la tarjeta, y no
 * anunciar ninguna obliga al scraper a descargar el archivo para maquetar.
 */
export function ogImage(url: string, alt: string) {
  const variant = largestWpVariant(url);
  if (!variant) {
    // Sin variantes conocidas (asset local, o WP no las generó): se manda la
    // URL a secas, sin el fragmento `#wp=…`, que solo entiende nuestro loader.
    return { url: url.split("#")[0], alt };
  }
  if (variant.width < MIN_OG_WIDTH) return null;
  return { url: variant.url, width: variant.width, height: variant.height, alt };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────
// Todos los nodos comparten `@id` estables para que los motores entiendan que
// hablan de la misma entidad en cada página (un grafo, no fichas sueltas).

export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

/** Ficha de la empresa. Se emite una vez, en el layout. */
export function organizationJsonLd(content: SiteContent, locale: Locale) {
  const { meta } = content;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: "Forja",
    url: SITE_URL,
    slogan: meta.tagline,
    description: meta.descriptor,
    email: meta.contact.email,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.png`,
      width: 136,
      height: 135,
    },
    image: `${SITE_URL}/opengraph-image`,
    sameAs: meta.socials.map((s) => s.href),
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: meta.stats.blacksmiths,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: meta.contact.email,
      availableLanguage: ["Spanish", "English"],
    },
    // Temas que el estudio domina: es la señal que usan los motores de
    // respuesta para decidir si citarte ante una pregunta concreta.
    knowsAbout: content.services.map((s) => s.label),
    inLanguage: locale,
  };
}

/** Ficha del sitio, enlazada a la empresa como editora. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": ORG_ID },
    inLanguage: routing.locales,
  };
}

/**
 * Migas. Google las pinta bajo el título del resultado en vez de la URL cruda,
 * y a los motores de respuesta les da la jerarquía del sitio.
 */
export function breadcrumbJsonLd(
  locale: Locale,
  trail: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

/** Un proyecto del portafolio como obra creativa. */
export function projectJsonLd(project: Project, locale: Locale) {
  const url = absoluteUrl(locale, `/proyecto/${project.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    url,
    name: project.title,
    description: project.description,
    genre: project.categoryLabel,
    dateCreated: String(project.year),
    inLanguage: locale,
    creator: { "@id": ORG_ID },
    // El campo `cliente` de WP viene con el prefijo de créditos ("Client © X");
    // el nombre limpio es el que entiende un motor de búsqueda.
    ...(project.client
      ? { sourceOrganization: { "@type": "Organization", name: clientDisplayName(project.client) } }
      : {}),
    ...(project.coverUrl ? { image: project.coverUrl.split("#")[0] } : {}),
    ...(project.videoUrl ? { video: { "@type": "VideoObject", name: project.title, contentUrl: project.videoUrl, thumbnailUrl: project.coverUrl?.split("#")[0] } } : {}),
  };
}

/** Una IP propia del estudio. */
export function ipJsonLd(ip: IP, locale: Locale) {
  const url = absoluteUrl(locale, `/ip/${ip.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    url,
    name: ip.name,
    description: ip.description,
    inLanguage: locale,
    // Las IPs son obra propia: Forja es autora y titular.
    creator: { "@id": ORG_ID },
    copyrightHolder: { "@id": ORG_ID },
    ...(ip.coverUrl ? { image: ip.coverUrl.split("#")[0] } : {}),
  };
}

/** El equipo, como plantilla de la empresa. */
export function teamJsonLd(content: SiteContent, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: absoluteUrl(locale, "/team"),
    about: { "@id": ORG_ID },
    mainEntity: {
      "@id": ORG_ID,
      employee: content.team.map((m) => ({
        "@type": "Person",
        name: m.name,
        jobTitle: m.role,
        worksFor: { "@id": ORG_ID },
        ...(m.photo ? { image: m.photo.split("#")[0] } : {}),
      })),
    },
  };
}
