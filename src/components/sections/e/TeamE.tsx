"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TiltCard } from "./TiltCard";
import { forjaAssets } from "@/lib/content/assets";
import type { TeamMember } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TeamEProps {
  team: TeamMember[];
}

// ── Card ─────────────────────────────────────────────────────────────────────

function MemberCard({
  member,
  photoSrc,
  flickerDur,
  flickerDelay,
}: {
  member: TeamMember;
  photoSrc?: string;
  flickerDur: string;
  flickerDelay: string;
}) {
  const torchWrap  = useRef<HTMLDivElement>(null);
  const torchGlow  = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    torchGlow.current?.style.setProperty("--mx", `${x.toFixed(1)}%`);
    torchGlow.current?.style.setProperty("--my", `${y.toFixed(1)}%`);
  };
  const handleMouseEnter = () => {
    if (torchWrap.current) torchWrap.current.style.opacity = "1";
  };
  const handleMouseLeave = () => {
    if (torchWrap.current) torchWrap.current.style.opacity = "0";
  };

  return (
    <TiltCard intensity={18}>
      <div
        className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-forja-coal shadow-lg ring-1 ring-inset ring-white/10 transition-shadow duration-300 hover:shadow-[0_30px_55px_-20px_rgba(0,0,0,0.75)]"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {photoSrc ? (
          <Image
            src={photoSrc}
            alt={member.name}
            fill
            className="e-img object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 80vw, (max-width: 1024px) 33vw, 260px"
          />
        ) : (
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: "linear-gradient(145deg, #1a1a1d 0%, #2d2d30 100%)" }}
          />
        )}

        {/* Initials monogram — fallback */}
        {!photoSrc && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="select-none font-display text-7xl font-black uppercase text-white/10" aria-hidden="true">
              {member.initials}
            </span>
          </div>
        )}

        {/* Base scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

        {/* ── Torch — follows mouse, fades in/out on hover ── */}
        <div
          ref={torchWrap}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{ opacity: 0, transition: "opacity 0.3s ease" }}
        >
          <div
            ref={torchGlow}
            className="animate-candle-flicker absolute inset-0"
            style={{
              background:
                "radial-gradient(circle 180px at var(--mx, 50%) var(--my, 50%), rgba(255,148,38,0.9) 0%, rgba(224,80,28,0.45) 38%, transparent 68%)",
              "--flicker-dur":   flickerDur,
              "--flicker-delay": flickerDelay,
            } as React.CSSProperties}
          />
        </div>

        {/* Nombre + cargo — siempre visibles (sin reveal en hover) */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          <div className="mb-2 h-px w-10 bg-gradient-to-r from-amber-400 via-orange-500 to-transparent" />
          <p className="font-display text-base font-bold uppercase leading-tight text-white">{member.name}</p>
          <p className="text-xs text-white/60">{member.role}</p>
        </div>
      </div>
    </TiltCard>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function TeamE({ team }: TeamEProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Random flicker params per member — set after hydration
  const [flicker, setFlicker] = useState<{ dur: string; delay: string }[]>(
    () => team.map(() => ({ dur: "3.2s", delay: "0s" })),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlicker(
      team.map(() => ({
        dur:   `${(2.4 + Math.random() * 2.2).toFixed(2)}s`,
        delay: `${(Math.random() * 2.5).toFixed(2)}s`,
      })),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".team-e-heading > *", {
          y: 40, opacity: 0, duration: 0.85, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: ".team-e-heading", start: "top 78%", once: true },
        });
        gsap.from(".team-e-card", {
          y: 60, opacity: 0, duration: 0.7, stagger: { each: 0.08, from: "start" }, ease: "power3.out",
          scrollTrigger: { trigger: ".team-e-grid", start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="team" className="pt-12 pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="team-e-grid grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {team.map((member, i) => (
            <div key={member.name} className="team-e-card">
              <MemberCard
                member={member}
                photoSrc={member.photo ?? forjaAssets.teamPhotos[i % forjaAssets.teamPhotos.length]}
                flickerDur={flicker[i]?.dur   ?? "3.2s"}
                flickerDelay={flicker[i]?.delay ?? "0s"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
