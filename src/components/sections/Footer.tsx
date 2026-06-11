import { getTranslations } from "next-intl/server";
import type { SiteContent } from "@/lib/content/types";

export async function Footer({ content }: { content: SiteContent }) {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold">
            FORJA<span className="fire-text"> STUDIOS</span>
          </p>
          <p className="mt-1 text-sm text-fg-muted">{t("tagline")}</p>
        </div>
        <ul className="flex flex-wrap gap-5 text-sm text-fg-muted">
          {content.meta.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-fg"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-8 text-xs text-fg-muted">
        © {year} Forja Studios. {t("rights")}
      </div>
    </footer>
  );
}
