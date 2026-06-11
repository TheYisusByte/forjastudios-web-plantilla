import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { meta as siteMeta } from "@/lib/content/data";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://forjastudios.com"),
  title: { default: "Forja Studios", template: "%s · Forja Studios" },
  description:
    "Forge your flame — estudio creativo: animación, concept art, VFX y videojuegos.",
  openGraph: {
    siteName: "Forja Studios",
    title: "Forja Studios — Forge your flame",
    description:
      "Estudio creativo: animación 2D/3D, concept art, VFX y videojuegos.",
    type: "website",
  },
};

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
      <body className="min-h-dvh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
