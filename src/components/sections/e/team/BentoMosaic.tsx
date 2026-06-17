"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TiltCard } from "../TiltCard";
import { forjaAssets } from "@/lib/content/assets";
import type { TeamMember } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const photo = (i: number) => forjaAssets.teamPhotos[i % forjaAssets.teamPhotos.length];

// Patrón bento (4 columnas en desktop). Se repite cíclicamente si hay más miembros.
const SPAN = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-1 md:row-span-1",
];

export function TeamBentoMosaic({ team }: { team: TeamMember[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".bento-card", {
        y: 60, opacity: 0, scale: 0.94, duration: 0.75,
        stagger: { each: 0.09, from: "start" }, ease: "power3.out",
        scrollTrigger: { trigger: ".bento-grid", start: "top 82%", once: true },
      });
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-xs uppercase tracking-[0.3em] text-forja-muted">The blacksmiths</p>
        <div className="bento-grid grid auto-rows-[clamp(150px,20vw,230px)] grid-cols-2 gap-3 md:grid-cols-4">
          {team.map((m, i) => (
            <div key={m.name} className={`bento-card ${SPAN[i % SPAN.length]}`}>
              <TiltCard intensity={10}>
                <div className="group relative h-full overflow-hidden rounded-2xl ring-1 ring-inset ring-white/10">
                  <Image
                    src={photo(i)}
                    alt={m.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,148,38,0.3), transparent 60%)" }}
                  />
                  <div className="absolute inset-x-0 bottom-0 translate-y-1 p-4 transition-transform duration-300 group-hover:translate-y-0">
                    <div className="mb-2 h-px w-10 origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                    <p className="font-display text-base font-black uppercase leading-tight text-white">{m.name}</p>
                    <p className="text-xs text-white/60">{m.role}</p>
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
