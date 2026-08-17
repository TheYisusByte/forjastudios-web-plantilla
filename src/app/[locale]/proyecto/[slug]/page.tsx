import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/wp/client";
import { routing, type Locale } from "@/i18n/routing";
import { NavE } from "@/components/sections/e/NavE";
import { ProjectDetailGalleryE } from "@/components/sections/e/ProjectDetailGalleryE";
import { ContactForgeMeter } from "@/components/sections/e/contact/ForgeMeter";
import { FooterE } from "@/components/sections/e/FooterE";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const content = await getSiteContent(locale);
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const t = await getTranslations("Common");

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <NavE />
      <ProjectDetailGalleryE project={project} clientLabel={t("client")} />
      <ContactForgeMeter content={content} />
      <FooterE />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = await getSiteContent(locale);
  const project = content.projects.find((p) => p.slug === slug);
  return { title: project ? `${project.title} · Forja Studios` : "Forja Studios" };
}

export async function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of routing.locales) {
    const content = await getSiteContent(locale);
    for (const p of content.projects) params.push({ locale, slug: p.slug });
  }
  return params;
}
