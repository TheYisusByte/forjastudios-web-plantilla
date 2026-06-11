@AGENTS.md

# Forja Studios — Sitio web

Rediseño de [forjastudios.com](https://www.forjastudios.com/) (estudio creativo de animación 2D/3D, VFX, ilustración y producción audiovisual). Migración desde Wix.

- **Cliente:** Forja Studios — Oscar Darío Saldarriaga (CEO / Art Director)
- **Entrega inicial:** one-page (escalable a multipágina), bilingüe **ES/EN**
- **Fase actual:** proyecto inicializado (scaffold listo). Planeación/diseño pendiente.

## Python en este proyecto

Python **no** está en el `PATH` (el `python` del shell es el stub de Microsoft Store). Usa SIEMPRE la ruta completa al intérprete:

```
c:\users\diego\appdata\local\programs\python\python311\python.exe <script.py> [args]
```

Python 3.11.9. Ejemplo (búsqueda de la skill de diseño):

```powershell
& "c:\users\diego\appdata\local\programs\python\python311\python.exe" `
  "D:\CODE\forja\.claude\skills\ui-ux-pro-max\scripts\search.py" `
  "dark portfolio animation studio" --domain style -n 3
```

> La config de entornos/venv de Python se definirá más adelante; por ahora invocar con la ruta completa.

## Stack y arquitectura (decisiones confirmadas)

- **Frontend:** Next.js 16 (App Router, RSC) + React 19 + **TypeScript** + **Tailwind v4**. Scaffold actual con `create-next-app` (carpeta `src/`, ESLint, Turbopack, alias `@/*`).
- **CMS:** **WordPress headless** vía **WPGraphQL + ACF** (en `cms.forjastudios.com`, hosting aparte). El front consume contenido por GraphQL.
- **Render:** SSG + ISR on-demand (webhook de WP → `revalidateTag`/`revalidatePath`).
- **i18n:** ES (default) / EN con `next-intl` y segmento `src/app/[locale]/`; UI en `src/messages/{es,en}.json`, contenido editorial traducido en WP (Polylang/WPML). **Implementado.**
- **Animación:** Framer Motion + CSS scroll-driven. **Data:** `graphql-request`/Apollo + GraphQL Codegen. **Forms:** Server Action → Resend. **Deploy:** Vercel.
- **Variables de entorno:** `NEXT_PUBLIC_WP_URL`, `WP_GRAPHQL_URL`, `WP_PREVIEW_SECRET`, `REVALIDATE_SECRET`, `RESEND_API_KEY` (ver doc 02).

> ⚠️ **Next 16 / Tailwind v4 — gotchas:** El middleware se llama **`proxy.ts`** (no `middleware.ts`); está en `src/proxy.ts`. `params` es **Promise** (siempre `await`). Tailwind v4 es **CSS-first**: los tokens viven en `src/app/globals.css` (`@theme`), **no** hay `tailwind.config.ts`. El layout raíz vive bajo `src/app/[locale]/layout.tsx`.

## Estructura del frontend (implementada)

Se construyeron los **3 conceptos one-page** para que el cliente elija (decisión "Fase 0"):

- Rutas: `/[locale]` (índice selector A/B/C), `/[locale]/concepto-a|b|c`. Idiomas `/es` (default) y `/en`.
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

## Skills de diseño instaladas

En `.claude/skills/`: `ui-ux-pro-max` (principal, requiere Python — ver arriba), `design`, `design-system`, `ui-styling`, `brand`, `banner-design`, `slides`. Usar para decisiones de estilo, paletas, tipografía, componentes y QA de UI.

## Comandos

```
npm run dev      # servidor de desarrollo (Turbopack)
npm run build    # build de producción
npm run start    # servir build
npm run lint     # ESLint
```
