import "server-only";
import type { Locale } from "@/i18n/routing";
import type {
  Accent,
  Client,
  IP,
  MediaItem,
  Project,
  ProjectCategory,
  SiteContent,
  TeamMember,
} from "@/lib/content/types";
import {
  categoryLabels,
  clients,
  ips,
  meta,
  projects,
  services,
  team,
} from "@/lib/content/data";
import { isWpEnabled, wpFetch } from "./fetcher";
import { SITE_CONTENT_QUERY } from "./queries";

// Logo de cliente por nombre (fallback de data.json cuando WP no trae logo).
const clientLogoByName: Record<string, string | undefined> = Object.fromEntries(
  clients.map((c) => [c.name, c.logo]),
);

// Reel del estudio — fallback de galería mientras no haya material por proyecto.
const STUDIO_REEL = "/assets/forja/projects/reel-forja-2023.mp4";

// Pool de portadas de todos los proyectos (con dimensiones) para rellenar las
// galerías de fallback con imágenes DISTINTAS.
const coverPool: MediaItem[] = projects
  .map((p): MediaItem | null => {
    const m = p.gallery?.[0];
    const src = p.cover ?? m?.src;
    return src ? { type: "image", src, width: m?.width, height: m?.height } : null;
  })
  .filter((x): x is MediaItem => x !== null);

/**
 * Construye una galería de fallback: la portada del proyecto + 3 imágenes de
 * OTROS proyectos (4 imágenes en total) + el reel del estudio (cuyo thumbnail
 * es la propia portada). `seed` varía qué "otras" imágenes entran por proyecto.
 */
function buildFallbackGallery(
  cover: string | undefined,
  coverWH: { width?: number; height?: number },
  seed: number,
): MediaItem[] {
  const images: MediaItem[] = [];
  if (cover) {
    images.push({ type: "image", src: cover, width: coverWH.width, height: coverWH.height });
  }
  for (let k = 1; k <= coverPool.length && images.length < 4; k++) {
    const c = coverPool[(seed + k) % coverPool.length];
    if (c.src !== cover && !images.some((im) => im.src === c.src)) images.push(c);
  }
  return [...images, { type: "video", src: STUDIO_REEL, poster: cover }];
}

/**
 * Garantiza una galería para la interna. Respeta una galería real (≥4 imágenes)
 * si existe; si no, arma el fallback con imágenes distintas + reel.
 */
function ensureGallery(
  gallery: MediaItem[] | undefined,
  cover: string | undefined,
  coverWH: { width?: number; height?: number },
  seed: number,
): MediaItem[] {
  const imageCount = gallery?.filter((g) => g.type === "image").length ?? 0;
  if (gallery && imageCount >= 4) return gallery;
  return buildFallbackGallery(cover, coverWH, seed);
}

/**
 * Único punto de entrada para el contenido del sitio.
 *
 * - Si `WP_GRAPHQL_URL` está definido → consume WordPress (WPGraphQL) y mapea la
 *   respuesta a `SiteContent`. Ante cualquier fallo, cae al mock para no tumbar
 *   el build/render durante la migración (el error se registra en consola).
 * - Si no → resuelve el mock bilingüe tipado (comportamiento original).
 *
 * La forma devuelta es idéntica en ambos casos, así que ningún componente cambia.
 */
export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  if (isWpEnabled()) {
    try {
      return await getWpContent(locale);
    } catch (err) {
      console.error("[wp] fallo al obtener contenido, usando mock:", err);
    }
  }
  return getMockContent(locale);
}

// ── Mock (placeholder hasta materiales del cliente) ──────────────────────────

function getMockContent(locale: Locale): SiteContent {
  return {
    meta: buildMeta(locale),
    services: services.map((s) => ({ key: s.key, label: s.label[locale] })),
    projects: projects.map((p, i) => ({
      slug: p.slug,
      title: p.title,
      client: p.client,
      category: p.category,
      categoryLabel: categoryLabels[p.category][locale],
      year: p.year,
      description: p.description[locale],
      featured: p.featured,
      accent: p.accent,
      videoUrl: p.videoUrl,
      coverUrl: p.cover,
      gallery: ensureGallery(
        p.gallery,
        p.cover,
        { width: p.gallery?.[0]?.width, height: p.gallery?.[0]?.height },
        i,
      ),
    })),
    ips: ips.map((ip) => ({
      slug: ip.slug,
      name: ip.name,
      description: ip.description[locale],
      accent: ip.accent,
      videoId: ip.videoId,
    })),
    team: team.map((m) => ({
      name: m.name,
      role: m.role[locale],
      initials: m.initials,
      accent: m.accent,
    })),
    clients: clients.map((c) => ({ name: c.name, logo: c.logo })),
  };
}

// ── WordPress (WPGraphQL) ────────────────────────────────────────────────────

async function getWpContent(locale: Locale): Promise<SiteContent> {
  const data = await wpFetch<WpSiteContent>(SITE_CONTENT_QUERY, {
    locale: localeToLanguage(locale),
  });

  return {
    // meta y services son constantes de marca, no CPTs → se mantienen locales.
    meta: buildMeta(locale),
    services: services.map((s) => ({ key: s.key, label: s.label[locale] })),
    projects: (data.proyectos?.nodes ?? []).map(mapProject),
    ips: (data.ips?.nodes ?? []).map(mapIp),
    team: (data.miembros?.nodes ?? []).map(mapMember),
    clients: (data.clientes?.nodes ?? []).map(mapClient),
  };
}

