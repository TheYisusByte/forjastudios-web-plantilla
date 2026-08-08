// GraphQL para el backend WordPress headless (doc 03 · ver wordpress/README.md).
// El esquema lo define el plugin `forja-headless` (CPTs + ACF + WPGraphQL).
// Una sola query trae todo el contenido editorial del sitio por idioma; meta y
// services siguen siendo constantes de marca locales (no son CPTs).
//
// Dos partes de la query dependen de plugins/versiones que pueden no estar en
// el backend, y pedirlas cuando no existen hace fallar TODA la query. Por eso
// `siteContentQuery` recibe qué capacidades incluir y el cliente reintenta sin
// la que falle (ver `fetchSiteContent` en client.ts):
//
//  · `language` — requiere Polylang + WPGraphQL Polylang. El valor de $locale es
//    el enum LanguageCodeFilterEnum (EN / ES) — ver localeToLanguage en client.ts.
//  · `srcSet` en `galeria` — requiere el plugin forja-headless ≥ la versión que
//    añade ese campo (ver wordpress/forja-headless/inc/graphql.php). Sin él las
//    imágenes de galería se sirven en su tamaño original.

/** Capacidades opcionales del backend que la query puede incluir. */
export interface WpCapabilities {
  /** Filtrar por idioma (Polylang). */
  language: boolean;
  /** Campo `srcSet` en los items de `galeria` (plugin forja-headless). */
  galeriaSrcSet: boolean;
}

export const ALL_CAPABILITIES: WpCapabilities = { language: true, galeriaSrcSet: true };

// `srcSet` trae las variantes que WordPress ya generó (245w, 768w, 1024w…) y que
// el front sirve directamente en lugar de pasarlas por el optimizador de Vercel
// (ver src/lib/wp/media.ts). WP solo lista ahí las que conservan el aspecto.
const MEDIA = "node { sourceUrl srcSet altText mediaDetails { width height } }";

/**
 * Construye la query de contenido del sitio.
 * @param caps capacidades del backend que se pueden incluir sin romper la query.
 */
export function siteContentQuery(caps: WpCapabilities): string {
  // Declaración de variable y filtro condicionados a Polylang.
  const localeVar = caps.language ? "($locale: LanguageCodeFilterEnum!)" : "";
  const langFilter = caps.language ? "language: $locale, " : "";
  const galeria = `galeria { sourceUrl mimeType width height poster${
    caps.galeriaSrcSet ? " srcSet" : ""
  } }`;

  return /* GraphQL */ `
    query SiteContent${localeVar} {
      proyectos(
        first: 100
        where: { ${langFilter}orderby: [{ field: MENU_ORDER, order: ASC }] }
      ) {
        nodes {
          slug
          title
          excerpt
          camposProyecto {
            cliente
            anio
            videoUrl
            destacado
            cover { ${MEDIA} }
          }
          # Galería de la página interna: medios ADJUNTOS al proyecto (imágenes y
          # videos con dimensiones reales). Campo custom (ver wordpress graphql.php).
          ${galeria}
          categorias { nodes { name slug } }
        }
      }
      ips(
        first: 50
        where: { ${langFilter}orderby: [{ field: MENU_ORDER, order: ASC }] }
      ) {
        nodes {
          slug
          title
          camposIp {
            cover { ${MEDIA} }
            descripcion
            videoId
            enlace
            logo { ${MEDIA} }
          }
          # Galería de la IP: medios ADJUNTOS (imágenes y videos), igual que proyectos.
          ${galeria}
        }
      }
      miembros(
        first: 100
        where: { ${langFilter}orderby: [{ field: MENU_ORDER, order: ASC }] }
      ) {
        nodes {
          title
          camposMiembro {
            rol
            redes
            foto { ${MEDIA} }
          }
        }
      }
      clientes(
        first: 100
        where: { ${langFilter}orderby: [{ field: MENU_ORDER, order: ASC }] }
      ) {
        nodes {
          title
          camposCliente {
            sitioWeb
            logo { ${MEDIA} }
          }
        }
      }
    }
  `;
}
