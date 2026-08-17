import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { FORJA_LOGO } from "@/lib/brand";

/**
 * Documentación de handover del proyecto Forja Studios.
 *
 * Página interna (NO indexada): bloqueada en `robots.ts` y excluida del
 * `sitemap.ts`, además de `robots: noindex` aquí abajo. Es un entregable de
 * referencia para el cliente/desarrolladores: arquitectura, stack, mapa de
 * navegación, sistema de diseño y muestras de componentes.
 *
 * Es un Server Component estático y autocontenido (no usa el contenido del
 * sitio ni el nav público); su layout y estilos viven en este archivo.
 */

export const metadata: Metadata = {
  title: "Documentación del proyecto",
  description: "Documentación técnica interna del sitio Forja Studios.",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

// ── Navegación lateral ───────────────────────────────────────────────────────
const NAV = [
  { id: "intro", label: "Introducción" },
  { id: "stack", label: "Stack tecnológico" },
  { id: "arquitectura", label: "Arquitectura" },
  { id: "wordpress", label: "WordPress headless" },
  { id: "imagenes", label: "Imágenes y video" },
  { id: "navegacion", label: "Mapa de navegación" },
  { id: "contenido", label: "Modelo de contenido" },
  { id: "diseno", label: "Sistema de diseño" },
  { id: "componentes", label: "Muestras de componentes" },
  { id: "catalogo", label: "Catálogo de componentes" },
  { id: "seo", label: "SEO y datos estructurados" },
  { id: "opengraph", label: "Open Graph y redes" },
  { id: "aeo", label: "Motores de respuesta (AEO)" },
  { id: "analitica", label: "Analítica" },
  { id: "despliegue", label: "Despliegue y entorno" },
] as const;

// ── Primitivos de presentación ───────────────────────────────────────────────

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border pt-12">
      <div className="mb-6 flex items-baseline gap-4">
        <span className="font-mono text-xs text-forja-amber">{n}</span>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-forja-bone/80">{children}</div>
    </section>
  );
}

function Pill({ children, tone = "amber" }: { children: ReactNode; tone?: "amber" | "muted" | "green" }) {
  const tones = {
    amber: "border-forja-amber/40 text-forja-spark",
    muted: "border-border text-forja-muted",
    green: "border-emerald-400/40 text-emerald-300",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-forja-carbon px-1.5 py-0.5 font-mono text-[12.5px] text-forja-spark">
      {children}
    </code>
  );
}

