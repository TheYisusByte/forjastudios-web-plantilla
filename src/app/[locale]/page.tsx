import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getSiteContent } from "@/lib/wp/client";
import type { Locale } from "@/i18n/routing";
import { NavE } from "@/components/sections/e/NavE";
// import { CursorE } from "@/components/sections/e/CursorE";
import { HeroE } from "@/components/sections/e/HeroE";
import { ClientsE } from "@/components/sections/e/ClientsE";
import { ProjectsE } from "@/components/sections/e/ProjectsE";
import { IPsE } from "@/components/sections/e/IPsE";
import { StatsInterleaved } from "@/components/sections/e/about/StatsInterleaved";
import { ContactForgeMeter } from "@/components/sections/e/contact/ForgeMeter";
import { ReelE } from "@/components/sections/e/ReelE";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ConceptoEPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);
  const tf = await getTranslations("Footer");

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      {/* <CursorE /> */}
      <NavE />
      <HeroE />
      <ClientsE clients={content.clients} />
      <ProjectsE projects={content.projects} />
      <IPsE ips={content.ips} projects={content.projects} />
      <StatsInterleaved stats={content.meta.stats} />
      <ReelE />
      <ContactForgeMeter content={content} />

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <a href="#top">
              <Image
                src="/assets/forja/images/f40ce8_54c70335883e4115ab035396d8db0215~mv2.png"
                alt="Forja Studios"
                height={40}
                width={160}
                style={{ height: "1.75rem", width: "auto" }}
                className="object-contain"
              />
            </a>
            <p className="text-xs text-forja-muted">
              © 2013–{new Date().getFullYear()} FORJA Studios. {tf("rights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
