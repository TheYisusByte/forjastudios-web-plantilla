import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // Always prefix the locale so /es and /en are explicit (better for hreflang/SEO).
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
