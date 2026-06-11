"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
    <TiltCard intensity={12}>
      <div
        className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-forja-coal"
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
            sizes="(max-width: 768px) 80vw, 300px"
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

        {/* Hover overlay — slides up from bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-black/95 to-transparent p-5 transition-transform duration-400 ease-out group-hover:translate-y-0">
          <div className="mb-1 h-px bg-gradient-to-r from-amber-400 via-orange-500 to-transparent" />
          <p className="mt-3 font-display text-lg font-black uppercase leading-tight text-white">
            {member.name}
          </p>
          <p className="text-sm text-white/65">{member.role}</p>
        </div>

        {/* Static bottom name — hidden on hover */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 transition-opacity duration-300 group-hover:opacity-0">
          <p className="font-display text-base font-bold uppercase text-white">{member.name}</p>
          <p className="text-xs text-white/60">{member.role}</p>
        </div>
      </div>
    </TiltCard>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function TeamE({ team }: TeamEProps) {
  const t = useTranslations("ConceptE");
  const sectionRef = useRef<HTMLElement>(null);

  // Random flicker params per member — set after hydration
  const [flicker, setFlicker] = useState<{ dur: string; delay: string }[]>(
    () => team.map(() => ({ dur: "3.2s", delay: "0s" })),
  );

  useEffect(() => {
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
    <section ref={sectionRef} id="team" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="team-e-heading mb-16">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-forja-muted">
            {t("teamTitle")}
          </p>
          <h2
            className="font-display font-black uppercase leading-none"
            style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
          >
            <span className="block text-forja-bone">{t("teamHeading1")}</span>
            <span className="fire-text block">{t("teamHeading2")}</span>
          </h2>
        </div>

        <div className="team-e-grid grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {team.map((member, i) => (
            <div key={member.name} className="team-e-card">
              <MemberCard
                member={member}
                photoSrc={forjaAssets.teamPhotos[i % forjaAssets.teamPhotos.length]}
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
