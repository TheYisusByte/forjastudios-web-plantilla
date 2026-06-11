import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed Middleware to Proxy (same signature). next-intl's handler
// works unchanged as the default export.
export default createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
