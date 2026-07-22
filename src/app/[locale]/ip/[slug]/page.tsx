import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/wp/client";
import { routing, type Locale } from "@/i18n/routing";
import { DetailGalleryE } from "@/components/sections/e/DetailGalleryE";

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

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <DetailGalleryE
        title={ip.name}
        kicker={t("ipsTag")}
        description={ip.description}
        coverUrl={ip.coverUrl}
        coverVideoUrl={ip.videoUrl}
        gallery={ip.gallery}
        backHref="/#ips"
      />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = await getSiteContent(locale);
  const ip = content.ips.find((x) => x.slug === slug);
  return { title: ip ? `${ip.name} · Forja Studios` : "Forja Studios" };
}

export async function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of routing.locales) {
    const content = await getSiteContent(locale);
    for (const ip of content.ips) params.push({ locale, slug: ip.slug });
  }
  return params;
}
