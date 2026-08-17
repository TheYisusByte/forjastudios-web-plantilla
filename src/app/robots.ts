import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /sandbox alberga pruebas de conceptos/componentes y /documentacion es la doc
// interna de handover — ambas fuera del índice. Las rutas llevan prefijo de
// locale (/es/sandbox, /en/documentacion, …). Las páginas además mandan
// `noindex` por cabecera: robots.txt evita el rastreo, pero por sí solo no
// impide que una URL enlazada desde fuera acabe apareciendo en resultados.
const privatePaths = ["/sandbox", "/documentacion"].flatMap((path) => [
  path,
  `/en${path}`,
  `/es${path}`,
]);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      // Los rastreadores de los motores de respuesta (ChatGPT, Perplexity,
      // Claude, AI Overviews) se listan aparte a propósito: así el permiso es
      // explícito y se ve de un vistazo a quién se le abre la puerta. Que
      // puedan leer el sitio es la condición para que lo citen.
      //
      // Para dejar de alimentar el ENTRENAMIENTO de los modelos sin perder las
      // citas, basta con mover a `disallow` los tres primeros —GPTBot,
      // ClaudeBot y CCBot—: el resto son los que consultan en tiempo real.
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "CCBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "Perplexity-User",
          "Claude-SearchBot",
          "Claude-User",
          "Google-Extended",
          "Applebot-Extended",
          "meta-externalagent",
        ],
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
