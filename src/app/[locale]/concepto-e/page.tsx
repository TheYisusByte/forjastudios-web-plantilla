import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getSiteContent } from "@/lib/wp/client";
import type { Locale } from "@/i18n/routing";
import { NavE } from "@/components/sections/e/NavE";
// import { CursorE } from "@/components/sections/e/CursorE";
import { HeroE } from "@/components/sections/e/HeroE";
import { ClientsE } from "@/components/sections/e/ClientsE";
import { ProjectsE } from "@/components/sections/e/ProjectsE";
import { IPsE } from "@/components/sections/e/IPsE";
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
      {/* <CursorE /> */}
      <NavE />
      <HeroE />
      <ClientsE clients={content.clients} />
      <ProjectsE projects={content.projects} />
      <IPsE ips={content.ips} projects={content.projects} />
      <AboutE />

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
              © {new Date().getFullYear()} Forja Studios. All rights reserved.
            </p>
          </div>
          <p className="mt-6 text-center text-[11px] leading-relaxed text-forja-muted/50">
            All the content displayed in this website and related to Forja Studios have all rights
            reserved © 2025. All audio, artwork and animations was developed by FORJA Studios
            and/or their team and have been authorized by them to be published in this website.
            If any content published infringes any copyright laws please contact us via email or
            contact section above.
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
