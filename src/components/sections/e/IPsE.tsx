"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatedGif } from "@/components/ui/AnimatedGif";
import { forjaAssets } from "@/lib/content/assets";
import type { IP } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ── Card ─────────────────────────────────────────────────────────────────────

function IPCard({ ip }: { ip: IP }) {
  const torchWrap = useRef<HTMLDivElement>(null);
  const torchGlow = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    torchGlow.current?.style.setProperty("--mx", `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
    torchGlow.current?.style.setProperty("--my", `${(((e.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
  };
  const handleMouseEnter = () => { if (torchWrap.current) torchWrap.current.style.opacity = "1"; };
  const handleMouseLeave = () => { if (torchWrap.current) torchWrap.current.style.opacity = "0"; };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl"
      style={{ minHeight: "clamp(320px, 45vw, 540px)" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background GIF — grayscale */}
      <div className="e-img absolute inset-0">
        <AnimatedGif
          asset={forjaAssets.anim.ip}
          alt={ip.name}
          className="h-full w-full"
        />
      </div>

      {/* Accent gradient tint from IP data (very subtle) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: `linear-gradient(135deg, ${ip.accent[0]}33, ${ip.accent[1]}22)` }}
      />

      {/* Base scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Torch flicker */}
      <div
        ref={torchWrap}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0, transition: "opacity 0.3s ease" }}
      >
        <div
          ref={torchGlow}
          className="animate-candle-flicker absolute inset-0"
          style={{
            background: "radial-gradient(circle 200px at var(--mx,50%) var(--my,50%), rgba(255,148,38,0.88) 0%, rgba(224,80,28,0.42) 38%, transparent 68%)",
            "--flicker-dur": "3s",
          } as React.CSSProperties}
        />
      </div>

      {/* Static bottom label */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-7 transition-opacity duration-300 group-hover:opacity-0">
        <p className="font-display text-2xl font-black uppercase text-white">{ip.name}</p>
      </div>

      {/* Hover overlay — slides up */}
      <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-black/96 via-black/70 to-transparent pb-7 pl-7 pr-7 pt-16 transition-transform duration-400 ease-out group-hover:translate-y-0">
        <div className="mb-2 h-px bg-gradient-to-r from-amber-400 via-orange-500 to-transparent" />
        <p className="mt-4 font-display text-2xl font-black uppercase leading-tight text-white">
          {ip.name}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{ip.description}</p>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface IPsEProps {
  ips: IP[];
}

export function IPsE({ ips }: IPsEProps) {
  const t = useTranslations("ConceptE");
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".ips-e-heading > *", {
          y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        });
        gsap.from(".ip-e-card", {
          opacity: 0, y: 30, duration: 0.6, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: ".ip-e-grid", start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="ips" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="ips-e-heading mb-14">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-forja-muted">
            {t("ipsTitle")}
          </p>
          <h2
            className="font-display font-black uppercase leading-none"
            style={{ fontSize: "clamp(2.6rem, 6.5vw, 5.5rem)" }}
          >
            <span className="block text-forja-bone">{t("ipsHeading1")}</span>
            <span className="fire-text block">{t("ipsHeading2")}</span>
          </h2>
        </div>

        <div className="ip-e-grid grid gap-5 sm:grid-cols-2">
          {ips.map((ip) => (
            <div key={ip.slug} className="ip-e-card">
              <IPCard ip={ip} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
