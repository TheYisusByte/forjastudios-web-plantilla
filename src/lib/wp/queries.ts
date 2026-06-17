// GraphQL para el backend WordPress headless (doc 03 · ver wordpress/README.md).
// El esquema lo define el plugin `forja-headless` (CPTs + ACF + WPGraphQL).
// Una sola query trae todo el contenido editorial del sitio por idioma; meta y
// services siguen siendo constantes de marca locales (no son CPTs).
//
// `language` requiere Polylang + WPGraphQL Polylang. El valor es el enum
// LanguageCodeFilterEnum (EN / ES) — ver mapLocaleToLanguage en client.ts.

const MEDIA = "node { sourceUrl altText mediaDetails { width height } }";

export const SITE_CONTENT_QUERY = /* GraphQL */ `
  query SiteContent($locale: LanguageCodeFilterEnum!) {
    proyectos(
      first: 100
      where: { language: $locale, orderby: [{ field: MENU_ORDER, order: ASC }] }
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
      where: { language: $locale, orderby: [{ field: MENU_ORDER, order: ASC }] }
    ) {
      nodes {
        slug
        title
        camposIp {
          descripcion
          videoId
          enlace
          logo { ${MEDIA} }
        }
      }
    }
    miembros(
      first: 100
      where: { language: $locale, orderby: [{ field: MENU_ORDER, order: ASC }] }
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
      where: { language: $locale, orderby: [{ field: MENU_ORDER, order: ASC }] }
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
