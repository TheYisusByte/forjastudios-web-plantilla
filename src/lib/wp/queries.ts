// GraphQL queries for the future WordPress headless backend (doc 03).
// Kept here so the CMS integration is a drop-in once cms.forjastudios.com is up.
// Not used yet — lib/wp/client.ts currently returns typed mock data.

export const FEATURED_PROJECTS = /* GraphQL */ `
  query FeaturedProjects($locale: LanguageCodeFilterEnum!) {
    proyectos(
      first: 8
      where: {
        language: $locale
        metaQuery: { metaArray: [{ key: "destacado", value: "1" }] }
      }
    ) {
      nodes {
        title
        camposProyecto {
          cliente
          anio
          videoUrl
          cover { node { sourceUrl altText } }
        }
        categorias { nodes { name } }
      }
    }
  }
`;

export const IPS = /* GraphQL */ `
  query Ips($locale: LanguageCodeFilterEnum!) {
    ips(first: 12, where: { language: $locale }) {
      nodes {
        title
        camposIp { descripcion enlace logo { node { sourceUrl altText } } }
      }
    }
  }
`;

export const TEAM = /* GraphQL */ `
  query Team($locale: LanguageCodeFilterEnum!) {
    miembros(first: 100, where: { language: $locale }) {
      nodes {
        title
        camposMiembro { rol foto { node { sourceUrl altText } } redes }
      }
    }
  }
`;
