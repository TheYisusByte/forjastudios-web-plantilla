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
      camposProyecto { cliente clienteLogo { node { sourceUrl } } anio videoUrl destacado cover { node { sourceUrl mediaDetails { width height } } } }
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
| `proyecto` | `proyecto` / `proyectos` | `camposProyecto` | `cliente`, `clienteLogo` (imagen), `anio`, `videoUrl`, `cover` (imagen), `destacado` (bool) + `galeria` (medios adjuntos, ver abajo) + taxonomía `categorias` |
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

## Imágenes: WordPress es quien las redimensiona

El front **no** pasa las imágenes por el optimizador de Vercel: sirve
directamente los tamaños que WordPress ya genera al subir un archivo
(245w, 768w, 1024w, 1536w, 2048w…). El optimizador de Vercel tiene una cuota
mensual de transformaciones que este sitio agotaba en días —cuando eso pasa
devuelve `402` y las imágenes se ven rotas—. Ver `src/lib/wp/media.ts` y
`src/lib/image-loader.ts`.

Consecuencias en el lado de WordPress:

- **El plugin debe ser ≥ 1.5.0**, que expone `srcSet` en el campo `galeria`. Sin
  él las galerías se sirven en tamaño original (el front lo detecta y sigue
  funcionando, solo que más pesado; lo avisa por consola durante el build).
- **El plugin ≥ 1.6.0 genera los tamaños derivados en WebP** y añade anchos
  intermedios (`inc/media-optimization.php`). Es nativo de WordPress, no hace
  falta ningún plugin de terceros. **Solo aplica a subidas nuevas**: para el
  material ya cargado hay que regenerar las miniaturas.
