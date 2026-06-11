import { getTranslations } from "next-intl/server";

const footerNav = [
  { id: "top", label: "home" },
  { id: "ip", label: "ourIps" },
  { id: "team", label: "ourTeam" },
  { id: "contact", label: "contactUs" },
] as const;

/** Concept D — footer mirroring the original: nav + all-rights-reserved line. */
export async function FooterD() {
  const t = await getTranslations("Nav");
  const tc = await getTranslations("ConceptD");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl font-bold uppercase">
          FORJA<span className="fire-text"> STUDIOS</span>
        </p>
        <ul className="flex flex-wrap gap-6 text-sm uppercase tracking-wide text-fg-muted">
          {footerNav.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="transition-colors hover:text-accent">
                {t(item.label)}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-10 text-xs text-fg-muted">
        {tc("rights", { year })}
      </div>
    </footer>
  );
}
