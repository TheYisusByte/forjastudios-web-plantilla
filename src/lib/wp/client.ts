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
import { FORJA_LOGO } from "@/lib/brand";
import { isWpEnabled, wpFetch } from "./fetcher";
import { withWpVariants } from "./media";
import { ALL_CAPABILITIES, siteContentQuery, type WpCapabilities } from "./queries";

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
  let content: SiteContent | null = null;
  if (isWpEnabled()) {
    try {
      content = await getWpContent(locale);
    } catch (err) {
      console.error("[wp] fallo al obtener contenido, usando mock:", err);
    }
  }
  content ??= getMockContent(locale);

  // El CEO (Oscar) siempre encabeza el equipo, sea cual sea el orden de la
  // fuente (MENU_ORDER en WP o el mock).
  content.team = pinCeoFirst(content.team);
  return content;
}

/**
 * Reordena el equipo para que el CEO quede primero, preservando el orden
 * relativo del resto. Detecta el rol por la sigla "CEO" (presente en ES y EN),
 * así funciona con el contenido de WordPress y con el mock.
 */
function pinCeoFirst(team: SiteContent["team"]): SiteContent["team"] {
  const idx = team.findIndex((m) => /\bceo\b/i.test(m.role));
  if (idx <= 0) return team;
  const reordered = [...team];
  const [ceo] = reordered.splice(idx, 1);
  reordered.unshift(ceo);
  return reordered;
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
      videoUrl: ip.videoId,
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
  const data = await fetchSiteContent(locale);

  const content: SiteContent = {
    // meta y services son constantes de marca, no CPTs → se mantienen locales.
    meta: buildMeta(locale),
    services: services.map((s) => ({ key: s.key, label: s.label[locale] })),
    projects: (data.proyectos?.nodes ?? []).map(mapProject),
    ips: (data.ips?.nodes ?? []).map(mapIp),
    team: (data.miembros?.nodes ?? []).map((n, i) => mapMember(n, i, locale)),
    clients: (data.clientes?.nodes ?? []).map(mapClient),
  };

  linkClientLogos(content);

  // Resumen en consola del servidor: confirma la conexión y cuánto trajo WP
  // (útil en localhost para ver si falta publicar contenido en el CMS).
  console.log(
    `[wp] api.forjastudios.com [${locale}] → ${content.projects.length} proyectos, ` +
      `${content.ips.length} ips, ${content.team.length} miembros, ${content.clients.length} clientes`,
  );

  return content;
}

/**
 * Rellena el logo de cliente de los proyectos que no lo traen propio, buscando
 * en el CPT «Cliente» uno cuyo nombre aparezca en el campo `cliente` del
 * proyecto. Así basta con dar de alta cada cliente una vez —con su logo— para
 * que salga en todos sus proyectos, y el campo `clienteLogo` del proyecto queda
 * para las excepciones.
 *
 * No se compara por igualdad porque el campo del proyecto no es un nombre
 * limpio sino una línea de créditos: «Client © Jam City & TM DC. © WBIE (s24)»
 * tiene que reconocer a Jam City. Se busca el nombre como palabra completa
 * —«king» no puede casar dentro de «Viking»— y gana la coincidencia más larga,
 * para que «Jurassic World Alive» le gane a «Jurassic World».
 */
function linkClientLogos(content: SiteContent): void {
  const candidates = content.clients
    .filter((c): c is typeof c & { logo: string } => Boolean(c.logo && c.name.trim()))
    .map((c) => ({ name: normalizeName(c.name), logo: c.logo }))
    .sort((a, b) => b.name.length - a.name.length);

  for (const project of content.projects) {
    if (project.clientLogoUrl || !project.client) continue;
    const credits = normalizeName(project.client);
    project.clientLogoUrl =
      candidates.find((c) => containsWord(credits, c.name))?.logo ??
      // Los trabajos propios (y el fan art) llevan «Forja Studios» en los
      // créditos y el estudio no está dado de alta como cliente de sí mismo.
      (containsWord(credits, "forja studios") ? FORJA_LOGO : undefined);
  }
}

