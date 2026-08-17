import { setRequestLocale } from "next-intl/server";
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
import { FooterE } from "@/components/sections/e/FooterE";
import { IntroOverlay } from "@/components/ui/IntroOverlay";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ConceptoEPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      {/* Intro de marca — solo en la home y una vez por sesión. */}
      <IntroOverlay />
      {/* <CursorE /> */}
      <NavE />
      <HeroE />
      <ClientsE clients={content.clients} />
      <ProjectsE projects={content.projects} />
      <IPsE ips={content.ips} projects={content.projects} />
      <StatsInterleaved stats={content.meta.stats} />
      <ReelE />
      <ContactForgeMeter content={content} />

      <FooterE />
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
