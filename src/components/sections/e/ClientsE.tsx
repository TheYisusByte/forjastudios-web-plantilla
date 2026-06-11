"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Client } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ClientsEProps {
  clients: Client[];
}

function MarqueeRow({
  items,
  direction,
}: {
  items: string[];
  direction: "left" | "right";
}) {
  // Double for seamless loop — animate -50% translateX
  const row = [...items, ...items];

  return (
    <div className="overflow-hidden py-5">
      <div
        className={`flex w-max items-center ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
        aria-hidden="true"
      >
        {row.map((name, i) => (
          <span key={i} className="flex items-center gap-8 px-4">
            <span
              className={`whitespace-nowrap font-display text-xl font-black uppercase tracking-[0.1em] ${
                i % 5 === 2 ? "fire-text" : "text-forja-bone/60"
              }`}
            >
              {name}
            </span>
            <span className="fire-text text-sm" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ClientsE({ clients }: ClientsEProps) {
  const t = useTranslations("ConceptE");
  const sectionRef = useRef<HTMLElement>(null);
  const names = clients.map((c) => c.name);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Heading reveal
        gsap.from(".clients-e-heading", {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        });
        // Marquee band fade in
        gsap.from(".clients-e-band", {
          opacity: 0,
          duration: 0.7,
          scrollTrigger: {
            trigger: ".clients-e-band",
            start: "top 85%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="clients" className="py-24">
      {/* Heading */}
      <div className="clients-e-heading mx-auto mb-12 max-w-7xl px-6">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-forja-muted">
          {t("clientsTitle")}
        </p>
        <h2
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
        >
          <span className="block">Trusted</span>
          <span className="fire-text block">by the best.</span>
        </h2>
      </div>

      {/* Dual-direction marquee band */}
      <div
        className="clients-e-band relative overflow-hidden border-y border-border py-1"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,106,44,0.04) 0%, transparent 40%, transparent 60%, rgba(255,106,44,0.04) 100%)",
        }}
      >
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-bg to-transparent" />

        <MarqueeRow items={names} direction="left" />
        <MarqueeRow items={[...names].reverse()} direction="right" />

        <p className="sr-only">{names.join(", ")}</p>
      </div>
    </section>
  );
}
