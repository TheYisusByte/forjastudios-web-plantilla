import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Nav, type NavItem } from "@/components/ui/Nav";
import { HeroA } from "@/components/sections/a/HeroA";
import { ShowreelA } from "@/components/sections/a/ShowreelA";
import { Clients } from "@/components/sections/Clients";
import { ProjectsA } from "@/components/sections/a/ProjectsA";
import { IPs } from "@/components/sections/IPs";
import { Stats } from "@/components/sections/Stats";
import { Team } from "@/components/sections/Team";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { getSiteContent } from "@/lib/wp/client";

const navItems: NavItem[] = [
  { id: "work", label: "work" },
  { id: "ip", label: "ip" },
  { id: "team", label: "team" },
  { id: "contact", label: "contact" },
];

export default async function ConceptAPage({
  params,
}: PageProps<"/[locale]/sandbox/concepto-a">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale as Locale);

  return (
    <div data-concept="a" className="bg-bg text-fg">
      <Nav items={navItems} variant="a" />
      <main>
        <HeroA content={content} />
        <ShowreelA content={content} />
        <Clients content={content} />
        <ProjectsA content={content} />
        <IPs content={content} />
        <Stats content={content} />
        <Team content={content} />
        <Contact content={content} />
      </main>
      <Footer content={content} />
    </div>
  );
}
