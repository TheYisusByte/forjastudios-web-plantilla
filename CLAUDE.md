@AGENTS.md

# Forja Studios — Sitio web

Rediseño de [forjastudios.com](https://www.forjastudios.com/) (estudio creativo de animación 2D/3D, VFX, ilustración y producción audiovisual). Migración desde Wix.

- **Cliente:** Forja Studios — Oscar Darío Saldarriaga (CEO / Art Director)
- **Entrega inicial:** one-page (escalable a multipágina), bilingüe **ES/EN**
- **Fase actual:** proyecto inicializado (scaffold listo). Planeación/diseño pendiente.

## Python en este proyecto

Entorno **macOS**. `python3` está en el `PATH` (vía pyenv, Python 3.11.9); invócalo directamente:

```bash
python3 <script.py> [args]
```

Ejemplo (búsqueda de la skill de diseño):

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py \
  "dark portfolio animation studio" --domain style -n 3
```

> Lo usan las skills basadas en Python (`ui-ux-pro-max`, `design`, `design-system`). La config de venv se definirá más adelante si hace falta aislar dependencias.

## Stack y arquitectura (decisiones confirmadas)

- **Frontend:** Next.js 16 (App Router, RSC) + React 19 + **TypeScript** + **Tailwind v4**. Scaffold actual con `create-next-app` (carpeta `src/`, ESLint, Turbopack, alias `@/*`).
- **CMS:** **WordPress headless** vía **WPGraphQL + ACF** (en `cms.forjastudios.com`, hosting aparte). El front consume contenido por GraphQL.
- **Render:** SSG + ISR on-demand (webhook de WP → `revalidateTag`/`revalidatePath`).
- **i18n:** ES (default) / EN con `next-intl` y segmento `src/app/[locale]/`; UI en `src/messages/{es,en}.json`, contenido editorial traducido en WP (Polylang/WPML). **Implementado.**
- **Animación:** Framer Motion + CSS scroll-driven. **Data:** `graphql-request`/Apollo + GraphQL Codegen. **Forms:** Server Action → Resend. **Deploy:** Vercel.
- **Variables de entorno:** `NEXT_PUBLIC_WP_URL`, `WP_GRAPHQL_URL`, `WP_PREVIEW_SECRET`, `REVALIDATE_SECRET`, `RESEND_API_KEY` (ver doc 02).

> ⚠️ **Next 16 / Tailwind v4 — gotchas:** El middleware se llama **`proxy.ts`** (no `middleware.ts`); está en `src/proxy.ts`. `params` es **Promise** (siempre `await`). Tailwind v4 es **CSS-first**: los tokens viven en `src/app/globals.css` (`@theme`), **no** hay `tailwind.config.ts`. El layout raíz vive bajo `src/app/[locale]/layout.tsx`.

## Estructura del frontend (implementada)

**Decisión tomada:** el sitio live es el **concepto E (Vanguardia)**. Es la home y sus subrutas están al nivel principal. Los demás conceptos (A/B/C/D) y las pruebas de componentes viven bajo `/sandbox` (no indexado: `robots.ts` los bloquea y quedan fuera del `sitemap.ts`).

- Rutas **live**: `/[locale]` (home = concepto E), `/[locale]/team`, `/[locale]/proyecto/[slug]`. Idiomas `/es` y `/en` (default EN).
- Rutas **sandbox** (pruebas): `/[locale]/sandbox` (selector), `/[locale]/sandbox/concepto-a|b|c|d`, `/[locale]/sandbox/contacto` (3 opciones de formulario), `/[locale]/sandbox/team-demo` (3 opciones de team).
- Componentes del live en `src/components/sections/e/`; alternativas en `e/contact/` y `e/team/` (consumidas por las demos de sandbox).
- `src/i18n/` (routing, request, navigation), `src/proxy.ts`, `src/messages/{es,en}.json`.
- `src/lib/fonts.ts` (next/font: Inter + Barlow Condensed [A] / Archivo [B] / Playfair [C]), `src/lib/utils.ts` (`cn`).
- `src/lib/content/` (modelo + **mock bilingüe tipado**) y `src/lib/wp/` (cliente stub que resuelve por locale; `getSiteContent(locale)` — único punto a cambiar cuando WP esté vivo).
- `src/components/ui/` (Nav, LangSwitch, Button, Marquee, Section), `src/components/motion/` (Reveal, CountUp, Parallax, MagneticButton, BreathingLight — todas respetan `prefers-reduced-motion`), `src/components/sections/` (compartidas + `a/ b/ c/` por concepto).
- Tokens de concepto: cada página envuelve el contenido en `<div data-concept="a|b|c">`; `globals.css` re-tematiza las CSS vars por concepto.
- SEO: `src/app/sitemap.ts` (con hreflang), `robots.ts`, JSON-LD Organization en el layout.
- **Contenido = mock** (placeholder hasta materiales del cliente); formulario de contacto valida y simula éxito (Resend pendiente).

## Identidad de marca (resumen)

Metáfora de **la forja / fuego**. Tagline: **"Forge your flame"**. Prueba social: +12 años, +60 "blacksmiths", +1300 proyectos. Modo oscuro primero; el fuego como acento, no como ruido.

| Rol | Hex | Uso |
|---|---|---|
| Negro forja | `#0A0A0B` | Fondo base |
| Gris carbón | `#1A1A1D` | Cards/secciones |
| Ámbar fuego | `#FF6A2C` | Acento primario / CTA |
| Rojo forja | `#E03A2E` | Acento secundario / hover |
| Chispa | `#FFB23E` | Detalles / gradiente |
| Blanco hueso | `#F4F1EC` | Texto sobre oscuro |
| Gris claro | `#9A9A9E` | Captions |

Gradiente firma: `#FFB23E → #FF6A2C → #E03A2E`. (Validar hex finales contra el manual de marca.)

## Documentación del proyecto (fuente de verdad)

Vault en `C:\Users\DIEGO\AI-BRAIN\Forja-Studios\Forja Studios\` (Obsidian). **Consultar antes de decisiones de diseño/arquitectura:**

- `00 - Proyecto Web Forja.md` — índice maestro y decisiones clave
- `01 - Identidad de Marca.md` — paleta, tipografía, assets, redes
- `02 - Arquitectura Next.js.md` — stack, estructura de carpetas, i18n, env vars
- `03 - WordPress Headless (WPGraphQL).md` — plugins, CPTs (`proyecto`/`ip`/`miembro`/`cliente`), queries
- `04 - Despliegue en Vercel.md` — pipeline, dominios, checklist go-live
- `05/06/07 - Concepto A/B/C` — 3 propuestas de diseño one-page (A minimalista, B moderno, C cálido)
- `08 - Modelo de Contenido y Secciones.md` — secciones del one-page ↔ contenido WP
- `09 - Performance, SEO y Accesibilidad.md` — meta CWV ≥ 90, WCAG AA
- `10 - Roadmap y Próximos Pasos.md` — fases del proyecto
- `Diagrama - *.excalidraw` — arquitectura y wireframes de cada concepto

## Skills instaladas (`.claude/skills/`, versionadas en el repo)

**Diseño / branding** — para estilo, paletas, tipografía, componentes y QA de UI:
`ui-ux-pro-max` (principal, requiere Python — ver arriba), `design` (logos/CIP/banners/iconos/slides, requiere Python), `design-system` (tokens primitive→semantic→component, requiere Python), `ui-styling` (shadcn/ui + Radix + Tailwind, dark mode), `brand` (voz e identidad de marca), `banner-design`, `slides`.

**Animación — suite GSAP oficial** (8 skills, doc por tema) — para animaciones del front:
`gsap-core` (API base: tweens, easing, stagger, matchMedia), `gsap-timeline`, `gsap-scrolltrigger` (scroll/parallax/pinning), `gsap-plugins`, `gsap-react` (`useGSAP` para Next/React), `gsap-frameworks`, `gsap-performance`, `gsap-utils`.

> Índice de skills en `.claude/skills/llms.txt`. La animación del sitio usa Framer Motion + CSS scroll-driven (ver stack); GSAP es opción/refuerzo para interacciones scroll-driven más complejas.

## Comandos

```
npm run dev      # servidor de desarrollo (Turbopack)
npm run build    # build de producción
npm run start    # servir build
npm run lint     # ESLint
```
