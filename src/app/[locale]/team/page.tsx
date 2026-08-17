import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getSiteContent } from "@/lib/wp/client";
import type { Locale } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  alternates,
  breadcrumbJsonLd,
  openGraphBase,
  teamJsonLd,
  twitterBase,
} from "@/lib/seo";
import { NavE } from "@/components/sections/e/NavE";
// import { CursorE } from "@/components/sections/e/CursorE";
import { TeamE } from "@/components/sections/e/TeamE";
import { FooterE } from "@/components/sections/e/FooterE";
import { FORJA_LOGO } from "@/lib/brand";

/**
 * Alineación óptica del titular.
 * ---------------------------------------------------------------------------
 * Las dos líneas arrancan en el mismo borde de caja, pero el ojo ve un escalón:
 * cada glifo trae su propio hueco lateral (side bearing) y el de una mayúscula
 * grande —la «E» de EQUIPO a 14rem— es mucho mayor que el de una minúscula
 * pequeña. Aquí se le resta a cada línea su hueco, así ambas quedan a ras del
 * contenedor y, por tanto, alineadas entre sí.
 *
 * Los valores son el hueco medido sobre Garet 900 y van en `em` para que
 * escalen con el `clamp()` del tamaño. Si cambia el texto de estos titulares
 * hay que volver a medirlos, en la consola del navegador:
 *
 *   const ctx = document.createElement("canvas").getContext("2d");
 *   ctx.font = `900 100px ${getComputedStyle(document.querySelector("h1 span")).fontFamily}`;
 *   -ctx.measureText("EQUIPO").actualBoundingBoxLeft / 100;   // → em
 */
const OPTICAL_INDENT: Record<string, { top: string; main: string }> = {
  es: { top: "-0.057em", main: "-0.063em" }, // «nuestro» / «EQUIPO»
  en: { top: "-0.024em", main: "-0.027em" }, // «our» / «TEAM»
};

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ConceptoETeamPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);
  const t = await getTranslations("TeamPage");
  const tMeta = await getTranslations("Meta");
  const indent = OPTICAL_INDENT[locale] ?? { top: "0", main: "0" };

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <JsonLd data={teamJsonLd(content, locale)} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tMeta("homeBreadcrumb"), path: "" },
          { name: tMeta("teamTitle"), path: "/team" },
        ])}
      />
      {/* <CursorE /> */}
      <NavE />

      {/* Page header */}
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-44">
        <h1 className="font-display font-black leading-[0.88] tracking-tight">
          <span
            className="block text-forja-bone"
            style={{
              fontSize: "clamp(3.2rem, 7vw, 6rem)",
              letterSpacing: "-0.02em",
              textIndent: indent.top,
            }}
          >
            {t("headingTop")}
          </span>
          <span
            className="flame-text block"
            style={{
              fontSize: "clamp(7rem, 18vw, 14rem)",
              letterSpacing: "-0.03em",
              textIndent: indent.main,
            }}
          >
            {t("headingMain")}
          </span>
        </h1>

        <div className="mt-8 flex items-start gap-4">
          <Image
            src={FORJA_LOGO}
            alt="Forja Studios"
            width={420}
            height={155}
            style={{ height: "2.5rem", width: "auto" }}
            className="shrink-0 object-contain"
          />
          <div className="h-8 w-px self-center bg-border/60" />
          <p className="max-w-md text-sm leading-relaxed text-forja-muted">
            {t("intro")}
          </p>
        </div>
      </div>

      <TeamE team={content.team} />

      <FooterE />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: t("teamTitle"),
    description: t("teamDescription"),
    alternates: alternates(locale, "/team"),
    openGraph: {
      ...openGraphBase(locale, "/team"),
      type: "profile",
      // En la tarjeta social no hay migas ni contexto: «Equipo» a secas no
      // dice de quién. El <title> de la pestaña sí puede ser corto.
      title: t("teamOgTitle"),
      description: t("teamDescription"),
    },
    twitter: {
      ...twitterBase(locale),
      // En la tarjeta social no hay migas ni contexto: «Equipo» a secas no
      // dice de quién. El <title> de la pestaña sí puede ser corto.
      title: t("teamOgTitle"),
      description: t("teamDescription"),
    },
  };
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
