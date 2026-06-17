import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Nav, type NavItem } from "@/components/ui/Nav";
import { HeroB } from "@/components/sections/b/HeroB";
import { BentoB } from "@/components/sections/b/BentoB";
import { ProjectsB } from "@/components/sections/b/ProjectsB";
import { Clients } from "@/components/sections/Clients";
import { IPs } from "@/components/sections/IPs";
import { Stats } from "@/components/sections/Stats";
import { Team } from "@/components/sections/Team";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { getSiteContent } from "@/lib/wp/client";

const navItems: NavItem[] = [
  { id: "work", label: "work" },
  { id: "studio", label: "studio" },
  { id: "ip", label: "ip" },
  { id: "contact", label: "contact" },
];

export default async function ConceptBPage({
  params,
}: PageProps<"/[locale]/sandbox/concepto-b">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale as Locale);

  return (
    <div data-concept="b" className="bg-bg text-fg">
      <Nav items={navItems} variant="b" />
      <main>
        <HeroB descriptor={content.meta.descriptor} />
        <BentoB content={content} />
        <ProjectsB content={content} />
        <Clients content={content} />
        <IPs content={content} />
        <Stats content={content} />
        <Team content={content} />
        <Contact content={content} />
      </main>
      <Footer content={content} />
    </div>
  );
}
