import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/wp/client";
import { routing, type Locale } from "@/i18n/routing";
import { NavE } from "@/components/sections/e/NavE";
import { ProjectDetailGalleryE } from "@/components/sections/e/ProjectDetailGalleryE";
import { ContactForgeMeter } from "@/components/sections/e/contact/ForgeMeter";
import { FooterE } from "@/components/sections/e/FooterE";
import { JsonLd } from "@/components/seo/JsonLd";
import { clientDisplayName } from "@/lib/utils";
import {
  alternates,
  breadcrumbJsonLd,
  ogImage,
  openGraphBase,
  projectJsonLd,
  truncate,
  twitterBase,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const content = await getSiteContent(locale);
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <JsonLd data={projectJsonLd(project, locale)} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tMeta("homeBreadcrumb"), path: "" },
          { name: tMeta("projectsBreadcrumb"), path: "/#work" },
          { name: project.title, path: `/proyecto/${project.slug}` },
        ])}
      />
      <NavE />
      <ProjectDetailGalleryE project={project} />
      <ContactForgeMeter content={content} />
      <FooterE />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = await getSiteContent(locale);
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) return {};

  const t = await getTranslations({ locale, namespace: "Meta" });
  const path = `/proyecto/${project.slug}`;
  // La descripción del CMS es la buena; el patrón traducido solo cubre los
  // proyectos que aún no la traen.
  const description = project.description
    ? truncate(project.description, 160)
    : t("projectDescription", {
        title: project.title,
        category: project.categoryLabel,
        // Sin el prefijo de créditos que trae el campo de WP ("Client © X").
        client: clientDisplayName(project.client),
      });
  // La portada real del proyecto vende mucho más que la tarjeta de marca. Si
  // falta —o es demasiado pequeña para una tarjeta social—, `ogImage` devuelve
  // null y se deja la de marca que ya trae openGraphBase.
  const cover = project.coverUrl ? ogImage(project.coverUrl, project.title) : null;
  const images = cover ? [cover] : undefined;

  return {
    title: project.title,
    description,
    alternates: alternates(locale, path),
    openGraph: {
      ...openGraphBase(locale, path),
      type: "article",
      title: `${project.title} — ${project.categoryLabel}`,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      ...twitterBase(locale),
      title: `${project.title} — ${project.categoryLabel}`,
      description,
      ...(images ? { images } : {}),
    },
  };
}

export async function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of routing.locales) {
    const content = await getSiteContent(locale);
    for (const p of content.projects) params.push({ locale, slug: p.slug });
  }
  return params;
}