/** Texto normalizado: minúsculas, sin acentos y con los espacios colapsados. */
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** ¿`needle` aparece dentro de `haystack` como palabra completa? Ya normalizados. */
function containsWord(haystack: string, needle: string): boolean {
  const isWordChar = (ch?: string) => !!ch && /[a-z0-9]/.test(ch);
  for (let i = haystack.indexOf(needle); i !== -1; i = haystack.indexOf(needle, i + 1)) {
    if (!isWordChar(haystack[i - 1]) && !isWordChar(haystack[i + needle.length])) return true;
  }
  return false;
}

/**
 * Trae el contenido pidiendo todas las capacidades opcionales y, si el backend
 * no tiene alguna, reintenta sin ella. Cada capacidad depende de un plugin o de
 * una versión concreta del plugin propio; pedir un campo/argumento inexistente
 * hace fallar la query entera, así que se van desactivando de una en una:
 *
 *  · `language`      → falta Polylang + WPGraphQL Polylang (todo el contenido
 *                      queda en un único idioma).
 *  · `galeriaSrcSet` → el plugin forja-headless del servidor es anterior al
 *                      campo `srcSet` en `galeria` (las imágenes de galería se
 *                      sirven en tamaño original, más pesadas).
 *
 * Se reintenta como máximo una vez por capacidad. Lo que se descubre queda
 * memorizado en el proceso (`supported`): durante `next build` se generan
 * decenas de páginas y sería absurdo repetir los reintentos en cada una.
 */
let supported: WpCapabilities = { ...ALL_CAPABILITIES };

async function fetchSiteContent(locale: Locale): Promise<WpSiteContent> {
  // `next build` genera muchas páginas en paralelo, así que varias llamadas
  // pueden estar en la cascada a la vez. Cada intento trabaja sobre un snapshot
  // y `supported` se REEMPLAZA (nunca se muta), de modo que comparar por
  // identidad basta para saber si otra llamada ya ajustó las capacidades: si lo
  // hizo, este fallo era esperable y solo hay que reintentar con las nuevas.
  const maxAttempts = Object.keys(ALL_CAPABILITIES).length + 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const used = supported;
    try {
      return await wpFetch<WpSiteContent>(
        siteContentQuery(used),
        used.language ? { locale: localeToLanguage(locale) } : undefined,
      );
    } catch (err) {
      if (supported !== used) continue; // otra llamada ya las ajustó
      const missing = detectMissingCapability(err, used);
      if (!missing) throw err;
      supported = { ...used, [missing]: false };
      console.warn(`[wp] ${CAPABILITY_HINTS[missing]} Reintentando sin esa capacidad.`);
    }
  }

  throw new Error("[wp] no se pudo resolver la query de contenido tras varios intentos");
}

const CAPABILITY_HINTS: Record<keyof WpCapabilities, string> = {
  language:
    "Polylang no está activo: instala Polylang + WPGraphQL Polylang para servir ES/EN.",
  galeriaSrcSet:
    "El plugin forja-headless del servidor no expone `srcSet` en `galeria`: " +
    "actualízalo (wordpress/forja-headless.zip) para servir las imágenes de " +
    "galería en su tamaño responsivo.",
  galeriaPosterSrcSet:
    "El plugin forja-headless del servidor no expone `posterSrcSet` en `galeria`: " +
    "actualízalo (wordpress/forja-headless.zip) para servir los pósters de video " +
    "en su tamaño responsivo.",
  clienteLogo:
    "El plugin forja-headless del servidor no expone `clienteLogo` en los proyectos: " +
    "actualízalo (wordpress/forja-headless.zip) para poder subir el logo del cliente " +
    "en cada proyecto. Mientras tanto se busca por el nombre del cliente.",
};

/**
 * Deduce qué capacidad activa falta en el esquema a partir del error de
 * WPGraphQL, que nombra el campo o argumento desconocido.
 */