function mapProject(node: WpProyecto, i: number): Project {
  const cat = node.categorias?.nodes?.[0];
  const category = (cat?.slug ?? "animation-3d") as ProjectCategory;
  const coverNode = node.camposProyecto?.cover?.node;
  const cover = coverNode?.sourceUrl || undefined;
  const coverWH = {
    width: coverNode?.mediaDetails?.width,
    height: coverNode?.mediaDetails?.height,
  };

  // Galería real desde los medios adjuntos al proyecto (imágenes y videos, con
  // dimensiones para el masonry). Detecta video por mimeType; poster del video
  // o, en su defecto, el cover.
  const wpGallery: MediaItem[] = (node.galeria ?? [])
    .filter((g): g is WpGaleriaItem & { sourceUrl: string } => Boolean(g.sourceUrl))
    .map((g): MediaItem =>
      (g.mimeType ?? "").startsWith("video/")
        ? { type: "video", src: g.sourceUrl, poster: g.poster ?? cover, width: g.width, height: g.height }
        : { type: "image", src: g.sourceUrl, width: g.width, height: g.height },
    );

  return {
    slug: node.slug,
    title: decode(node.title),
    client: node.camposProyecto?.cliente ?? "",
    category,
    categoryLabel: cat?.name ?? categoryLabels[category]?.es ?? "",
    year: Number(node.camposProyecto?.anio) || new Date().getFullYear(),
    description: clean(node.excerpt),
    featured: Boolean(node.camposProyecto?.destacado),
    accent: accentAt(i),
    videoUrl: node.camposProyecto?.videoUrl || undefined,
    coverUrl: cover,
    // Galería real si hay adjuntos; si no, fallback (cover + otras + reel).
    gallery: wpGallery.length ? wpGallery : ensureGallery(undefined, cover, coverWH, i),
  };
}

function mapIp(node: WpIp, i: number): IP {
  return {
    slug: node.slug,
    name: decode(node.title),
    description: clean(node.camposIp?.descripcion),
    accent: accentAt(i),
    // videoId de fondo desde WP; si falta, cae al de data.json por slug.
    videoId: node.camposIp?.videoId || ips.find((x) => x.slug === node.slug)?.videoId || "",
  };
}

function mapMember(node: WpMiembro, i: number): TeamMember {
  const name = decode(node.title);
  return {
    name,
    role: node.camposMiembro?.rol ?? "",
    initials: initialsOf(name),
    accent: accentAt(i),
  };
}

function mapClient(node: WpCliente): Client {
  const name = decode(node.title);
  return {
    name,
    // Prefiere el logo subido en WP; si no, cae al logo local (data.json) por nombre.
    logo: node.camposCliente?.logo?.node?.sourceUrl || clientLogoByName[name],
  };
}

// ── Utilidades de mapeo ──────────────────────────────────────────────────────

function buildMeta(locale: Locale): SiteContent["meta"] {
  return {
    tagline: meta.tagline,
    descriptor: meta.descriptor[locale],
    stats: meta.stats,
    contact: meta.contact,
    socials: meta.socials,
    showreelId: meta.showreelId,
  };
}

/** next-intl usa "es"/"en"; WPGraphQL Polylang espera el enum ES/EN. */
function localeToLanguage(locale: Locale): string {
  return locale.toUpperCase();
}

/** Paleta de acentos de marca; se cicla por índice para variar los gradientes. */
const palette: Accent[] = [
  ["#FFB23E", "#FF6A2C"], // amber
  ["#FF6A2C", "#E03A2E"], // ember
  ["#FF6A2C", "#7A1E12"], // dusk
];
function accentAt(i: number): Accent {
  return palette[i % palette.length];
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Quita etiquetas HTML (excerpt/textarea de WP) y normaliza espacios. */
function clean(html?: string): string {
  return decode((html ?? "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Decodifica las entidades HTML más comunes que devuelve WP. */
function decode(text: string): string {
  return text
    .replace(/&amp;|&#0?38;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#8217;|&#x2019;/g, "'")
    .replace(/&#8211;|&#x2013;/g, "–")
    .replace(/&nbsp;/g, " ");
}

// ── Tipos de la respuesta WPGraphQL ──────────────────────────────────────────

interface WpMedia {
  node?: {
    sourceUrl?: string;
    altText?: string;
    mediaDetails?: { width?: number; height?: number };
  };
}
interface WpGaleriaItem {
  sourceUrl?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  poster?: string;
}
interface WpProyecto {
  slug: string;
  title: string;
  excerpt?: string;
  camposProyecto?: {
    cliente?: string;
    anio?: number | string;
    videoUrl?: string;
    destacado?: boolean;
    cover?: WpMedia;
  };
  galeria?: WpGaleriaItem[];
  categorias?: { nodes?: { name?: string; slug?: string }[] };
}
interface WpIp {
  slug: string;
  title: string;
  camposIp?: { descripcion?: string; videoId?: string; enlace?: string; logo?: WpMedia };
}
interface WpMiembro {
  title: string;
  camposMiembro?: { rol?: string; redes?: string; foto?: WpMedia };
}
interface WpCliente {
  title: string;
  camposCliente?: { sitioWeb?: string; logo?: WpMedia };
}
interface WpSiteContent {
  proyectos?: { nodes?: WpProyecto[] };
  ips?: { nodes?: WpIp[] };
  miembros?: { nodes?: WpMiembro[] };
  clientes?: { nodes?: WpCliente[] };
}
