// GraphQL para el backend WordPress headless (doc 03 · ver wordpress/README.md).
// El esquema lo define el plugin `forja-headless` (CPTs + ACF + WPGraphQL).
// Una sola query trae todo el contenido editorial del sitio por idioma; meta y
// services siguen siendo constantes de marca locales (no son CPTs).
//
// El filtro `language` requiere Polylang + WPGraphQL Polylang. Mientras esos
// plugins no estén activos, el argumento `language` NO existe en el esquema y la
// query falla. Por eso `siteContentQuery(withLanguage)` construye la query con o
// sin ese filtro: el cliente intenta con idioma y, si Polylang no está, reintenta
// sin él (ver client.ts). El valor de $locale es el enum LanguageCodeFilterEnum
// (EN / ES) — ver localeToLanguage en client.ts.

const MEDIA = "node { sourceUrl altText mediaDetails { width height } }";

/**
 * Construye la query de contenido del sitio.
 * @param withLanguage incluir el filtro `where: { language }` (Polylang activo).
 */
export function siteContentQuery(withLanguage: boolean): string {
  // Declaración de variable y filtro condicionados a Polylang.
  const localeVar = withLanguage ? "($locale: LanguageCodeFilterEnum!)" : "";
  const langFilter = withLanguage ? "language: $locale, " : "";

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
          galeria { sourceUrl mimeType width height poster }
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
          galeria { sourceUrl mimeType width height poster }
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
