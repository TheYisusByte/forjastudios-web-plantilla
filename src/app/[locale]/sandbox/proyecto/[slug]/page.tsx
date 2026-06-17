import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/wp/client";
import { routing, type Locale } from "@/i18n/routing";
import { ProjectDetailE } from "@/components/sections/e/ProjectDetailE";

// Sandbox: conserva el VISOR a pantalla completa (riel de miniaturas) del
// detalle de proyecto. El sitio live usa la galería masonry (ver
// /[locale]/proyecto/[slug]).

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function SandboxProjectViewerPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const content = await getSiteContent(locale);
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <ProjectDetailE project={project} />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = await getSiteContent(locale);
  const project = content.projects.find((p) => p.slug === slug);
  return { title: project ? `${project.title} · Forja Studios (viewer)` : "Forja Studios" };
}

export async function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of routing.locales) {
    const content = await getSiteContent(locale);
    for (const p of content.projects) params.push({ locale, slug: p.slug });
  }
  return params;
}
