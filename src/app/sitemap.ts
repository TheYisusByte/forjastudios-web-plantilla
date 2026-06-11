import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const base = "https://forjastudios.com";
const paths = ["", "/concepto-a", "/concepto-b", "/concepto-c", "/concepto-d"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      // hreflang alternates for each localized variant.
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}/${l}${path}`]),
        ),
      },
    })),
  );
}
