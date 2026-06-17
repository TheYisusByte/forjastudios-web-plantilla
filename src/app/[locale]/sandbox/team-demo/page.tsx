import { setRequestLocale } from "next-intl/server";
import { getSiteContent } from "@/lib/wp/client";
import type { Locale } from "@/i18n/routing";
import { TeamSpotlightList } from "@/components/sections/e/team/SpotlightList";
import { TeamMarqueeReel } from "@/components/sections/e/team/MarqueeReel";
import { TeamBentoMosaic } from "@/components/sections/e/team/BentoMosaic";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

function OptionLabel({ tag, title, note }: { tag: string; title: string; note: string }) {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-20">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border pt-8">
        <span className="fire-text font-display text-4xl font-black uppercase">{tag}</span>
        <span className="font-display text-xl font-bold uppercase text-forja-bone">{title}</span>
        <span className="text-sm text-forja-muted">— {note}</span>
      </div>
    </div>
  );
}

export default async function TeamDemoPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <header className="mx-auto max-w-7xl px-6 pt-24">
        <p className="text-xs uppercase tracking-[0.3em] text-forja-muted">Concepto E · Demo</p>
        <h1 className="mt-3 font-display font-black uppercase leading-[0.9] text-forja-bone" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}>
          3 opciones de <span className="fire-text">team</span>
        </h1>
        <p className="mt-4 max-w-xl text-forja-muted">
          Pasa el cursor sobre cada layout y elige cuál llevamos a la página de equipo.
        </p>
      </header>

      <OptionLabel tag="A" title="Spotlight list" note="lista editorial tipográfica; la foto sigue el cursor y el nombre se enciende" />
      <TeamSpotlightList team={content.team} />

      <OptionLabel tag="B" title="Marquee reel" note="doble fila en auto-scroll opuesto, pausa al hover, glow de antorcha por card" />
      <TeamMarqueeReel team={content.team} />

      <OptionLabel tag="C" title="Bento mosaic" note="cuadrícula asimétrica, reveal por scroll, tilt 3D y parallax de imagen" />
      <TeamBentoMosaic team={content.team} />

      <div className="h-24" />
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
