# WordPress headless — Forja Studios

Configuración del backend WordPress (CPTs + ACF + WPGraphQL) que alimenta el
front Next.js de este repo. Todo está en el plugin **`forja-headless/`**: define
los Custom Post Types, sus campos y los expone en la API GraphQL.

> Entorno actual: **multisite**, sitio `/forja/` (**ID 4**) en
> `https://powderblue-gazelle-820281.hostingersite.com/forja/wp-admin/`.

---

## 1. Plugins a instalar (en el sitio `/forja/`)

Activa estos plugins **en el sitio /forja/** (Plugins → Añadir nuevo):

| Plugin | Para qué | Obligatorio |
|---|---|---|
| **WPGraphQL** | Expone el esquema GraphQL en `/forja/graphql` | ✅ |
| **Advanced Custom Fields** (free) | Campos personalizados (los usados son free) | ✅ |
| **WPGraphQL for ACF** (v2+) | Publica los campos ACF dentro de GraphQL | ✅ |
| **Polylang** + **WPGraphQL Polylang** | i18n ES/EN (filtro `where: { language }`) | Para bilingüe |

> En multisite puedes activarlos solo en el sitio /forja/ o en red. Si solo
> Forja usará estos CPT, actívalos en el sitio para no contaminar los demás.

## 2. Instalar el plugin `forja-headless`

**Opción A — plugin normal (recomendada):**
1. Sube la carpeta `forja-headless/` a `wp-content/plugins/`.
2. Actívalo en `…/forja/wp-admin/plugins.php`.

**Opción B — must-use (carga automática):**
1. Copia `forja-headless/` a `wp-content/mu-plugins/`.
2. Crea `wp-content/mu-plugins/forja-headless-loader.php`:
   ```php
   <?php require __DIR__ . '/forja-headless/forja-headless.php';
   ```

**Opción C — functions.php:** pega el contenido de los archivos de `inc/` en el
`functions.php` del theme activo (menos recomendable; se pierde al cambiar theme).

Al activar verás en el admin: **Proyectos, IPs, Equipo, Clientes** y la
taxonomía **Categorías** (con sus términos ya sembrados).

## 3. Verificar en GraphQL

Abre el **GraphiQL IDE** (menú GraphQL en el admin) y prueba:

```graphql
query Smoke {
  proyectos(first: 5) {
    nodes {
      title
      camposProyecto { cliente anio videoUrl destacado cover { node { sourceUrl mediaDetails { width height } } } }
      galeria { sourceUrl mimeType width height poster }
      categorias { nodes { name slug } }
    }
  }
  ips(first: 5)     { nodes { title camposIp { descripcion videoId enlace } } }
  miembros(first: 5){ nodes { title camposMiembro { rol redes } } }
  clientes(first: 5){ nodes { title camposCliente { sitioWeb } } }
}
```

Endpoint para el front: `https://<dominio>/forja/graphql`

---

## Modelo de contenido (alineado con el front)

Los nombres GraphQL están calcados de `src/lib/wp/queries.ts` y
`src/lib/content/types.ts`. **No renombrar sin actualizar el front.**

| CPT | GraphQL (singular / plural) | Grupo ACF | Campos |
|---|---|---|---|
| `proyecto` | `proyecto` / `proyectos` | `camposProyecto` | `cliente`, `anio`, `videoUrl`, `cover` (imagen), `destacado` (bool) + `galeria` (medios adjuntos, ver abajo) + taxonomía `categorias` |
| `ip` | `ip` / `ips` | `camposIp` | `descripcion`, `videoId` (YouTube ID, fondo IPs), `enlace`, `logo` (imagen) |
| `miembro` | `miembro` / `miembros` | `camposMiembro` | `rol`, `foto` (imagen), `redes` (textarea, 1 URL/línea) |
| `cliente` | `cliente` / `clientes` | `camposCliente` | `sitioWeb`, `logo` (imagen) — uso futuro |

| Taxonomía | GraphQL | Términos sembrados (slug) |
|---|---|---|
| `categoria` (en `proyecto`) | `categoria` / `categorias` | `animation-2d`, `animation-3d`, `vfx`, `concept-art`, `game`, `illustration` |

Los slugs de categoría coinciden con el enum `ProjectCategory` del front, así el
mapeo CMS → app es directo.

## Conectar el front

Cuando GraphQL responda, el **único** archivo a tocar en el repo es
`src/lib/wp/client.ts` (`getSiteContent`): cambia el mock por un `fetch` a las
queries de `src/lib/wp/queries.ts` y mapea la respuesta a `SiteContent`. La
forma de los datos es idéntica, así que ningún componente cambia. Variables de
entorno: `WP_GRAPHQL_URL` (= `https://<dominio>/forja/graphql`), `NEXT_PUBLIC_WP_URL`.

## Notas

- **`metaQuery` / `destacado`:** si tu versión de WPGraphQL no soporta `metaQuery`
  en los `where`, hay un filtro alternativo listo (comentado) en `inc/graphql.php`
  que añade `where: { destacado: true }`.
- **Imágenes ACF:** se devuelven como conexión a `MediaItem`
  (`cover { node { sourceUrl altText mediaDetails { width height } } }`), por eso el
  campo usa `return_format: array`. Se piden `mediaDetails` para conservar el aspecto
  (cover/imágenes) sin layout shift en el masonry del front.
- **Galería de proyecto (`galeria`):** la página interna muestra una galería masonry
  (imágenes + videos). Como el campo Gallery de ACF es PRO, se exponen los archivos
  **adjuntos al proyecto** vía el campo GraphQL `galeria` (registrado en `inc/graphql.php`),
  con `width/height` (imágenes) y `poster` (videos). En el editor: sube/adjunta imágenes
  y `.mp4` al proyecto y ordénalos con el "orden" del adjunto. Si un proyecto no tiene
  adjuntos, el front usa una galería de fallback (cover + otras portadas + reel).
- **IPs `videoId`:** fondo de la sección IPs (concepto E). Es el **ID** de YouTube
  (no la URL). Si falta, el front cae al `videoId` de `data.json` por slug.
- **i18n:** marca los 4 CPT como traducibles en Polylang (el plugin ya lo fuerza
  vía `pll_get_post_types`).
