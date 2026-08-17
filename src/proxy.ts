import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed Middleware to Proxy (same signature). next-intl's handler
// works unchanged as the default export.
export default createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next internals and files with an extension.
  //
  // `apple-icon` va aparte porque es el único archivo de metadata que Next
  // sirve SIN extensión: sin excluirlo, el proxy lo trata como una página y lo
  // redirige a /en/apple-icon —que no existe—, así que iOS se queda sin icono.
  // Los demás (robots.txt, sitemap.xml, manifest.webmanifest, icon.png,
  // llms.txt) ya caen fuera por el punto del nombre.
  matcher: "/((?!api|_next|_vercel|apple-icon|.*\\..*).*)",
};