function Block({ children, title }: { children: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-forja-carbon/60">
      {title && (
        <div className="border-b border-border px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-forja-muted">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3 text-[12.5px] leading-relaxed text-forja-bone/85">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-forja-carbon/40 p-5">
      <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">{title}</h3>
      <div className="text-[13px] leading-relaxed text-forja-bone/70">{children}</div>
    </div>
  );
}

// ── Datos de tablas ──────────────────────────────────────────────────────────

const STACK: [string, string, string][] = [
  ["Next.js", "16.2.7", "Framework full-stack (App Router, RSC, SSG/ISR). Middleware en proxy.ts"],
  ["React", "19.2.4", "Librería UI (Server + Client Components)"],
  ["TypeScript", "5.x", "Tipado estático en todo el código"],
  ["Tailwind CSS", "4.x", "Estilos utility-first, CSS-first (@theme, sin tailwind.config)"],
  ["next-intl", "4.13", "i18n ES/EN con segmento [locale]"],
  ["Framer Motion", "12.40", "Animaciones declarativas de UI"],
  ["GSAP + @gsap/react", "3.15", "Scroll-driven, pinning y secuencias (useGSAP)"],
  ["three", "0.170", "WebGL de las tarjetas de IP (IPCardWebGL)"],
  ["@next/third-parties", "16.3", "Carga optimizada de Google Analytics 4"],
  ["WPGraphQL + ACF", "—", "CMS headless en api.forjastudios.com (activo)"],
  ["Resend", "—", "Envío del formulario vía Server Action (pendiente)"],
  ["lucide-react", "1.17", "Iconografía SVG"],
  ["Vercel", "—", "Hosting, edge network y revalidación on-demand"],
];

const LIVE_ROUTES: [string, string][] = [
  ["/[locale]", "Home — concepto E (Vanguardia). Hero, clientes, proyectos, IPs, cifras, reel, contacto"],
  ["/[locale]/team", "Página de equipo (blacksmiths)"],
  ["/[locale]/proyecto/[slug]", "Detalle de proyecto + galería (38 proyectos)"],
  ["/[locale]/ip/[slug]", "Detalle de IP propia + galería (3 IPs)"],
];

/** Archivos que Next sirve en la raíz, fuera del segmento de idioma. */
const META_ROUTES: [string, string][] = [
  ["/sitemap.xml", "86 URLs (43 rutas × 2 idiomas) con hreflang, x-default, lastmod y prioridad"],
  ["/robots.txt", "Reglas de rastreo + permiso explícito a los bots de IA"],
  ["/llms.txt", "Resumen del sitio en texto plano para motores de respuesta"],
  ["/manifest.webmanifest", "Nombre, iconos y colores para «Añadir a pantalla de inicio»"],
  ["/icon.png · /apple-icon", "Favicon (136×135) e icono de iOS (180×180, generado)"],
  ["/[locale]/opengraph-image", "Tarjeta social 1200×630 de marca, una por idioma"],
  ["/api/revalidate", "Webhook de WordPress → revalidateTag('site-content')"],
];

const SANDBOX_ROUTES: [string, string][] = [
  ["/[locale]/sandbox", "Selector de pruebas (conceptos y demos)"],
  ["/[locale]/sandbox/concepto-a · b · c · d", "Conceptos de diseño alternativos"],
  ["/[locale]/sandbox/contacto", "4 opciones de formulario de contacto"],
  ["/[locale]/sandbox/team-demo", "3 opciones de sección de equipo"],
  ["/[locale]/sandbox/about-demo", "Opciones de sección 'about / cifras'"],
  ["/[locale]/sandbox/proyecto/[slug]", "Pruebas de detalle de proyecto"],
];

const PALETTE: [string, string, string][] = [
  ["Negro forja", "#0A0A0B", "forja-black — fondo base"],
  ["Gris carbón", "#1A1A1D", "forja-carbon — cards / secciones"],
  ["Ámbar fuego", "#FF6A2C", "forja-amber — acento primario / CTA"],
  ["Rojo forja", "#E03A2E", "forja-red — acento secundario / hover"],
  ["Chispa", "#FFB23E", "forja-spark — detalles / gradiente"],
  ["Blanco hueso", "#F4F1EC", "forja-bone — texto sobre oscuro"],
  ["Gris claro", "#9A9A9E", "forja-muted — captions"],
];

const COMPONENTS: { group: string; items: [string, string][] }[] = [
  {
    group: "Live — concepto E (sections/e/)",
    items: [
      ["NavE", "Header fijo + drawer móvil, locale-aware, fire-line al hacer scroll"],
      ["HeroE", "Hero con video servido desde WP, canvas de humo/chispas y título rotativo"],
      ["HeroBgVideoFile", "Capa de video del hero: se pinta entero sobre su miniatura desenfocada"],
      ["ClientsE", "Marquee de logos de clientes"],
      ["ProjectsE", "Grilla de proyectos destacados (#work)"],
      ["IPsE · IPCardWebGL", "Showcase de IPs con textura WebGL (three) y video de fondo"],
      ["StatsInterleaved", "Sección de cifras (about/, live en la home)"],
      ["ReelE", "Showreel del estudio"],
      ["ContactForgeMeter", "Formulario con «heat meter» y partículas (contact/, live)"],
      ["ProjectDetailGalleryE", "Detalle de proyecto: portada, firma del cliente y galería"],
      ["DetailGalleryE", "Detalle genérico reutilizado por las páginas de IP"],
      ["TeamE", "Página de equipo"],
      ["FooterE", "Pie del sitio"],
      ["CursorE · TiltCard", "Cursor custom (desactivado) y tarjetas con tilt 3D"],
    ],
  },
  {
    group: "Variantes de sandbox (no live)",
    items: [
      ["about/ StatsForgeGrid · StatsSpotlight · StatsZigzag", "Alternativas de la sección de cifras"],
      ["contact/ ForgeBento · BentoMagnetic · Conversational", "Alternativas de formulario"],
      ["team/ BentoMosaic · MarqueeReel · SpotlightList", "Alternativas de equipo"],
      ["sections/a · b · c · d", "Conceptos de diseño A/B/C/D completos"],
    ],
  },
  {
    group: "UI reutilizable (ui/)",
    items: [
      ["Button", "CTA con variantes primary / outline / ghost"],
      ["IntroOverlay", "Intro de marca en cada carga de página (respeta reduced-motion)"],
      ["LangSwitch", "Selector de idioma ES/EN"],
      ["Marquee · MasonryColumns", "Cinta infinita y columnas tipo masonry"],
      ["Nav · Section · ProjectGrid", "Primitivos de layout compartidos"],
      ["YouTubeEmbed · AnimatedGif", "Media helpers"],
    ],
  },
  {
    group: "Motion (motion/) — respetan prefers-reduced-motion",
    items: [
      ["Reveal · SectionReveal", "Entradas por scroll"],
      ["CountUp", "Conteo animado de cifras"],
      ["Parallax · MagneticButton · BreathingLight", "Microinteracciones"],
    ],
  },
  {
    group: "SEO (seo/)",
    items: [["JsonLd", "Emite un bloque schema.org escapando `<` para no romper el HTML"]],
  },
];

// ── Página ───────────────────────────────────────────────────────────────────

export default async function DocumentacionPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-forja-black text-forja-bone">
      {/* Encabezado */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <Image
              src={FORJA_LOGO}
              alt="Forja Studios"
              width={420}
              height={155}
              priority
              style={{ height: "2.25rem", width: "auto" }}
              className="object-contain"
            />
            <div className="h-7 w-px bg-border" />
            <Pill tone="muted">Interno · no indexado</Pill>
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-5xl">
            Documentación del proyecto
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forja-bone/70">
            Referencia técnica del sitio de Forja Studios: arquitectura, stack, mapa de navegación,
            sistema de diseño, componentes y capa de SEO. Migración desde Wix a Next.js con
            WordPress headless.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill>Next.js 16</Pill>
            <Pill>React 19</Pill>
            <Pill>Tailwind v4</Pill>
            <Pill>next-intl ES/EN</Pill>
            <Pill tone="green">WordPress activo</Pill>
            <Pill>Open Graph</Pill>
            <Pill>GA4</Pill>
            <Pill>Vercel</Pill>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[230px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-12 lg:h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          <nav className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-y-1">
            <p className="hidden w-full pb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-forja-muted lg:block">
              Contenido
            </p>
            {NAV.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group flex items-center gap-2 text-[13px] text-forja-bone/60 transition-colors hover:text-forja-spark lg:py-1"
              >
                <span className="font-mono text-[10px] text-forja-muted/60 group-hover:text-forja-amber">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <main className="min-w-0 space-y-12">
          {/* Introducción */}
          <Section id="intro" n="01" title="Introducción">
            <p>
              El sitio es una aplicación <strong className="text-forja-bone">Next.js 16</strong> (App
              Router + React Server Components) con contenido editorial servido desde{" "}
              <strong className="text-forja-bone">WordPress headless</strong> vía WPGraphQL + ACF. El
              front es bilingüe <Code>ES</Code> / <Code>EN</Code> y se despliega en Vercel.
            </p>
            <p>
              El sitio live es el <strong className="text-forja-bone">concepto E (Vanguardia)</strong>:
              estética monocroma (B&amp;W) con el fuego como acento. Los conceptos alternativos (A/B/C/D)
              y las pruebas de componentes viven bajo <Code>/sandbox</Code> y no se indexan.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card title="Render">
                SSG por defecto + ISR on-demand. Al publicar en WordPress, un webhook regenera las
                páginas afectadas sin redeploy.
              </Card>
              <Card title="Contenido">
                <Pill tone="green">WordPress en vivo</Pill> 38 proyectos, 3 IPs, equipo y clientes
                desde <Code>api.forjastudios.com</Code>. El mock tipado queda solo como red de
                seguridad ante un fallo del CMS.
              </Card>
              <Card title="Identidad">
                Metáfora de la forja / fuego. Tagline <Code>Forge your flame</Code>. Dark-mode primero.
              </Card>
            </div>
          </Section>

          {/* Stack */}
          <Section id="stack" n="02" title="Stack tecnológico">
            <p>Versiones tomadas de <Code>package.json</Code>.</p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="bg-forja-carbon/60 text-forja-muted">
                    <th className="px-4 py-2.5 font-medium">Tecnología</th>
                    <th className="px-4 py-2.5 font-medium">Versión</th>
                    <th className="px-4 py-2.5 font-medium">Uso</th>
                  </tr>
                </thead>
                <tbody>
                  {STACK.map(([tech, ver, use]) => (
                    <tr key={tech} className="border-t border-border/60">
                      <td className="px-4 py-2.5 font-medium text-forja-bone">{tech}</td>
                      <td className="px-4 py-2.5 font-mono text-forja-spark">{ver}</td>
                      <td className="px-4 py-2.5 text-forja-bone/70">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-forja-muted">
              ⚠️ Gotchas Next 16 / Tailwind v4: el middleware se llama <Code>proxy.ts</Code> (no
              middleware.ts); <Code>params</Code> es una <Code>Promise</Code> (siempre <Code>await</Code>);
              los tokens viven en <Code>globals.css</Code> con <Code>@theme</Code> (no hay tailwind.config).
            </p>
          </Section>

          {/* Arquitectura */}
          <Section id="arquitectura" n="03" title="Arquitectura">
            <p>Flujo de una petición y de los datos:</p>
            <Block title="Flujo general">{`Navegador
   │  GET /es  (o /en)
   ▼
proxy.ts (middleware next-intl)  ──►  resuelve locale y reescribe a /[locale]
   ▼
App Router · [locale]/layout.tsx        (html, fuentes, JSON-LD, IntlProvider)
   ▼
[locale]/page.tsx  (RSC, SSG)
   │  await getSiteContent(locale)        ← único punto de datos
   ▼
lib/wp/client.ts
   ├─ WP_GRAPHQL_URL definido?  ──► WPGraphQL (proyectos, ips, miembros, clientes)
   └─ si no / ante error       ──► mock tipado (data.json)   ← estado actual
   ▼
Componentes de sección (sections/e/*)  ──►  HTML estático + hidratación selectiva`}</Block>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Rendering">
                React Server Components por defecto; los componentes interactivos (nav, hero, formulario)
                son <Code>&quot;use client&quot;</Code>. SSG en build + ISR on-demand para refrescar contenido sin
                redeploy.
              </Card>
              <Card title="i18n">
                <Code>next-intl</Code> con segmento <Code>[locale]</Code> y <Code>localePrefix: &quot;always&quot;</Code>{" "}
                (siempre <Code>/es</Code> o <Code>/en</Code>). UI traducida en <Code>messages/&#123;es,en&#125;.json</Code>;
                contenido editorial traducido en WP (Polylang).
              </Card>
              <Card title="Capa de datos">
                Toda lectura pasa por <Code>getSiteContent(locale)</Code>. La forma <Code>SiteContent</Code> es
                idéntica con mock o con WP, así que ningún componente cambia al conectar el CMS.
              </Card>
              <Card title="Animación">
                Framer Motion + GSAP/ScrollTrigger + CSS scroll-driven. Todo respeta{" "}
                <Code>prefers-reduced-motion</Code> (desactivado globalmente en <Code>globals.css</Code>).
              </Card>
            </div>
          </Section>

          {/* WordPress */}
          <Section id="wordpress" n="04" title="WordPress headless">
            <p>
              CMS desacoplado en <Code>api.forjastudios.com</Code> (hosting aparte) expuesto por{" "}
              <strong className="text-forja-bone">WPGraphQL + ACF</strong>. El front consume 4 CPTs:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card title="proyecto">Título, cliente, año, categoría, portada, galería, video, destacado — <strong className="text-forja-bone">38 publicados</strong></Card>
              <Card title="ip">Nombre, descripción, portada, video de fondo, galería — <strong className="text-forja-bone">3 publicadas</strong></Card>
              <Card title="miembro">Nombre, rol y foto (equipo / blacksmiths). El CEO se fija siempre primero</Card>
              <Card title="cliente">Nombre y logo, para el marquee de la home</Card>
            </div>

            <h3 className="pt-2 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">
              Caché y revalidación
            </h3>
            <p>
              En Next 16 <Code>fetch</Code> ya no se cachea por defecto, así que{" "}
              <Code>lib/wp/fetcher.ts</Code> pide explícitamente <Code>force-cache</Code> y etiqueta cada
              respuesta con el tag <Code>site-content</Code>. Al publicar, WordPress llama a{" "}
              <Code>/api/revalidate</Code> con el secreto compartido y ese tag se invalida: las páginas
              se regeneran en la siguiente visita, sin redeploy. <Code>WP_REVALIDATE_SECONDS</Code>{" "}
              (300 s por defecto) es la red de seguridad por si el webhook no llega.
            </p>
            <p className="text-[13px] text-forja-muted">
              Ante cualquier fallo de WordPress, <Code>getSiteContent</Code> cae al mock tipado y deja
              el error en consola: el build nunca se cae por el CMS.
            </p>

            <p>
              <Pill tone="muted">Pendiente</Pill>{" "}
              <span className="text-forja-muted">
                — el contenido editorial aún no está traducido (falta Polylang o WPML en WP), así que{" "}
                <Code>/en</Code> sirve los textos en español. La interfaz sí está traducida en{" "}
                <Code>messages/&#123;es,en&#125;.json</Code>.
              </span>
            </p>
          </Section>

          {/* Imágenes y video */}
          <Section id="imagenes" n="05" title="Imágenes y video">
            <p>
              El sitio <strong className="text-forja-bone">no usa el optimizador de imágenes de
              Vercel</strong>. Su cuota de transformaciones se agotaba y devolvía <Code>402</Code>,
              dejando las imágenes rotas en producción. En su lugar hay un loader propio.
            </p>
            <Block title="Cómo se resuelve cada imagen">{`WordPress genera ~5 tamaños por imagen al subirla
   │  245w · 768w · 1024w · 1536w · 2048w
   ▼
lib/wp/media.ts       anexa las variantes al src como fragmento  …jpg#wp=stem:245x300,768x941,…
   ▼
next/image            pide un ancho del srcSet (deviceSizes: 640/828/1200/1920)
   ▼
lib/image-loader.ts   devuelve la variante YA EXISTENTE inmediatamente ≥ ese ancho
   ▼
0 transformaciones consumidas · srcSet y lazy loading intactos`}</Block>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Contrapartida">
                Se pierde la conversión automática a AVIF/WebP. Por eso hay que{" "}
                <strong className="text-forja-bone">subir a WordPress archivos ya comprimidos</strong>, o
                instalar allí un plugin de WebP (ShortPixel, EWWW, LiteSpeed): el loader no necesita
                cambios, WP sirve el <Code>.webp</Code> en su lugar.
              </Card>
              <Card title="Proxy de medios">
                Las texturas WebGL de las IPs se sirven por <Code>/wp-media/*</Code>, un rewrite
                same-origin hacia los uploads de WP. WordPress no manda cabeceras CORS y una textura
                cross-origin sin ellas no se puede pintar. Es un proxy, no una optimización.
              </Card>
            </div>
          </Section>

          {/* Navegación */}
          <Section id="navegacion" n="06" title="Mapa de navegación">
            <p>
              <strong className="text-forja-bone">Rutas live</strong> (indexadas, en el sitemap con
              hreflang). Todas llevan prefijo de locale.
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              {LIVE_ROUTES.map(([route, desc]) => (
                <div key={route} className="flex flex-col gap-1 border-b border-border/60 px-4 py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
                  <Code>{route}</Code>
                  <span className="text-[13px] text-forja-bone/70">{desc}</span>
                </div>
              ))}
            </div>
            <p className="pt-2">
              <strong className="text-forja-bone">Rutas sandbox</strong>{" "}
              <Pill tone="muted">no indexado</Pill> — bloqueadas en <Code>robots.ts</Code> y fuera del sitemap.
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              {SANDBOX_ROUTES.map(([route, desc]) => (
                <div key={route} className="flex flex-col gap-1 border-b border-border/60 px-4 py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
                  <Code>{route}</Code>
                  <span className="text-[13px] text-forja-bone/70">{desc}</span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-forja-muted">
              Nav del sitio (NavE): Inicio (#top) · Proyectos (#work) · Nuestro equipo (/team) · Contáctanos
              (#contact), más el selector de idioma.
            </p>

            <p className="pt-2">
              <strong className="text-forja-bone">Rutas de metadatos</strong> — las genera Next fuera
              del segmento de idioma.
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              {META_ROUTES.map(([route, desc]) => (
                <div key={route} className="flex flex-col gap-1 border-b border-border/60 px-4 py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
                  <Code>{route}</Code>
                  <span className="text-[13px] text-forja-bone/70">{desc}</span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-forja-muted">
              ⚠️ <Code>apple-icon</Code> es el único de esa lista sin extensión en el nombre, así que
              está excluido a mano en el matcher de <Code>proxy.ts</Code>. Sin esa excepción, el
              middleware de idioma lo redirige a <Code>/en/apple-icon</Code>, que no existe.
            </p>
          </Section>

          {/* Contenido */}
          <Section id="contenido" n="07" title="Modelo de contenido">
            <p>
              Tipo central <Code>SiteContent</Code> (en <Code>lib/content/types.ts</Code>), resuelto por
              locale. Es idéntico venga de WordPress o del mock, así que ningún componente sabe de
              dónde salieron los datos. Estructura:
            </p>
            <Block title="SiteContent">{`SiteContent {
  meta:     { tagline, descriptor, showreelId, stats, contact, socials }
  services: { key, label }[]
  projects: { slug, title, client, category, categoryLabel, year, description,
              featured, accent, videoUrl, coverUrl, clientLogoUrl, gallery[] }[]
  ips:      { slug, name, description, accent, videoUrl, coverUrl, gallery[] }[]
  team:     { name, role, initials, accent, photo }[]
  clients:  { name, logo }[]
}

MediaItem (gallery) { type: "image" | "video", src, poster?, width?, height? }`}</Block>
            <p>
              Datos de marca actuales: tagline <Code>Forge your flame</Code> · 12 años · 60 blacksmiths ·
              1300 proyectos · contacto <Code>admin@forjastudios.com</Code>. Las cifras y datos de marca
              son constantes locales (no CPTs), incluso con WP activo.
            </p>
            <p className="text-[13px] text-forja-muted">
              El campo <Code>cliente</Code> de WordPress llega con el prefijo de créditos (
              <Code>Client © GLU GLUS</Code>). <Code>clientDisplayName()</Code> lo limpia antes de
              usarlo en la firma visible, en los metadatos y en los datos estructurados.
            </p>
          </Section>

          {/* Diseño */}
          <Section id="diseno" n="08" title="Sistema de diseño">
            <p>
              Tokens en 2 capas (Tailwind v4 CSS-first): <strong className="text-forja-bone">primitivos</strong>{" "}
              (<Code>--color-forja-*</Code>) y <strong className="text-forja-bone">semánticos</strong>{" "}
              (<Code>--bg</Code>, <Code>--accent</Code>, <Code>--fg</Code>…) que cada concepto re-tematiza vía{" "}
              <Code>[data-concept]</Code>.
            </p>

            <h3 className="pt-2 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Paleta</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PALETTE.map(([name, hex, use]) => (
                <div key={hex} className="flex items-center gap-3 rounded-lg border border-border bg-forja-carbon/40 p-3">
                  <span
                    className="size-10 shrink-0 rounded-md border border-white/10"
                    style={{ backgroundColor: hex }}
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-forja-bone">{name}</p>
                    <p className="font-mono text-[11px] text-forja-muted">{hex}</p>
                    <p className="truncate text-[11px] text-forja-bone/50">{use}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="pt-4 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Gradiente firma</h3>
            <div className="space-y-2">
              <div className="fire-bg h-12 rounded-lg" />
              <p className="text-[13px] text-forja-muted">
                <Code>#FFB23E → #FF6A2C → #E03A2E</Code>. Disponible como utilidad <Code>fire-bg</Code> (fondo) y{" "}
                <Code>fire-text</Code> (texto): <span className="fire-text font-display font-black">FORGE YOUR FLAME</span>.
              </p>
              <p className="text-[13px] text-forja-muted">
                Nota: dentro de <Code>[data-concept=&quot;e&quot;]</Code> (la home) las variables de fuego se re-tematizan a
                blanco/plata, por eso <Code>fire-text</Code> se ve monocromático ahí. En esta página (tema por
                defecto) se ve naranja.
              </p>
            </div>

            <h3 className="pt-4 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Tipografía</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card title="Garet (display)">
                <span className="font-display text-2xl font-black uppercase">Forge your flame</span>
                <p className="mt-2">Self-hosted (Book + Heavy). Cara de marca de Forja. Display del concepto E.</p>
              </Card>
              <Card title="Inter (body)">
                <span className="text-2xl">Forge your flame</span>
                <p className="mt-2">Google Font. Texto corrido en todos los conceptos (<Code>--font-sans</Code>).</p>
              </Card>
            </div>
            <p className="text-[13px] text-forja-muted">
              Archivo (concepto B) y Playfair (concepto C) se usan solo en sus respectivos sandboxes.
            </p>
          </Section>

          {/* Componentes — muestras */}
          <Section id="componentes" n="09" title="Muestras de componentes">
            <p>Render real de primitivos reutilizables (mismos tokens del sitio).</p>

            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Button — variantes</h3>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-forja-carbon/40 p-5">
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <Block title="ui/Button.tsx">{`<Button variant="primary">Ver proyectos</Button>
<Button variant="outline" href="#about">Conoce el estudio</Button>
<Button variant="ghost">Cancelar</Button>`}</Block>

            <h3 className="pt-2 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Pills / badges</h3>
            <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-forja-carbon/40 p-5">
              <Pill>destacado</Pill>
              <Pill tone="green">activo</Pill>
              <Pill tone="muted">borrador</Pill>
            </div>

            <h3 className="pt-2 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Campo de formulario</h3>
            <div className="rounded-xl border border-border bg-forja-carbon/40 p-5">
              <label className="mb-1.5 block text-xs uppercase tracking-[0.25em] text-forja-spark">Nombre</label>
              <input
                placeholder="Tu nombre"
                className="w-full border-b border-border bg-transparent pb-2 text-sm text-forja-bone placeholder:text-forja-muted/40 focus:outline-none"
              />
              <div className="mt-2 h-[2px] w-1/3 rounded-full fire-bg" />
            </div>

            <h3 className="pt-2 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Tarjeta</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Proyecto">Estilo base de card: borde sutil, fondo carbón translúcido, título display.</Card>
              <Card title="Cliente">Reutilizado en grillas de proyectos, IPs y secciones de about.</Card>
            </div>
          </Section>

          {/* Catálogo */}
          <Section id="catalogo" n="10" title="Catálogo de componentes">
            <p>Inventario por carpeta (<Code>src/components/</Code>).</p>
            <div className="space-y-5">
              {COMPONENTS.map((g) => (
                <div key={g.group}>
                  <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-forja-amber">{g.group}</h3>
                  <div className="overflow-hidden rounded-xl border border-border">
                    {g.items.map(([name, desc]) => (
                      <div key={name} className="flex flex-col gap-1 border-b border-border/60 px-4 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
                        <span className="font-mono text-[12.5px] text-forja-spark sm:w-72 sm:shrink-0">{name}</span>
                        <span className="text-[13px] text-forja-bone/70">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* SEO */}
          <Section id="seo" n="11" title="SEO y datos estructurados">
            <p>
              Todo se compone desde un único módulo, <Code>lib/seo.ts</Code>: la URL canónica del
              sitio, los <Code>alternates</Code> y los constructores de JSON-LD. Cada página aporta su{" "}
              <Code>generateMetadata</Code> tirando de ahí, así que el dominio y el formato viven en un
              solo archivo.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Metadatos por página">
                Home, equipo, proyecto e IP tienen título y descripción propios. Antes las internas
                heredaban los de la home: para un buscador eran casi la misma página.
              </Card>
              <Card title="Canonical + hreflang">
                <Code>alternates(locale, path)</Code> emite la canónica de cada página y los{" "}
                <Code>hreflang</Code> de ambos idiomas más <Code>x-default</Code>, que es la variante
                que se sirve a quien no encaja en ninguno. Todo cuelga de{" "}
                <Code>SITE_URL</Code>, que va <strong className="text-forja-bone">con www</strong>:
                el apex responde 308 hacia www, y una canónica que redirige no sirve de nada.
              </Card>
              <Card title="robots por página">
                Las rutas live van <Code>index, follow</Code> con{" "}
                <Code>max-image-preview:large</Code> y <Code>max-snippet:-1</Code>, que es lo que
                habilita la miniatura grande y el fragmento largo en resultados.
              </Card>
              <Card title="Privadas de verdad">
                <Code>/sandbox</Code> y esta página llevan <Code>noindex</Code> por cabecera, no solo
                por <Code>robots.txt</Code>: bloquear el rastreo no impide que una URL enlazada desde
                fuera acabe indexada.
              </Card>
            </div>

            <h3 className="pt-2 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">
              Grafo de datos estructurados
            </h3>
            <p>
              Los bloques schema.org no son fichas sueltas: comparten <Code>@id</Code> estables, así
              que los motores entienden que hablan de la misma entidad en cada página.
            </p>
            <Block title="Qué emite cada ruta">{`layout          Organization (#organization) + WebSite (#website)
                └ logo, redes, email, nº de empleados, servicios que domina

/team           AboutPage → mainEntity: Organization con employee[]  + BreadcrumbList
/proyecto/…     CreativeWork (género, año, cliente, imagen, video)   + BreadcrumbList
/ip/…           CreativeWork (creator y copyrightHolder = Forja)     + BreadcrumbList`}</Block>
            <p className="text-[13px] text-forja-muted">
              Se emiten con <Code>components/seo/JsonLd.tsx</Code>, que escapa los <Code>&lt;</Code>{" "}
              del JSON: si un texto del CMS trajera la secuencia de cierre de un script, el navegador
              cerraría ahí la etiqueta y el resto del JSON quedaría suelto en la página.
            </p>

            <h3 className="pt-2 font-display text-sm font-bold uppercase tracking-wide text-forja-bone">
              Accesibilidad y Core Web Vitals
            </h3>
            <p className="text-[13px] text-forja-muted">
              Objetivo WCAG AA y CWV ≥ 90. <Code>prefers-reduced-motion</Code> respetado en todo el
              sitio; <Code>scroll-padding-top</Code> para las anclas bajo el nav fijo. Pendiente: el
              HTML de la home pesa ~369 KB, de los que 238 KB son el estado que React serializa —
              la home recibe los 38 proyectos completos cuando sus componentes usan tres campos.
            </p>
          </Section>

          {/* Open Graph */}
          <Section id="opengraph" n="12" title="Open Graph y redes">
            <p>
              Antes, compartir un enlace del sitio no mostraba ninguna imagen: faltaba{" "}
              <Code>og:image</Code> por completo y la tarjeta de X estaba en <Code>summary</Code>{" "}
              (miniatura pequeña). Ahora cada página tiene tarjeta propia.
            </p>

            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-forja-bone">
              Tarjeta de marca — 1200×630
            </h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <Image
                src={`/${locale}/opengraph-image`}
                alt="Tarjeta de Open Graph de Forja Studios: logo, «Forge your flame» y el gradiente de forja"
                width={1200}
                height={630}
                unoptimized
                className="w-full"
              />
            </div>
            <p className="text-[13px] text-forja-muted">
              Render real de <Code>[locale]/opengraph-image.tsx</Code> en el idioma de esta página.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Cómo se genera">
                Con <Code>ImageResponse</Code> de <Code>next/og</Code>, en el build: quedan dos PNG
                estáticos (uno por idioma), sin render en caliente ni consumo de la cuota de imágenes.
              </Card>
              <Card title="Por qué hay fuentes .ttf">
                Satori, el motor de <Code>ImageResponse</Code>, no descomprime <Code>woff2</Code>. En{" "}
                <Code>lib/fonts/</Code> están los mismos Garet Book y Heavy convertidos a{" "}
                <Code>.ttf</Code>. <strong className="text-forja-bone">Solo se leen en build</strong>;
                al navegador nunca llegan.
              </Card>
              <Card title="Internas: su propia portada">
                Proyectos e IPs usan como <Code>og:image</Code> la portada real del CMS — vende mucho
                más que la tarjeta genérica. Si un contenido no tiene portada, hereda la de marca.
              </Card>
              <Card title="Sin width/height falsos">
                A las portadas del CMS no se les declaran medidas: son de tamaño variable y anunciar
                unas que no son las reales hace que la tarjeta salga deformada.
              </Card>
            </div>

            <Block title="Etiquetas que emite la home (/es)">{`<title>Forja Studios — Animación 2D/3D, VFX y concept art</title>
<meta name="description"  content="Estudio creativo de animación 2D y 3D, VFX…">
<link rel="canonical"     href="https://www.forjastudios.com/es">
<link rel="alternate" hreflang="es|en|x-default" …>

og:title · og:description · og:url · og:site_name · og:type=website
og:image (1200×630) + :type + :width + :height + :alt
og:locale=es_ES · og:locale:alternate=en_US        ← formato de Facebook, no "es"

twitter:card=summary_large_image                   ← banner ancho, no miniatura
twitter:site=@StudiosForja · twitter:creator · twitter:image

theme-color=#0a0a0b · manifest · apple-touch-icon (180×180)`}</Block>
            <p className="text-[13px] text-forja-muted">
              Al publicar cambios, Facebook y X sirven la versión cacheada: hay que forzar el
              re-scrapeo en el depurador de Facebook y en el validador de tarjetas de X.
            </p>
          </Section>

          {/* AEO */}
          <Section id="aeo" n="13" title="Motores de respuesta (AEO)">
            <p>
              ChatGPT Search, Perplexity o las AI Overviews de Google no renderizan JavaScript ni
              interpretan un diseño: se apoyan en datos estructurados y en texto explícito. De ahí que
              el sitio publique dos piezas pensadas solo para ellos.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="/llms.txt">
                Índice del sitio en texto plano (convención de <Code>llmstxt.org</Code>): qué es el
                estudio, servicios, IPs, proyectos destacados, todos los proyectos y contacto. Se
                genera desde el mismo contenido de WordPress, así que se actualiza al publicar.
              </Card>
              <Card title="robots.txt explícito">
                Los rastreadores de IA se listan por nombre y con permiso, en vez de quedar cubiertos
                por el comodín. Que puedan leer el sitio es la condición para que lo citen.
              </Card>
            </div>
            <Block title="robots.ts — bloque de bots de IA">{`GPTBot · ClaudeBot · CCBot            ← entrenamiento de modelos
OAI-SearchBot · ChatGPT-User          ← ChatGPT, consulta en tiempo real
PerplexityBot · Perplexity-User       ← Perplexity
Claude-SearchBot · Claude-User        ← Claude
Google-Extended · Applebot-Extended · meta-externalagent

Para dejar de alimentar el ENTRENAMIENTO sin perder las citas, basta con mover
los tres primeros a "disallow": el resto solo consulta en tiempo real.`}</Block>
          </Section>

          {/* Analítica */}
          <Section id="analitica" n="14" title="Analítica">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Google Analytics 4">
                Propiedad <Code>G-NDG41Y77ZH</Code>, cargada con{" "}
                <Code>@next/third-parties</Code> desde el layout, así que cubre ambos idiomas y todas
                las rutas.
              </Card>
              <Card title="Sin bloquear el render">
                El paquete usa <Code>strategy=&quot;afterInteractive&quot;</Code>: precarga{" "}
                <Code>gtag.js</Code> desde el HTML y lo ejecuta tras la hidratación. No penaliza el LCP.
              </Card>
              <Card title="Solo en producción">
                El tráfico de <Code>npm run dev</Code> no ensucia las métricas. Para probarlo en
                local: <Code>npm run build &amp;&amp; npm run start</Code>, que ya corre en modo
                producción.
              </Card>
              <Card title="Navegación interna">
                Las vistas de página en navegaciones sin recarga las capta la medición mejorada de
                GA4 («eventos del historial del navegador»), activa por defecto.
              </Card>
            </div>
            <p className="text-[13px] text-forja-muted">
              Para eventos personalizados (clic en el CTA, envío del formulario):{" "}
              <Code>sendGAEvent(&apos;event&apos;, &apos;nombre&apos;, &#123;…&#125;)</Code> desde{" "}
              <Code>@next/third-parties/google</Code>, en un componente cliente.
            </p>
          </Section>

          {/* Despliegue */}
          <Section id="despliegue" n="15" title="Despliegue y entorno">
            <p>Deploy en <strong className="text-forja-bone">Vercel</strong>. Variables de entorno:</p>
            <Block title=".env  (plantilla completa en .env.example)">{`WP_GRAPHQL_URL         # endpoint WPGraphQL — si está vacío, el sitio usa el mock
NEXT_PUBLIC_WP_URL     # base pública de WordPress (imágenes / preview)
WP_PREVIEW_SECRET      # preview de borradores desde WP
WP_REVALIDATE_SECONDS  # red de seguridad del ISR (300 = 5 min · 0 = solo webhook)
REVALIDATE_SECRET      # webhook WP → revalidateTag. El MISMO valor en Vercel y en WP
WORDPRESS_USER         # solo para los scripts de mantenimiento (REST API)
WORDPRESS_KEY          # contraseña de aplicación, no la de la cuenta
RESEND_API_KEY         # envío del formulario de contacto (pendiente)
NEXT_PUBLIC_GA_ID      # opcional: otra propiedad de GA4 (staging/pruebas)`}</Block>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Comandos</h3>
            <Block title="npm scripts">{`npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run start    # servir build
npm run lint     # ESLint`}</Block>
            <p className="text-[13px] text-forja-muted">
              Revalidación <Pill tone="green">activa</Pill> — WordPress llama al endpoint protegido
              por <Code>REVALIDATE_SECRET</Code> (cabecera <Code>x-revalidate-secret</Code> o{" "}
              <Code>?secret=</Code>) y dispara <Code>revalidateTag(&apos;site-content&apos;)</Code>. El
              contenido se refresca sin redeploy.
            </p>
          </Section>

          <footer className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-8 text-[12px] text-forja-muted">
            <Image
              src={FORJA_LOGO}
              alt="Forja Studios"
              width={420}
              height={155}
              style={{ height: "1.5rem", width: "auto" }}
              className="opacity-50"
            />
            <span>Documento interno · generado a partir del código fuente. No indexado.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
