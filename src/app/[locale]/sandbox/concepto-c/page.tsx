import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Nav, type NavItem } from "@/components/ui/Nav";
import { HeroC } from "@/components/sections/c/HeroC";
import { StoryC } from "@/components/sections/c/StoryC";
import { CraftC } from "@/components/sections/c/CraftC";
import { ProjectsC } from "@/components/sections/c/ProjectsC";
import { IPs } from "@/components/sections/IPs";
import { Stats } from "@/components/sections/Stats";
import { Team } from "@/components/sections/Team";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { getSiteContent } from "@/lib/wp/client";

const navItems: NavItem[] = [
  { id: "studio", label: "studio" },
  { id: "work", label: "work" },
  { id: "ip", label: "ip" },
  { id: "team", label: "team" },
  { id: "contact", label: "contact" },
];

export default async function ConceptCPage({
  params,
}: PageProps<"/[locale]/sandbox/concepto-c">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale as Locale);

  return (
    <div data-concept="c" className="bg-bg text-fg">
      <Nav items={navItems} variant="c" />
      <main>
        <HeroC content={content} />
        <StoryC />
        <CraftC content={content} />
        <ProjectsC content={content} />
        <IPs content={content} />
        <Stats content={content} />
        <Team content={content} />
        <Contact content={content} />
      </main>
      <Footer content={content} />
    </div>
  );
}
