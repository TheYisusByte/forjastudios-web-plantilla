"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { forjaAssets } from "@/lib/content/assets";
import type { TeamMember } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FIRE = "linear-gradient(90deg, #FFB23E, #FF6A2C, #E03A2E)";
const photo = (i: number) => forjaAssets.teamPhotos[i % forjaAssets.teamPhotos.length];

export function TeamSpotlightList({ team }: { team: TeamMember[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const xTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = floatRef.current;
    if (!el) return;
    xTo.current = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
    yTo.current = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    xTo.current?.(e.clientX - rect.left);
    yTo.current?.(e.clientY - rect.top);
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".spot-row", {
        y: 44, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} onMouseMove={onMove} className="relative py-24">
      {/* Floating image preview — follows cursor */}
      <div
        ref={floatRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block"
        style={{
          width: 230, height: 290, marginLeft: -115, marginTop: -145,
          opacity: active !== null ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        {team.map((m, i) => (
          <div
            key={m.name}
            className="absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-inset ring-white/10"
            style={{
              opacity: active === i ? 1 : 0,
              transform: active === i ? "scale(1)" : "scale(0.92)",
              transition: "opacity 0.3s ease, transform 0.45s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            <Image src={photo(i)} alt="" fill className="object-cover object-top" sizes="230px" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)" }} />
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-8 text-xs uppercase tracking-[0.3em] text-forja-muted">The blacksmiths</p>
        <ul className="divide-y divide-border/60">
          {team.map((m, i) => (
            <li key={m.name} className="spot-row">
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="group flex w-full items-baseline justify-between gap-6 py-5 text-left"
              >
                <span
                  className="font-display font-black uppercase leading-none text-forja-bone transition-all duration-300 group-hover:translate-x-3"
                  style={{
                    fontSize: "clamp(1.7rem, 5vw, 3.8rem)",
                    ...(active === i
                      ? { color: "transparent", backgroundImage: FIRE, backgroundClip: "text", WebkitBackgroundClip: "text" }
                      : {}),
                  }}
                >
                  {m.name}
                </span>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.25em] text-forja-muted opacity-60 transition-all duration-300 group-hover:-translate-x-3 group-hover:text-forja-amber group-hover:opacity-100">
                  {m.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
