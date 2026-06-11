import { setRequestLocale } from "next-intl/server";
import { getSiteContent } from "@/lib/wp/client";
import type { Locale } from "@/i18n/routing";
import { NavE } from "@/components/sections/e/NavE";
import { CursorE } from "@/components/sections/e/CursorE";
import { HeroE } from "@/components/sections/e/HeroE";
import { ClientsE } from "@/components/sections/e/ClientsE";
import { ProjectsE } from "@/components/sections/e/ProjectsE";
import { TeamE } from "@/components/sections/e/TeamE";
import { AboutE } from "@/components/sections/e/AboutE";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ConceptoEPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      {/* Custom cursor (client only) */}
      <CursorE />
      {/* Sticky nav */}
      <NavE />
      {/* Sections */}
      <HeroE />
      <ClientsE clients={content.clients} />
      <ProjectsE projects={content.projects} />
      <TeamE team={content.team} />
      <AboutE />

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="font-display text-sm font-bold uppercase tracking-widest">
            FORJA <span className="fire-text">STUDIOS</span>
          </p>
          <p className="text-xs text-forja-muted">
            © {new Date().getFullYear()} Forja Studios. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}
