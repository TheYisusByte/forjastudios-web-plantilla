"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Toggle between ES/EN, preserving the current path. */
export function LangSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={cn("flex items-center gap-1 text-sm", className)}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "cursor-pointer rounded px-2 py-1 uppercase transition-colors",
            l === locale
              ? "font-semibold text-accent"
              : "text-fg-muted hover:text-fg",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
