"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { IP } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface IPsEProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ips: IP[];
}

export function IPsE({ ips: _ }: IPsEProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(headingRef.current, {
          x: -50, opacity: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        });
        gsap.from(cardRef.current, {
          x: 60, opacity: 0, duration: 0.95, delay: 0.18, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="ips" className="relative overflow-hidden" style={{ minHeight: "85vh" }}>

      {/* ── YouTube background video ──────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
        <div
          className="absolute"
          style={{
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%", height: "100%",
            minWidth: "177.78vh",
            minHeight: "56.25vw",
          }}
        >
          <iframe
            src="https://www.youtube-nocookie.com/embed/3928o9AZEzY?autoplay=1&mute=1&loop=1&playlist=3928o9AZEzY&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
            allow="autoplay; encrypted-media"
            className="h-full w-full border-0"
            title="Carameloki trailer"
          />
        </div>
      </div>

      {/* Dark gradient overlay — heavier on left for text legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to right, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.65) 55%, rgba(10,10,11,0.3) 100%)",
        }}
      />
      {/* Bottom fade into next section */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          zIndex: 1,
          background: "linear-gradient(to bottom, transparent, rgba(10,10,11,1))",
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div
        className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-32 lg:flex-row lg:items-center lg:justify-between"
        style={{ zIndex: 2, minHeight: "85vh" }}
      >

        {/* Left — section label + heading */}
        <div ref={headingRef} className="lg:max-w-md">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-forja-muted">
            Original IP
          </p>
          <h2
            className="font-display font-black uppercase leading-none"
            style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
          >
            <span className="block text-forja-bone">Worlds</span>
            <span className="fire-text block">of our own.</span>
          </h2>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-forja-muted">
            Stories born entirely inside the forge concept, production, and soul all in‑house.
          </p>
        </div>

        {/* Right — floating Carameloki card */}
        <div
          ref={cardRef}
          className="w-full max-w-[340px] shrink-0 overflow-hidden rounded-2xl lg:max-w-[380px]"
          style={{
            background: "rgba(10,10,11,0.70)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1.5px solid rgba(244,241,236,0.28)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,106,44,0.08)",
          }}
        >
          {/* Card image */}
          <div className="relative aspect-video overflow-hidden">
            <Image
              src="/assets/forja/images/f40ce8_2a6ae8c91747484182209fde1ff15411f000.jpg"
              alt="Carameloki"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="400px"
            />
            {/* Subtle scrim on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Card body */}
          <div className="p-5">
            {/* Logos row */}
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-48 shrink-0">
                <Image
                  src="/assets/forja/images/f40ce8_1e5edae9376d4035910038bff3914851~mv2.png"
                  alt="Carameloki"
                  fill
                  className="object-contain object-left"
                />
              </div>
              {/* <div className="h-px flex-1 bg-white/10" /> */}
              <div className="relative h-16 w-24 shrink-0">
                <Image
                  src="/assets/forja/images/f40ce8_06ce8f8811974527b879786bd5a49248~mv2.png"
                  alt="India Catalina"
                  fill
                  className="object-contain object-right"
                />
              </div>
            </div>

            {/* Meta pills */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-forja-muted">
              <span>Animated Series</span>
              <span className="text-white/20">·</span>
              <span>2D / 3D</span>
              <span className="text-white/20">·</span>
              <span>Kids &amp; Family</span>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-gradient-to-r from-amber-400/40 via-orange-500/20 to-transparent" />

            {/* Description */}
            <p className="text-sm leading-relaxed text-forja-bone/65">
              An original Forja Studios production. A colorful animated world built
              entirely in‑house from concept art and character design to full production.
              Winner of the India Catalina award.
            </p>

            {/* CTA */}
            <a
              href="https://youtu.be/3928o9AZEzY"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-forja-bone transition-all duration-200 hover:border-accent hover:text-accent"
            >
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
                <path d="M0 0l10 6-10 6V0z" />
              </svg>
              Watch Trailer
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
