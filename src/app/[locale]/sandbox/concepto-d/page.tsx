import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { TopNavD } from "@/components/sections/d/TopNavD";
import { HeroD } from "@/components/sections/d/HeroD";
import { ClientMarqueeD } from "@/components/sections/d/ClientMarqueeD";
import { ShowreelD } from "@/components/sections/d/ShowreelD";
import { WorksD } from "@/components/sections/d/WorksD";
import { IPsD } from "@/components/sections/d/IPsD";
import { TeamD } from "@/components/sections/d/TeamD";
import { ContactD } from "@/components/sections/d/ContactD";
import { FooterD } from "@/components/sections/d/FooterD";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { getSiteContent } from "@/lib/wp/client";

export default async function ConceptDPage({
  params,
}: PageProps<"/[locale]/sandbox/concepto-d">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale as Locale);

  return (
    <div data-concept="d" className="bg-bg text-fg">
      <TopNavD content={content} />
      <main>
        {/* 1 — Hero */}
        <HeroD />
        {/* 2 — Client marquee (full-width band, no reveal animation) */}
        <ClientMarqueeD clients={content.clients} />
        {/* 3 — Showreel */}
        {/* <SectionReveal divider>
          <ShowreelD content={content} />
        </SectionReveal> */}
        {/* 4 — Projects grid */}
        <SectionReveal divider>
          <WorksD content={content} />
        </SectionReveal>
        {/* 5 — Our IP's */}
        <SectionReveal divider>
          <IPsD content={content} />
        </SectionReveal>
        {/* 6 — Our Team */}
        <SectionReveal divider>
          <TeamD content={content} />
        </SectionReveal>
        {/* 7 — Contact */}
        <SectionReveal divider>
          <ContactD content={content} />
        </SectionReveal>
      </main>
      <FooterD />
    </div>
  );
}
