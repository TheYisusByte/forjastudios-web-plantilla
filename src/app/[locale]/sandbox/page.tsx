import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LangSwitch } from "@/components/ui/LangSwitch";

const concepts = [
  { id: "e", href: "/", name: "Vanguardia (live)", key: "conceptE" },
  { id: "a", href: "/sandbox/concepto-a", name: "Minimalista", key: "conceptA" },
  { id: "b", href: "/sandbox/concepto-b", name: "Moderno", key: "conceptB" },
  { id: "c", href: "/sandbox/concepto-c", name: "Cálido", key: "conceptC" },
  { id: "d", href: "/sandbox/concepto-d", name: "Réplica", key: "conceptD" },
] as const;

// Demos de componentes (pruebas A/B/C) para integrar al sitio live.
const demos = [
  { href: "/sandbox/contacto", label: "Contacto · 4 opciones" },
  { href: "/sandbox/team-demo", label: "Team · 3 opciones" },
  { href: "/sandbox/about-demo", label: "About · 3 opciones" },
  { href: "/sandbox/proyecto/kango-fast-lane", label: "Detalle proyecto · visor (legacy)" },
] as const;

export default async function IndexPage({
  params,
}: PageProps<"/[locale]/sandbox">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Index");

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <span className="font-display text-2xl font-bold tracking-tight">
          FORJA<span className="fire-text"> STUDIOS</span>
          <span className="ml-3 rounded-full border border-border px-2.5 py-1 align-middle text-[10px] font-semibold uppercase tracking-widest text-fg-muted">
            Sandbox
          </span>
        </span>
        <LangSwitch />
      </header>

      <div className="flex flex-1 flex-col justify-center py-16">
        <h1 className="font-display max-w-3xl text-balance text-4xl font-bold leading-[1.05] sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg text-fg-muted">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              data-concept={c.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 transition-colors duration-300 hover:border-accent focus-visible:border-accent focus-visible:outline-none"
            >
              <div className="fire-bg absolute inset-x-0 top-0 h-1 opacity-70" />
              <div>
                <span className="text-sm font-medium uppercase tracking-widest text-fg-muted">
                  {t("view")} {c.id.toUpperCase()}
                </span>
                <h2 className="font-display mt-3 text-2xl font-semibold">
                  {c.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {t(c.key)}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent">
                {t("view")}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-fg-muted">
            Pruebas de componentes
          </p>
          <div className="flex flex-wrap gap-3">
            {demos.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg"
              >
                {d.label}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-border pt-6 text-sm text-fg-muted">
        © {new Date().getFullYear()} Forja Studios — {t("subtitle").split(".")[0]}.
      </footer>
    </main>
  );
}
