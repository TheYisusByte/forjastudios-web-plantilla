import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";

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
  { id: "navegacion", label: "Mapa de navegación" },
  { id: "contenido", label: "Modelo de contenido" },
  { id: "diseno", label: "Sistema de diseño" },
  { id: "componentes", label: "Muestras de componentes" },
  { id: "catalogo", label: "Catálogo de componentes" },
  { id: "seo", label: "SEO y rendimiento" },
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
  ["graphql-request", "—", "Cliente GraphQL hacia WPGraphQL (preparado)"],
  ["Resend", "—", "Envío del formulario vía Server Action (pendiente)"],
  ["lucide-react", "1.17", "Iconografía SVG"],
  ["Vercel", "—", "Hosting, edge network y revalidación on-demand"],
];

const LIVE_ROUTES: [string, string][] = [
  ["/[locale]", "Home — concepto E (Vanguardia). Hero, clientes, proyectos, IPs, about, contacto"],
  ["/[locale]/team", "Página de equipo (blacksmiths)"],
  ["/[locale]/proyecto/[slug]", "Detalle de proyecto + galería masonry"],
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
      ["HeroE", "Hero con video showreel, canvas de humo/chispas y título rotativo holográfico"],
      ["ClientsE", "Marquee de logos de clientes"],
      ["ProjectsE", "Grilla de proyectos destacados (#work)"],
      ["IPsE", "Showcase de IPs propias con video de fondo"],
      ["StatsInterleaved", "Sección 'about' en cifras (about/, live en la home)"],
      ["ContactForgeMeter", "Formulario con 'heat meter' y partículas (contact/, live)"],
      ["ProjectDetailE / GalleryE", "Detalle de proyecto + galería masonry"],
      ["TeamE", "Página de equipo"],
      ["CursorE / TiltCard", "Cursor custom y tarjetas con tilt 3D"],
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
      ["LangSwitch", "Selector de idioma ES/EN con banderas"],
      ["Marquee", "Cinta infinita reutilizable"],
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
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="font-display text-lg font-black uppercase tracking-tight">
              FORJA<span className="fire-text"> STUDIOS</span>
            </span>
            <Pill tone="muted">Interno · no indexado</Pill>
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-5xl">
            Documentación del proyecto
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forja-bone/70">
            Referencia técnica del sitio de Forja Studios: arquitectura, stack, mapa de navegación,
            sistema de diseño y componentes. Migración desde Wix a Next.js con WordPress headless.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill>Next.js 16</Pill>
            <Pill>React 19</Pill>
            <Pill>Tailwind v4</Pill>
            <Pill>next-intl ES/EN</Pill>
            <Pill>WordPress headless</Pill>
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
                SSG por defecto + ISR on-demand. Páginas estáticas regeneradas vía webhook de WP.
              </Card>
              <Card title="Contenido">
                Hoy resuelve un <em>mock</em> bilingüe tipado (<Code>data.json</Code>). WordPress queda
                como fuente cuando se active.
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
              CMS desacoplado en <Code>cms.forjastudios.com</Code> (hosting aparte) expuesto por{" "}
              <strong className="text-forja-bone">WPGraphQL + ACF</strong>. El front consume 4 CPTs:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card title="proyecto"><Code>title</Code>, cliente, año, categoría, cover, galería (adjuntos), videoUrl, destacado</Card>
              <Card title="ip">Nombre, descripción, <Code>videoId</Code> de fondo, enlace, logo</Card>
              <Card title="miembro">Nombre, rol, foto, redes (equipo / blacksmiths)</Card>
              <Card title="cliente">Nombre, logo, sitio web</Card>
            </div>
            <p>
              <Pill tone="green">Integración lista</Pill>{" "}
              <span className="text-forja-muted">— pero inactiva.</span> Mientras{" "}
              <Code>WP_GRAPHQL_URL</Code> no esté definida, <Code>getSiteContent</Code> resuelve el mock y,
              ante cualquier fallo de WP, hace fallback al mock para no tumbar el build. Pendiente: levantar
              el CMS y el endpoint de revalidación (<Code>revalidateTag</Code> / <Code>revalidatePath</Code>).
            </p>
          </Section>

          {/* Navegación */}
          <Section id="navegacion" n="05" title="Mapa de navegación">
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
          </Section>

          {/* Contenido */}
          <Section id="contenido" n="06" title="Modelo de contenido">
            <p>
              Tipo central <Code>SiteContent</Code> (en <Code>lib/content/types.ts</Code>), resuelto por
              locale. Estructura:
            </p>
            <Block title="SiteContent">{`SiteContent {
  meta:     { tagline, descriptor, showreelId, stats, contact, socials }
  services: { key, label }[]
  projects: { slug, title, client, category, year, description,
              featured, accent, videoUrl, coverUrl, gallery[] }[]
  ips:      { slug, name, description, accent, videoId }[]
  team:     { name, role, initials, accent }[]
  clients:  { name, logo }[]
}`}</Block>
            <p>
              Datos de marca actuales: tagline <Code>Forge your flame</Code> · 12 años · 60 blacksmiths ·
              1300 proyectos · showreel YouTube <Code>6nN0LBIOH0c</Code> · contacto{" "}
              <Code>admin@forjastudios.com</Code>. Las cifras y datos de marca son constantes locales (no
              CPTs), incluso con WP activo.
            </p>
          </Section>

          {/* Diseño */}
          <Section id="diseno" n="07" title="Sistema de diseño">
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
          <Section id="componentes" n="08" title="Muestras de componentes">
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
          <Section id="catalogo" n="09" title="Catálogo de componentes">
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
          <Section id="seo" n="10" title="SEO y rendimiento">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Metadata">
                Por locale en <Code>[locale]/layout.tsx</Code>: title template, OpenGraph y{" "}
                <Code>metadataBase</Code>. Esta página de docs lleva <Code>robots: noindex</Code>.
              </Card>
              <Card title="JSON-LD">
                <Code>Organization</Code> structured data en el layout (nombre, url, slogan, email, redes).
              </Card>
              <Card title="Sitemap + robots">
                <Code>sitemap.ts</Code> con hreflang para cada ruta live; <Code>robots.ts</Code> bloquea{" "}
                <Code>/sandbox</Code> y <Code>/documentacion</Code>.
              </Card>
              <Card title="Accesibilidad / CWV">
                Objetivo WCAG AA y Core Web Vitals ≥ 90. <Code>prefers-reduced-motion</Code> respetado;{" "}
                <Code>scroll-padding-top</Code> para anclas bajo el nav fijo.
              </Card>
            </div>
          </Section>

          {/* Despliegue */}
          <Section id="despliegue" n="11" title="Despliegue y entorno">
            <p>Deploy en <strong className="text-forja-bone">Vercel</strong>. Variables de entorno:</p>
            <Block title=".env">{`NEXT_PUBLIC_WP_URL    # URL pública del WordPress
WP_GRAPHQL_URL        # endpoint WPGraphQL (activa el modo WP)
WP_PREVIEW_SECRET     # preview de borradores
REVALIDATE_SECRET     # webhook de revalidación ISR
RESEND_API_KEY        # envío del formulario de contacto`}</Block>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-forja-bone">Comandos</h3>
            <Block title="npm scripts">{`npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run start    # servir build
npm run lint     # ESLint`}</Block>
            <p className="text-[13px] text-forja-muted">
              Revalidación: cuando WP esté vivo, un webhook al endpoint protegido por{" "}
              <Code>REVALIDATE_SECRET</Code> dispara <Code>revalidateTag</Code> / <Code>revalidatePath</Code> para
              refrescar el contenido sin redeploy.
            </p>
          </Section>

          <footer className="border-t border-border pt-8 text-[12px] text-forja-muted">
            Documento interno de Forja Studios · generado a partir del código fuente. No indexado.
          </footer>
        </main>
      </div>
    </div>
  );
}
