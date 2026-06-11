"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { forjaAssets } from "@/lib/content/assets";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/content/types";

// Original lateral-menu items — here moved to a top bar (the one change in D).
const items = [
  { id: "top", label: "home" },
  { id: "work", label: "work" },
  { id: "ip", label: "ourIps" },
  { id: "team", label: "ourTeam" },
  { id: "contact", label: "contactUs" },
] as const;

function SocialIcons({ content }: { content: SiteContent }) {
  const wa = content.meta.contact.whatsapp.replace(/\D/g, "");
  const links = [
    { label: "WhatsApp", href: `https://wa.me/${wa}` },
    ...content.meta.socials,
  ];
  return (
    <div className="flex items-center gap-3">
      {links.map((s) => {
        const icon = forjaAssets.socialIcons[s.label];
        if (!icon) return null;
        return (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            className="opacity-70 transition-opacity hover:opacity-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt={s.label} className="h-[18px] w-[18px]" />
          </a>
        );
      })}
    </div>
  );
}

export function TopNavD({ content }: { content: SiteContent }) {
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-border bg-bg/90 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <a
          href="#top"
          className="font-display text-xl font-bold uppercase tracking-tight"
        >
          FORJA<span className="fire-text"> STUDIOS</span>
        </a>

        {/* Desktop: menu (was lateral, now on top) + socials + language */}
        <div className="hidden items-center gap-7 lg:flex">
          <ul className="flex items-center gap-7 text-sm uppercase tracking-wide">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-fg-muted transition-colors hover:text-accent"
                >
                  {t(item.label)}
                </a>
              </li>
            ))}
          </ul>
          <span className="h-5 w-px bg-border" />
          <SocialIcons content={content} />
          <LangSwitch />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="cursor-pointer lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-2 px-6 pb-8 pt-2 lg:hidden">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="font-display border-b border-border py-3 text-2xl font-semibold uppercase"
            >
              {t(item.label)}
            </a>
          ))}
          <div className="flex items-center justify-between pt-4">
            <SocialIcons content={content} />
            <LangSwitch />
          </div>
        </div>
      )}
    </header>
  );
}
