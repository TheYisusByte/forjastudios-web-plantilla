import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/wp/client";
import { routing, type Locale } from "@/i18n/routing";
import { NavE } from "@/components/sections/e/NavE";
import { DetailGalleryE } from "@/components/sections/e/DetailGalleryE";
import { ContactForgeMeter } from "@/components/sections/e/contact/ForgeMeter";
import { FooterE } from "@/components/sections/e/FooterE";
import { FORJA_LOGO } from "@/lib/brand";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  alternates,
  breadcrumbJsonLd,
  ipJsonLd,
  ogImage,
  openGraphBase,
  truncate,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function IPDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const content = await getSiteContent(locale);
  const ip = content.ips.find((x) => x.slug === slug);
  if (!ip) notFound();

  const t = await getTranslations("ConceptE");
  const tMeta = await getTranslations("Meta");

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <JsonLd data={ipJsonLd(ip, locale)} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tMeta("homeBreadcrumb"), path: "" },
          { name: tMeta("ipsBreadcrumb"), path: "/#ips" },
          { name: ip.name, path: `/ip/${ip.slug}` },
        ])}
      />
      <NavE />
      <DetailGalleryE
        title={ip.name}
        kicker={t("ipsTag")}
        // Las IPs son del propio estudio: la firma bajo la portada es Forja.
        brand={{ name: "Forja Studios", credit: "© Forja Studios", logoUrl: FORJA_LOGO }}
        description={ip.description}
        coverUrl={ip.coverUrl}
        coverVideoUrl={ip.videoUrl}
        gallery={ip.gallery}
        backHref="/#ips"
      />
      <ContactForgeMeter content={content} />
      <FooterE />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = await getSiteContent(locale);
  const ip = content.ips.find((x) => x.slug === slug);
  if (!ip) return {};

  const t = await getTranslations({ locale, namespace: "Meta" });
  const path = `/ip/${ip.slug}`;
  const description = ip.description
    ? truncate(ip.description, 160)
    : t("ipDescription", { name: ip.name });
  const images = ip.coverUrl ? [ogImage(ip.coverUrl, ip.name)] : undefined;

  return {
    title: ip.name,
    description,
    alternates: alternates(locale, path),
    openGraph: {
      ...openGraphBase(locale, path),
      type: "article",
      title: ip.name,
      description,
      ...(images ? { images } : {}),
    },
    twitter: { title: ip.name, description, ...(images ? { images } : {}) },
  };
}

export async function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of routing.locales) {
    const content = await getSiteContent(locale);
    for (const ip of content.ips) params.push({ locale, slug: ip.slug });
  }
  return params;
}
