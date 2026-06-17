import { setRequestLocale } from "next-intl/server";
import { getSiteContent } from "@/lib/wp/client";
import type { Locale } from "@/i18n/routing";
import { ContactForgeMeter } from "@/components/sections/e/contact/ForgeMeter";
import { ContactConversational } from "@/components/sections/e/contact/Conversational";
import { ContactBentoMagnetic } from "@/components/sections/e/contact/BentoMagnetic";
import { ContactForgeBento } from "@/components/sections/e/contact/ForgeBento";

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

export default async function ContactPreviewPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale);

  return (
    <div data-concept="e" className="min-h-screen bg-bg text-fg">
      <header className="mx-auto max-w-7xl px-6 pt-24">
        <p className="text-xs uppercase tracking-[0.3em] text-forja-muted">Concepto E · Demo</p>
        <h1 className="mt-3 font-display font-black uppercase leading-[0.9] text-forja-bone" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}>
          4 opciones de <span className="fire-text">contacto</span>
        </h1>
        <p className="mt-4 max-w-xl text-forja-muted">
          Prueba cada formulario (escribe, enfoca campos, envía) y elige cuál llevamos a la página final.
        </p>
      </header>

      <OptionLabel tag="A" title="Forge · Heat meter" note="underline que se enciende, embers, barra de calor gamificada, chispas al enviar" />
      <ContactForgeMeter content={content} />

      <OptionLabel tag="B" title="Conversational flow" note="una pregunta a la vez, tipografía gigante, transiciones slide+fade, barra de progreso" />
      <ContactConversational content={content} />

      <OptionLabel tag="C" title="Bento glass · Magnetic" note="glassmorphism, floating labels, botón magnético, tilt 3D, palabra rotativa" />
      <ContactBentoMagnetic content={content} />

      <OptionLabel tag="D" title="Forge Bento (A + C)" note="título animado + heat meter, sin tilt 3D — glass, floating labels y botón magnético" />
      <ContactForgeBento content={content} />

      <div className="h-24" />
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
