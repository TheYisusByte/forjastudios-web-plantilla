import { setRequestLocale } from "next-intl/server";
import { getSiteContent } from "@/lib/wp/client";
import type { Locale } from "@/i18n/routing";
import { StatsForgeGrid } from "@/components/sections/e/about/StatsForgeGrid";
import { StatsZigzag } from "@/components/sections/e/about/StatsZigzag";
import { StatsSpotlight } from "@/components/sections/e/about/StatsSpotlight";
import { StatsInterleaved } from "@/components/sections/e/about/StatsInterleaved";

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

export default async function AboutDemoPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);
  const { stats } = content.meta;

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <header className="mx-auto max-w-7xl px-6 pt-24">
        <p className="text-xs uppercase tracking-[0.3em] text-forja-muted">Concepto E · Demo</p>
        <h1
          className="mt-3 font-display font-black uppercase leading-[0.9] text-forja-bone"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}
        >
          3 opciones de <span className="fire-text">about</span>
        </h1>
        <p className="mt-4 max-w-xl text-forja-muted">
          Sección de cifras (+60 blacksmiths, +1300 proyectos, +12 años) con los GIFs de la forja.
          Elige cuál llevamos a la home.
        </p>
      </header>

      <OptionLabel
        tag="A"
        title="Forge grid"
        note="tres cards bento; el GIF se enciende al hover y el número cuenta hacia arriba"
      />
      <StatsForgeGrid stats={stats} />

      <OptionLabel
        tag="B"
        title="Editorial zigzag"
        note="filas alternadas a pantalla ancha, número gigante y GIF enmarcado; reveal por scroll"
      />
      <StatsZigzag stats={stats} />

      <OptionLabel
        tag="C"
        title="Sticky spotlight"
        note="el GIF queda fijo y hace crossfade según el stat centrado al hacer scroll"
      />
      <StatsSpotlight stats={stats} />

      <OptionLabel
        tag="D"
        title="Interleaved board"
        note="grid 2×3 con GIFs y texto intercalados tipo tablero; GIFs sin borde ni fondo, celdas cuadradas iguales"
      />
      <StatsInterleaved stats={stats} />

      <div className="h-24" />
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