- **El plugin ≥ 1.7.0** expone la miniatura propia de cada vídeo de galería y
  las dimensiones reales de los vídeos (ver "Miniatura de los vídeos de
  galería"). Con uno anterior el front sigue funcionando: saca el fotograma del
  propio vídeo y asume 16:9.
- **El plugin ≥ 1.8.0** añade el campo `clienteLogo` a los proyectos (ver "Logo
  del cliente en la página interna").

### Logo del cliente en la página interna

Bajo la portada de cada proyecto va la firma «Cliente + logo». El logo se
resuelve por este orden:

1. El campo **Logo del cliente** (`clienteLogo`) del propio proyecto.
2. El logo del CPT **Cliente** cuyo nombre aparezca en el campo `cliente` del
   proyecto. Ese campo se ha ido rellenando como una línea de créditos
   («Client © Jam City & TM DC. © WBIE (s24)»), así que la búsqueda es por
   palabra completa dentro del texto, no por igualdad.
3. Si los créditos mencionan a «Forja Studios» (trabajo propio o fan art), el
   logo del estudio.

Lo normal es **dar de alta cada cliente una vez** en Clientes, con su logo: eso
lo cubre para todos sus proyectos. El campo del proyecto queda para las
excepciones. Con el contenido de hoy, el paso 2 cubre 14 de los 38 proyectos:
al resto le falta el cliente en el CPT o hay que rellenarles `clienteLogo`.

En las páginas de IP la firma es siempre **Forja Studios** con el logo del
estudio: las IPs son material propio.

### Regenerar las miniaturas del material existente

```bash
wp media regenerate --yes          # WP-CLI, la vía recomendada
```

Sin WP-CLI: plugin **Regenerate Thumbnails** → Herramientas. Con cientos de
imágenes tarda y consume CPU; mejor lanzarlo fuera de horario. Al terminar,
guarda cualquier proyecto para disparar la revalidación del front.

### Vídeo: WordPress no lo comprime

**WordPress no transcodifica vídeo.** Lo sirve byte a byte tal como se sube, así
que aquí no hay ningún ajuste que valga: lo que se suba es lo que se descarga el
visitante.

Estado actual de la biblioteca (medido el 2026-08-07): **86 vídeos, 3,4 GB**,
con una media de 39,8 MB por archivo y picos de 235 MB. Son masters, no
versiones web.

Antes de subir un vídeo:

- Exportar a **H.264, máximo 1080p, 2-4 Mbps** → un clip de 30 s pesa ~10 MB.
- Activar **fast start** (el índice al principio) para que empiece a reproducir
  sin descargar el archivo entero.
- Quitar la pista de audio si el vídeo va a ir muteado (fondos, loops).
- Subir **solo la versión web**; los masters no van en la biblioteca de medios.

Para material largo o mucho catálogo, lo correcto es una plataforma de streaming
(Cloudflare Stream, Mux, Bunny): entregan calidad adaptativa según la conexión,
que es algo que un archivo suelto en WordPress no puede hacer.

#### Miniatura de los vídeos de galería

WordPress no saca un fotograma de los vídeos que se suben (no lleva ffmpeg), así
que la galería de un proyecto enseñaba su portada como miniatura de todos sus
vídeos. Desde el plugin **1.7.0**, un adjunto de vídeo puede llevar **imagen
destacada** y el campo `galeria` la expone como `poster` (+ `posterSrcSet`, para
servirla en el tamaño que toca).

Para generar las que faltan, desde el repo del front:

```bash
python3 scripts/wp-video-posters.py --dry-run   # qué haría
python3 scripts/wp-video-posters.py             # generar y subir
```

Saca un fotograma de cada vídeo con ffmpeg —leyendo por rangos HTTP, sin
descargarlo entero—, lo sube y lo asigna como imagen destacada del vídeo. Es
idempotente: repite solo lo que falte. Necesita `WORDPRESS_USER` y
`WORDPRESS_KEY` (contraseña de aplicación) en `.env.local`.

No usa el fotograma 0 pelado: los clips arrancan en negro, en blanco o con una
cartela, así que elige el **más representativo de los primeros ~10 s** (filtro
`thumbnail` de ffmpeg) y, si sale liso, busca más adelante. Con `--first-frame`
se fuerza el fotograma 0.

También se puede poner a mano: **Medios → (el vídeo) → Editar → Imagen
destacada**. O subir a la mediateca una imagen llamada igual que el vídeo con el
sufijo `-poster` (p. ej. `mi-video-poster.jpg`), que el plugin encuentra sola.

Sin ninguna de las dos, el front tira del propio vídeo para pintar el fotograma,
que funciona pero descarga ~1-2 MB por miniatura en vez de ~80 KB.

#### Los dos vídeos de portada

Estaban en Vercel Blob, cuya capa gratuita corta el servicio al pasar la cuota
de datos (los vídeos desaparecían del sitio a mitad de mes). Desde 2026-08-17
salen de WordPress, igual que el resto del material:

| Uso | Archivo | Peso |
|---|---|---|
| Fondo del hero | `2026/08/animation-loop-web.mp4` | 5,9 MB (1920×1080, sin audio) |
| Showreel | `2026/08/REEL-FORJA-STUDIOS-ANIMACION-2023.mp4` | 23 MB (1280×720, 1:41) |

El fondo del hero es la versión web del máster de 2560×1440 y 20,5 MB
(`2026/07/animation-loop.webm`, subido por FTP): a 1080p y CRF 30 pesa un 71 %
menos y la diferencia no se ve detrás del overlay oscuro y el canvas de humo.
Comando usado:

```bash
ffmpeg -i master.webm -an -vf scale=1920:-2 \
  -c:v libx264 -crf 30 -preset slow -profile:v high \
  -pix_fmt yuv420p -movflags +faststart animation-loop-web.mp4
```

Las URLs viven en un único sitio del front: `src/lib/wp/videos.ts`. Si se
resuben, basta con cambiarlas ahí.

**Sube siempre por la mediateca, no por FTP.** LiteSpeed no conoce la extensión
`.webm` y la sirve con `Content-Type: text/plain`: Chrome la reproduce igual
(hace sniffing) pero Firefox y Safari son estrictos y se quedan en negro. Si
hiciera falta servir `.webm`, añadir al `.htaccess` de la raíz de WordPress:

```apache
AddType video/webm .webm

# Los uploads no cambian: caché larga en el navegador (WP no la envía de serie).
<IfModule mod_headers.c>
  <FilesMatch "\.(mp4|webm|mov|jpg|jpeg|png|webp|avif)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
```

## Ver los cambios en la web sin hacer deploy (revalidación)

El front cachea las respuestas de WPGraphQL con el tag `site-content`
(`src/lib/wp/fetcher.ts`). `inc/revalidate.php` avisa a Vercel cuando cambia el
contenido y el sitio se regenera solo — **sin redeploy**.

**Configuración (una sola vez):**

1. Genera un secreto: `openssl rand -hex 32`.
2. **Vercel** → proyecto `forjastudios-web` → Settings → Environment Variables →
   `REVALIDATE_SECRET` = ese valor (entorno *Production*). Requiere un redeploy
   para que la función lo lea.
3. **WordPress** → Ajustes → **Forja Headless**:
   - *URL de revalidación:* `https://www.forjastudios.com/api/revalidate`
   - *Secreto:* el mismo valor
   - Pulsa **Probar ahora** → debe responder «Front revalidado».

Alternativa a la pantalla de ajustes (tiene prioridad), en `wp-config.php`:

```php
define('FORJA_REVALIDATE_URL',    'https://www.forjastudios.com/api/revalidate');
define('FORJA_REVALIDATE_SECRET', '…');
```

**Qué dispara el aviso:** guardar/publicar/enviar a papelera/borrar un
`proyecto`, `ip`, `miembro` o `cliente`; subir, editar o borrar adjuntos
(imágenes y videos); y crear/editar/borrar términos de `categoria`. Todos los
cambios de una misma petición se agrupan en un solo aviso, que se envía sin
esperar respuesta para no ralentizar el guardado.

**Cuándo se ve el cambio:** el aviso marca el contenido como caducado; la
página se regenera en la **siguiente visita** (la primera visita tras el cambio
puede tardar un segundo de más). Si el webhook no llega, `WP_REVALIDATE_SECONDS`
(por defecto 300 s) refresca igualmente.

**Diagnóstico:** Ajustes → Forja Headless muestra el resultado del último aviso.
Un `HTTP 401` significa que el secreto de WP y el de Vercel no coinciden.

## Redirección headless del front

`inc/headless-redirect.php` envía las visitas al **front de WordPress**
(`https://api.forjastudios.com/...`) hacia el sitio público
(`https://forjastudios.com`), para no exponer el theme crudo. **No** afecta a la
API ni al desarrollo:

- **Exento:** `/graphql`, `/wp-json` (REST), `/wp-admin`, login/registro, cron,
  WP-CLI y `/wp-content/` (medios). También los **editores logueados** (pueden
  previsualizar el front).
- **Exención local:** no redirige en `localhost`, `127.0.0.1`, `*.local`,
  `*.test` ni cuando `wp_get_environment_type()` es `local`/`development`. Así el
  front en `localhost:3000` sigue leyendo `/graphql` sin tropiezos.
- **Personalizar destino:** `define('FORJA_HEADLESS_FRONT_URL', 'https://...')`
  en `wp-config.php`, o el filtro `forja_headless_front_url`. Por defecto redirige
  a la **home** (las rutas del front llevan prefijo de idioma y no mapean 1:1);
  para mapear ruta a ruta usa el filtro `forja_headless_redirect_location($url, $req)`.
- **Desactivar:** `define('FORJA_HEADLESS_DISABLE_REDIRECT', true);` o
  `add_filter('forja_headless_redirect_enabled', '__return_false');`.
- Por defecto es **302** (reversible); cambia a 301 con el filtro
  `forja_headless_redirect_status` solo si mapeas las rutas 1:1.

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
