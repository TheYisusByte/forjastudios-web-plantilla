<div align="center">

# forjastudios-web-plantilla

**Web corporativa de alta gama con CMS headless bilingüe (ES/EN).**

[![Estado](https://img.shields.io/badge/estado-activo-success.svg)]()
[![Versión](https://img.shields.io/badge/versi%C3%B3n-0.1.0-blue.svg)]()
[![Stack](https://img.shields.io/badge/stack-Next.js+16+%2B+React+19+%2B+WordPress-informational.svg)]()

</div>

---

## Descripción General

Sitio corporativo y portafolio de Forja Studios, diseñado como plantilla reutilizable. Consume contenido desde WordPress headless vía WPGraphQL (con fallback automático a un mock bilingüe tipado) y sirve una experiencia altamente animada con internacionalización completa en español e inglés.

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js 16 (App Router) | Framework full-stack: SSR/ISR, rutas API y metadatos SEO |
| React 19 | Librería de interfaz |
| TypeScript 5 | Tipado estático end-to-end |
| Tailwind CSS 4 | Estilos utilitarios |
| next-intl | Internacionalización ES/EN con prefijo de locale explícito |
| WPGraphQL + plugin `forja-headless` | CMS headless: proyectos, IPs, equipo y clientes |
| GSAP / Framer Motion | Animaciones y transiciones |
| Three.js | Gráficos WebGL y texturas en la sección de IPs |
| Python + ffmpeg | Script de mantenimiento: pósters de videos de la mediateca |

## Guía de Inicio Rápido

Requisitos previos: Node.js 20+, pnpm. Opcional para el script de pósters: Python 3 y `ffmpeg` en el PATH.

```bash
git clone <url-del-repositorio>
cd forjastudios-web-plantilla
pnpm install
cp .env.example .env.local
pnpm dev
```

Sin `WP_GRAPHQL_URL` definido, el sitio arranca con el mock bilingüe tipado (`src/lib/content/data.ts`). Para conectar el CMS, define el endpoint GraphQL y revisa la instalación del plugin en `wordpress/`.

## Arquitectura y Componentes

```
forjastudios-web-plantilla/
├── src/
│   ├── app/
│   │   ├── [locale]/            → Rutas bilingües: home, proyecto/[slug], ip, team, documentacion, sandbox
│   │   ├── api/revalidate/      → Webhook de invalidación de caché disparado por WordPress
│   │   └── llms.txt/            → Endpoint de texto descriptivo del sitio
│   ├── components/
│   │   ├── sections/            → Secciones de página (hero, clientes, proyectos, IPs, contacto…)
│   │   ├── motion/              → Componentes de animación
│   │   ├── seo/                 → Metadatos y SEO
│   │   └── ui/                  → Primitivas de interfaz
│   ├── i18n/                    → Configuración de next-intl (routing, request, navigation)
│   ├── lib/
│   │   ├── wp/                  → Cliente WPGraphQL, queries, mapeo de medios y variantes de imagen
│   │   ├── content/             → Mock bilingüe tipado (fallback sin CMS)
│   │   └── image-loader.ts      → Loader propio que sirve los tamaños ya generados por WordPress
│   └── messages/                → Catálogos de traducción (es.json, en.json)
├── wordpress/
│   └── forja-headless/          → Plugin propio v1.8.0: CPTs, taxonomías, campos ACF y exposición GraphQL
├── scripts/
│   └── wp-video-posters.py      → Extrae el primer fotograma de cada video y lo adjunta como póster
├── public/assets/               → Recursos estáticos
└── next.config.ts               → Proxy /wp-media, loader de imágenes personalizado y plugin next-intl
```

## Scripts Disponibles / Automatización

| Comando | Acción |
|---------|--------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | Lint con ESLint |

Script de mantenimiento de la mediateca (idempotente, salta videos que ya tienen póster):

```bash
python3 scripts/wp-video-posters.py --dry-run   # solo indica qué haría
python3 scripts/wp-video-posters.py --limit 5   # procesa los 5 primeros
python3 scripts/wp-video-posters.py --force     # regenera los existentes
```

## Variables de Entorno / Secrets

| Variable | Descripción |
|----------|-------------|
| `WP_GRAPHQL_URL` | Endpoint GraphQL de WordPress; si falta, se usa el mock local |
| `NEXT_PUBLIC_WP_URL` | Base pública de WordPress para imágenes y preview |
| `WP_PREVIEW_SECRET` | Secreto compartido para previsualizar borradores desde WP |
| `WORDPRESS_USER` | Usuario de la REST API (solo para scripts de mantenimiento) |
| `WORDPRESS_KEY` | Contraseña de aplicación de WordPress (no la contraseña de la cuenta) |
| `REVALIDATE_SECRET` | Secreto del webhook WP → revalidación; mismo valor en Vercel y WordPress |
| `WP_REVALIDATE_SECONDS` | Red de seguridad del ISR en segundos (por defecto 300) |
| `RESEND_API_KEY` | Envío del formulario de contacto vía Server Action (integración pendiente) |
| `NEXT_PUBLIC_GA_ID` | ID de medición de Google Analytics 4 (opcional, solo fuera de producción) |

## Convenciones y Seguridad

- Commits: Conventional Commits en español (`feat:`, `fix:`, `refactor:`, `chore:`).
- Secretos: nunca hardcodear tokens ni credenciales; usar `.env.local` (fuera de Git) y secrets de la plataforma de despliegue.
- La clave de WordPress es siempre una «Contraseña de aplicación» con permisos mínimos.
- Entradas externas (contenido GraphQL, excerpts HTML) se sanea antes de renderizar.

## Notas Técnicas y Límites

- Resiliencia ante fallos del CMS: si WPGraphQL falla o falta una capacidad opcional (Polylang, `srcSet`, logo de cliente), el cliente reintenta degradando capacidades y, en último caso, cae al mock sin tumbar el build.
- El optimizador de imágenes de Vercel se sustituye por un loader propio que sirve los tamaños que WordPress ya generó, evitando consumir cuota de transformaciones.
- Las texturas WebGL de la sección de IPs se sirven mediante el rewrite same-origin `/wp-media/:path*` porque WordPress no emite cabeceras CORS.
- El envío real del formulario de contacto está simulado; la integración con Resend figura como pendiente en el código.
- El plugin `forja-headless` requiere WordPress 6.4+, PHP 8.0+, WPGraphQL, ACF y WPGraphQL for ACF; Polylang es opcional para el filtrado por idioma.

## Licencia

Propietario © 2026 Jesus Adrian Anaya Sarria. Todos los derechos reservados.
