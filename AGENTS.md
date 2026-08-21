# AGENTS.md — forjastudios-web-plantilla

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Identidad del Proyecto

Sitio web corporativo de Forja Studios con CMS headless WordPress, internacionalización, animaciones avanzadas y elementos 3D.

**Propietario**: Jesus Adrian Anaya Sarria
**Tipo**: Sitio web corporativo
**Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + WordPress headless (WPGraphQL)

## Git Workflow

- **Base branch**: `main`
- **Commits**: español, formato Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`)
- **PRs**: describir el cambio y su impacto visual/funcional

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js | 16.2.7 |
| UI | React | 19.2.4 |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 4.x |
| CMS | WordPress headless | WPGraphQL |
| i18n | next-intl | 4.13 |
| Animaciones | GSAP + Framer Motion | 3.15 / 12.40 |
| 3D | Three.js | 0.170 |
| Iconos | Lucide React | 1.17 |
| Utilidades | clsx + tailwind-merge | — |

## Estructura del Proyecto

```
src/
├── app/
│   └── [locale]/          # Rutas con i18n (es/en)
│       ├── page.tsx       # Home principal
│       ├── documentacion/
│       ├── ip/
│       ├── proyecto/
│       ├── sandbox/
│       └── team/
├── components/            # Componentes React (secciones, UI)
├── i18n/                  # Config de internacionalización
│   ├── routing.ts
│   ├── request.ts
│   └── navigation.ts
├── lib/                   # Utilidades, cliente WP, helpers
├── messages/              # Traducciones JSON por idioma
└── proxy.ts               # Proxy para WordPress
wordpress/                 # Plugin headless WordPress (forja-headless.zip)
scripts/                   # Scripts de mantenimiento
```

## Convenciones de Código

- **Path alias**: `@/*` → `./src/*`
- **Componentes**: en `src/components/`, PascalCase, un componente por archivo
- **Server Components** por defecto; `"use client"` solo cuando se necesita interactividad del navegador
- **Estilos**: Tailwind CSS 4 con `clsx` + `tailwind-merge` para clases condicionales
- **i18n**: usar `next-intl` — las keys van en `messages/`, los hooks son `useTranslations`
- **WordPress**: consumir vía `getSiteContent()` en `src/lib/wp/client.ts`
- **Animaciones**: GSAP para animaciones complejas, Framer Motion para transiciones de página
- **Three.js**: componentes 3D en archivos dedicados, lazy-loaded
- **Tipado**: TypeScript estricto (`strict: true`), interfaces para props de componentes

## Comandos de Desarrollo

```bash
pnpm install        # Instalar dependencias
pnpm dev            # Desarrollo local (next dev)
pnpm build          # Build de producción
pnpm start          # Servidor de producción
pnpm lint           # Linting con ESLint
```

## Quality Gates

- **Lint**: `pnpm lint` sin errores
- **Build**: `pnpm build` debe completar sin errores
- **TypeScript**: sin errores de tipo (`noEmit: true`, `strict: true`)
- **i18n**: todas las keys traducidas en `messages/es.json` y `messages/en.json`
- **Imágenes**: optimizadas, con `alt` text, en formato WebP/AVIF

## Seguridad

- Variables sensibles en `.env` (nunca en código): `WP_GRAPHQL_URL`, `RESEND_API_KEY`, `WP_PREVIEW_SECRET`, `REVALIDATE_SECRET`
- `.env.example` documenta las variables requeridas
- No exponer `NEXT_PUBLIC_` a datos sensibles (solo `WP_URL` y `GA_ID`)
- Validar inputs del webhook WordPress con `REVALIDATE_SECRET`
- Sanitizar contenido del CMS antes de renderizar
