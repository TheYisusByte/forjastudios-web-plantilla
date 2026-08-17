import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { IntroOverlay } from "@/components/ui/IntroOverlay";
import { fontVariables } from "@/lib/fonts";
import { getSiteContent } from "@/lib/wp/client";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_NAME,
  SITE_URL,
  alternates,
  openGraphBase,
  organizationJsonLd,
  twitterBase,
  websiteJsonLd,
} from "@/lib/seo";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// El color de la barra del navegador en móvil. Va en `viewport`, no en
// `metadata`: Next movió ahí `themeColor` y desde el otro export lo ignora.
export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  // Estrecha `string` a Locale (`params` no lo sabe) y, de paso, corta aquí un
  // idioma inventado en la URL en vez de generar metadata para una 404.
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s · ${SITE_NAME}` },
    description: t("description"),
    applicationName: SITE_NAME,
    // Canonical/hreflang de referencia para todo el árbol. Cada página lo
    // sobrescribe con su propia ruta; sin esto, las subrutas se quedarían sin
    // canonical y las dos versiones de idioma competirían en el índice.
    alternates: alternates(locale),
    openGraph: {
      ...openGraphBase(locale),
      type: "website",
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    twitter: {
      ...twitterBase(locale),
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        // Sin estos límites Google recorta la miniatura y el fragmento de
        // texto. Es lo que habilita la imagen grande en resultados y, de paso,
        // da a los motores de respuesta más texto que citar.
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    // El sitio no es una app de teléfono: sin esto, Safari en iOS convierte en
    // enlaces `tel:` cualquier cifra que se le parezca (años, estadísticas).
    formatDetection: { telephone: false, email: false, address: false },
  };
}

// Decide si el intro de marca se salta, ANTES del primer paint. Tiene que ser
// un script inline y bloqueante: React llega demasiado tarde y se vería el
// overlay un instante a quien pidió menos animación. Solo marca el <html>; el
// resto lo hacen globals.css y IntroOverlay. Ver src/components/ui/IntroOverlay.tsx.
//
// El intro se ve en CADA carga de página —la primera, cada recarga y cada
// entrada directa a una interna—, así que aquí no hay más condición que
// `prefers-reduced-motion`.
const introSkipScript = `try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)
document.documentElement.dataset.intro='skip'
}catch(e){document.documentElement.dataset.intro='skip'}`;

// Google Analytics 4. El ID de medición no es secreto (viaja en el HTML), así
// que va con valor por defecto y se puede sobrescribir por entorno. Solo se
// carga en producción: así el tráfico de `npm run dev` no ensucia las métricas
// (para probarlo en local: `npm run build && npm run start`).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-NDG41Y77ZH";
const analyticsEnabled = process.env.NODE_ENV === "production" && GA_ID !== "";

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  // Datos estructurados de sitio y empresa (doc 09 — SEO). Se emiten una sola
  // vez, aquí, y las páginas se cuelgan de ellos por `@id`. El contenido sale
  // de la misma fuente que la web, así que no se desincronizan.
  const content = await getSiteContent(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introSkipScript }} />
      </head>
      <body className="min-h-dvh">
        <JsonLd data={organizationJsonLd(content, locale)} />
        <JsonLd data={websiteJsonLd()} />
        <NextIntlClientProvider>
          {/* Intro de marca: va en el layout para que tape también las páginas
              internas cuando se entra directo a ellas o se recarga. */}
          <IntroOverlay />
          {children}
        </NextIntlClientProvider>
      </body>
      {analyticsEnabled && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
