"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Banderas como SVG inline (los emoji de bandera no se renderizan en Windows).
function FlagES() {
  return (
    <svg viewBox="0 0 3 2" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="3" height="2" fill="#AA151B" />
      <rect y="0.5" width="3" height="1" fill="#F1BF00" />
    </svg>
  );
}

function FlagEN() {
  const stripeH = 32 / 13;
  return (
    <svg viewBox="0 0 60 32" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="60" height="32" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripeH} width="60" height={stripeH} fill="#B22234" />
      ))}
      <rect width="24" height={stripeH * 7} fill="#3C3B6E" />
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={2.5 + c * 3.8} cy={1.8 + r * 3.3} r="0.8" fill="#fff" />
        )),
      )}
    </svg>
  );
}

const FLAGS: Record<string, React.ReactNode> = { es: <FlagES />, en: <FlagEN /> };
const NAMES: Record<string, string> = { es: "Español", en: "English" };

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
          aria-label={NAMES[l] ?? l}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 uppercase transition-colors",
            l === locale
              ? "font-semibold text-accent"
              : "text-fg-muted hover:text-fg",
          )}
        >
          <span
            className={cn(
              "inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 transition-opacity",
              l === locale ? "ring-white/30" : "ring-white/15 opacity-70",
            )}
          >
            {FLAGS[l]}
          </span>
          {l}
        </button>
      ))}
    </div>
  );
}
