"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { LangSwitch } from "./LangSwitch";
import { cn } from "@/lib/utils";

export interface NavItem {
  /** Target section id on the same page. */
  id: string;
  /** Key in the `Nav` messages namespace. */
  label: string;
}

interface NavProps {
  items: NavItem[];
  variant?: "a" | "b" | "c";
}

export function Nav({ items, variant = "a" }: NavProps) {
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-border bg-bg/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={toTop}
          className="font-display cursor-pointer text-xl font-bold tracking-tight"
        >
          FORJA<span className="fire-text"> STUDIOS</span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-6 text-sm">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group inline-flex items-center gap-2 text-fg-muted transition-colors hover:text-fg"
                >
                  {variant === "b" && (
                    <span className="size-1.5 rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                  {t(item.label)}
                </a>
              </li>
            ))}
          </ul>
          <LangSwitch />
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="cursor-pointer md:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="flex flex-col gap-2 px-6 pb-8 pt-2 md:hidden">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="font-display border-b border-border py-3 text-2xl font-semibold"
            >
              {t(item.label)}
            </a>
          ))}
          <div className="pt-4">
            <LangSwitch />
          </div>
        </div>
      )}
    </header>
  );
}
