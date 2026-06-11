"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { cn } from "@/lib/utils";

// href starting with "#" = anchor on same page; otherwise = locale-aware page link
const NAV_ITEMS = [
  { key: "home",      href: "#top"             },
  { key: "projects",  href: "#work"            },
  { key: "ourTeam",   href: "/concepto-e/team" },
  { key: "contactUs", href: "#contact"         },
] as const;

export function NavE() {
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while drawer is visible
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-border bg-forja-black/90 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        {/* Fire line — visible when scrolled */}
        <div
          className="absolute inset-x-0 bottom-0 h-px transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(90deg, transparent, #FF6A2C 40%, #FFB23E 60%, transparent)",
            opacity: scrolled ? 0.5 : 0,
          }}
        />

        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <a href="#top" className="flex items-center">
            <Image
              src="/assets/forja/images/f40ce8_54c70335883e4115ab035396d8db0215~mv2.png"
              alt="Forja Studios"
              height={80}
              width={160}
              style={{ height: "2.3rem", width: "auto" }}
              className="object-contain"
            />
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 lg:flex">
            <ul className="flex items-center gap-8 text-sm uppercase tracking-[0.12em]">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  {item.href.startsWith("#") ? (
                    <a href={item.href} className="text-forja-bone/60 transition-colors duration-200 hover:text-accent">
                      {t(item.key as Parameters<typeof t>[0])}
                    </a>
                  ) : (
                    <Link href={item.href as "/concepto-e/team"} className="text-forja-bone/60 transition-colors duration-200 hover:text-accent">
                      {t(item.key as Parameters<typeof t>[0])}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <span className="h-4 w-px bg-border" />
            <LangSwitch />
          </div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="cursor-pointer lg:hidden"
          >
            <Menu className="size-6" />
          </button>
        </nav>
      </header>

      {/* ── Backdrop ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-400 lg:hidden"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* ── Drawer panel ──────────────────────────────────────────────── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="fixed inset-y-0 right-0 z-[60] flex w-[min(320px,88vw)] flex-col bg-forja-black/96 backdrop-blur-xl transition-transform duration-500 lg:hidden"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
          borderLeft: "1px solid rgba(244,241,236,0.08)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <span className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fg-muted">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="cursor-pointer rounded-full p-1 transition-colors hover:text-accent"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav links — stagger in when drawer opens */}
        <nav className="flex flex-1 flex-col justify-center px-8">
          {NAV_ITEMS.map((item, i) => {
            const linkClass = "group flex items-baseline gap-4 border-b border-border/50 py-5 font-display font-black uppercase leading-none transition-colors hover:text-accent";
            const linkStyle = {
              fontSize: "clamp(1.6rem, 6vw, 2rem)",
              opacity:    open ? 1 : 0,
              transform:  open ? "translateX(0)" : "translateX(1.5rem)",
              transition: "opacity 0.4s ease, transform 0.4s ease, color 0.2s ease",
              transitionDelay: open ? `${i * 60 + 80}ms` : "0ms",
            };
            const inner = (
              <>
                <span className="font-mono text-[10px] text-fg-muted/50 transition-colors group-hover:text-accent/50">
                  0{i + 1}
                </span>
                {t(item.key as Parameters<typeof t>[0])}
              </>
            );
            return item.href.startsWith("#") ? (
              <a key={item.key} href={item.href} onClick={() => setOpen(false)} className={linkClass} style={linkStyle}>
                {inner}
              </a>
            ) : (
              <Link key={item.key} href={item.href as "/concepto-e/team"} onClick={() => setOpen(false)} className={linkClass} style={linkStyle}>
                {inner}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div
          className="border-t border-border px-8 py-6"
          style={{
            opacity:    open ? 1 : 0,
            transition: "opacity 0.4s ease",
            transitionDelay: open ? "380ms" : "0ms",
          }}
        >
          <LangSwitch />
        </div>
      </aside>
    </>
  );
}