function detectMissingCapability(
  err: unknown,
  caps: WpCapabilities,
): keyof WpCapabilities | null {
  const msg = err instanceof Error ? err.message : String(err);
  const unknown = /(not defined|Unknown argument|Cannot query field|doesn't exist)/i.test(msg);
  if (!unknown) return null;
  if (caps.language && /\blanguage\b/i.test(msg)) return "language";
  // `posterSrcSet` primero: `\bsrcSet\b` no casa dentro de él (no hay frontera
  // de palabra entre "poster" y "SrcSet"), pero el orden lo deja explícito.
  if (caps.galeriaPosterSrcSet && /\bposterSrcSet\b/i.test(msg)) return "galeriaPosterSrcSet";
  if (caps.galeriaSrcSet && /\bsrcSet\b/i.test(msg)) return "galeriaSrcSet";
  if (caps.clienteLogo && /\bclienteLogo\b/i.test(msg)) return "clienteLogo";
  return null;
}

/**
 * Un item de `galeria` de WordPress → `MediaItem` del front.
 *
 * El póster de un video es SOLO el suyo (la imagen destacada de su adjunto, que
 * pone `scripts/wp-video-posters.py` con el primer fotograma). Antes se caía a
 * la portada del proyecto y todos los videos de una galería enseñaban la misma
 * miniatura; sin póster propio, el front prefiere sacar el fotograma del video
 * (ver `MediaCell` en DetailGalleryE).
 */
function toMediaItem(g: WpGaleriaItem & { sourceUrl: string }): MediaItem {
  if ((g.mimeType ?? "").startsWith("video/")) {
    return {
      type: "video",
      src: g.sourceUrl,
      poster: withWpVariants(g.poster, g.posterSrcSet),
      width: g.width,
      height: g.height,
    };
  }
  return {
    type: "image",
    src: withWpVariants(g.sourceUrl, g.srcSet)!,
    width: g.width,
    height: g.height,
  };
}

function mapProject(node: WpProyecto, i: number): Project {
  const cat = node.categorias?.nodes?.[0];
  const category = (cat?.slug ?? "animation-3d") as ProjectCategory;
  const coverNode = node.camposProyecto?.cover?.node;
  const cover = withWpVariants(coverNode?.sourceUrl, coverNode?.srcSet);
  const logoNode = node.camposProyecto?.clienteLogo?.node;
  const coverWH = {
    width: coverNode?.mediaDetails?.width,
    height: coverNode?.mediaDetails?.height,
  };

  // Galería real desde los medios adjuntos al proyecto (imágenes y videos, con
  // dimensiones reales para el masonry).
  const wpGallery: MediaItem[] = (node.galeria ?? [])
    .filter((g): g is WpGaleriaItem & { sourceUrl: string } => Boolean(g.sourceUrl))
    .map(toMediaItem);

  return {
    slug: node.slug,
    title: decode(node.title),
    client: node.camposProyecto?.cliente ?? "",
    category,
    categoryLabel: cat?.name ?? categoryLabels[category]?.es ?? "",
    year: Number(node.camposProyecto?.anio) || new Date().getFullYear(),
    description: realExcerpt(node.excerpt),
    featured: Boolean(node.camposProyecto?.destacado),
    accent: accentAt(i),
    videoUrl: node.camposProyecto?.videoUrl || undefined,
    clientLogoUrl: withWpVariants(logoNode?.sourceUrl, logoNode?.srcSet),
    coverUrl: cover,
    // Galería real si hay adjuntos; si no, fallback (cover + otras + reel).
    gallery: wpGallery.length ? wpGallery : ensureGallery(undefined, cover, coverWH, i),
  };
}

function mapIp(node: WpIp, i: number): IP {
  const coverNode = node.camposIp?.cover?.node;
  const cover = withWpVariants(coverNode?.sourceUrl, coverNode?.srcSet);
  // Galería real desde los medios adjuntos a la IP (imágenes y videos), igual
  // que los proyectos.
  const gallery: MediaItem[] = (node.galeria ?? [])
    .filter((g): g is WpGaleriaItem & { sourceUrl: string } => Boolean(g.sourceUrl))
    .map(toMediaItem);

  return {
    slug: node.slug,
    name: decode(node.title),
    description: clean(node.camposIp?.descripcion),
    accent: accentAt(i),
    // URL del video de fondo desde WP (el campo ACF `videoId` ahora guarda la URL directa).
    videoUrl: node.camposIp?.videoId || "",
    coverUrl: cover,
    gallery: gallery.length ? gallery : undefined,
  };
}

// Roles ES→EN — Polylang aún no está activo, así que WP guarda el rol solo en
// español; en el sitio en inglés lo traducimos con este mapa (clave normalizada
// sin acentos y en mayúsculas). Roles sin entrada quedan tal cual.
const ROLE_EN: Record<string, string> = {
  "CEO": "CEO",
  "DIRECTOR CREATIVO": "Creative Director",
  "DIRECTOR DE ARTE": "Art Director",
  "DIRECTOR DE ANIMACION": "Animation Director",
  "PRODUCTOR EJECUTIVO": "Executive Producer",
  "ANIMADOR": "Animator",
  "ADMINISTRADORA": "Operations Manager",
};

function translateRole(rol: string, locale: Locale): string {
  if (locale !== "en" || !rol) return rol;
  const key = rol
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // quita acentos
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
  const en = ROLE_EN[key];
  if (!en) return rol; // sin traducción conocida → deja el original
  // Conserva el estilo del original: TODO-MAYÚSCULAS vs. normal.
  return rol === rol.toUpperCase() ? en.toUpperCase() : en;
}

function mapMember(node: WpMiembro, i: number, locale: Locale): TeamMember {
  const name = decode(node.title);
  const foto = node.camposMiembro?.foto?.node;
  return {
    name,
    role: translateRole(node.camposMiembro?.rol ?? "", locale),
    initials: initialsOf(name),
    accent: accentAt(i),
    photo: withWpVariants(foto?.sourceUrl, foto?.srcSet),
  };
}

function mapClient(node: WpCliente): Client {
  const name = decode(node.title);
  const logo = node.camposCliente?.logo?.node;
  return {
    // Prefiere el logo subido en WP; si no, cae al logo local (data.json) por nombre.
    name,
    logo: withWpVariants(logo?.sourceUrl, logo?.srcSet) || clientLogoByName[name],
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

/**
 * Descripción del proyecto, o cadena vacía si es el marcador de posición.
 *
 * WordPress rellenó el extracto de casi todos los proyectos con la misma frase
 * genérica al importarlos; repetirla bajo cada portada no aporta nada. Al
 * tratarla como vacía, la interna no muestra descripción hasta que se escriba
 * una de verdad.
 */
function realExcerpt(html?: string): string {
  const text = clean(html);
  return PLACEHOLDER_EXCERPTS.has(text.toLowerCase()) ? "" : text;
}

const PLACEHOLDER_EXCERPTS = new Set([
  "pieza del portafolio de forja studios.",
  "portfolio piece by forja studios.",
]);

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
    /** Variantes generadas por WP; ver src/lib/wp/media.ts. */
    srcSet?: string;
    altText?: string;
    mediaDetails?: { width?: number; height?: number };
  };
}
interface WpGaleriaItem {
  sourceUrl?: string;
  /** Idem `WpMedia.srcSet`; ausente si el plugin del servidor es antiguo. */
  srcSet?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  /** Póster del video: imagen destacada de su adjunto. */
  poster?: string;
  /** Variantes del póster; ausente si el plugin del servidor es antiguo. */
  posterSrcSet?: string;
}
interface WpProyecto {
  slug: string;
  title: string;
  excerpt?: string;
  camposProyecto?: {
    cliente?: string;
    /** Ausente si el plugin del servidor es anterior a 1.8.0. */
    clienteLogo?: WpMedia;
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
  camposIp?: { cover?: WpMedia; descripcion?: string; videoId?: string; enlace?: string; logo?: WpMedia };
  galeria?: WpGaleriaItem[];
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
