"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Client } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ClientsEProps {
  clients: Client[];
}

function MarqueeRow({ items }: { items: Client[] }) {
  // Double for seamless loop — animate -50% translateX
  const row = [...items, ...items];

  return (
    <div className="overflow-hidden py-5">
      <div
        className="flex w-max items-center animate-marquee-left"
        aria-hidden="true"
      >
        {row.map((client, i) => (
          <span key={i} className="flex items-center gap-6 px-4">
            {client.logo ? (
              <Image
                src={client.logo}
                alt={client.name}
                width={640}
                height={240}
                className="h-20 w-auto object-contain opacity-70 sm:h-24 lg:h-28"
              />
            ) : (
              <span className="whitespace-nowrap font-display text-base font-black uppercase tracking-[0.1em] text-forja-bone/60 sm:text-lg">
                {client.name}
              </span>
            )}
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
    <section ref={sectionRef} id="clients" className="pt-12 pb-24">
      {/* Heading */}
      <div className="clients-e-heading mx-auto mb-20 max-w-7xl px-6">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-forja-muted sm:text-sm">
          {t("clientsTitle")}
        </p>
        <h2
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
        >
          <span className="block">{t("clientsHeading1")}</span>
          <span className="flame-text block">{t("clientsHeading2")}</span>
        </h2>
      </div>

      {/* Dual-direction marquee band */}
      <div className="clients-e-band relative overflow-hidden border-y border-border py-1">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-bg to-transparent" />

        <MarqueeRow items={clients} />

        <p className="sr-only">{names.join(", ")}</p>
      </div>
    </section>
  );
}
