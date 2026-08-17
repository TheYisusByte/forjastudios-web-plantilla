import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { meta as siteMeta } from "@/lib/content/data";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: new URL("https://forjastudios.com"),
    title: { default: "Forja Studios", template: "%s · Forja Studios" },
    description: t("description"),
    openGraph: {
      siteName: "Forja Studios",
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
      locale,
    },
  };
}

// Decide si el intro de marca se salta, ANTES del primer paint. Tiene que ser
// un script inline y bloqueante: React llega demasiado tarde y se vería el
// overlay un instante a quien ya lo vio (o al revés). Solo marca el <html>; el
// resto lo hacen globals.css y IntroOverlay. Ver src/components/ui/IntroOverlay.tsx.
const introSkipScript = `try{
if(sessionStorage.getItem('forja:intro')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches)
document.documentElement.dataset.intro='skip'
}catch(e){document.documentElement.dataset.intro='skip'}`;

// Google Analytics 4. El ID de medición no es secreto (viaja en el HTML), así
// que va con valor por defecto y se puede sobrescribir por entorno. Solo se
// carga en producción: así el tráfico de `npm run dev` no ensucia las métricas
// (para probarlo en local: `npm run build && npm run start`).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-NDG41Y77ZH";
const analyticsEnabled = process.env.NODE_ENV === "production" && GA_ID !== "";

// Organization structured data (doc 09 — SEO).
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Forja Studios",
  url: "https://forjastudios.com",
  slogan: "Forge your flame",
  email: siteMeta.contact.email,
  sameAs: siteMeta.socials.map((s) => s.href),
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introSkipScript }} />
      </head>
      <body className="min-h-dvh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
      {analyticsEnabled && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
