"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { forjaAssets } from "@/lib/content/assets";
import type { TeamMember } from "@/lib/content/types";

const photo = (i: number) => forjaAssets.teamPhotos[i % forjaAssets.teamPhotos.length];

function ReelCard({ member, src }: { member: TeamMember; src: string }) {
  return (
    <div className="group relative aspect-[3/4] w-[200px] shrink-0 overflow-hidden rounded-xl ring-1 ring-inset ring-white/10 transition-transform duration-500 hover:scale-[1.05] md:w-[230px]">
      <Image src={src} alt={member.name} fill sizes="230px" className="object-cover object-top transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle at 50% 35%, rgba(255,148,38,0.4), transparent 62%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mb-2 h-px w-10 origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
        <p className="font-display text-sm font-black uppercase text-white">{member.name}</p>
        <p className="text-xs text-white/60">{member.role}</p>
      </div>
    </div>
  );
}

function Row({ items, dir, speed }: { items: TeamMember[]; dir: 1 | -1; speed: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      tweenRef.current = gsap.fromTo(
        trackRef.current,
        { xPercent: dir > 0 ? 0 : -50 },
        { xPercent: dir > 0 ? -50 : 0, duration: speed, ease: "none", repeat: -1 },
      );
    });
    return () => mm.revert();
  }, { scope: trackRef });

  const pause = () => { if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 0, duration: 0.4 }); };
  const play  = () => { if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 1, duration: 0.4 }); };

  // Duplicado para loop continuo
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden" onMouseEnter={pause} onMouseLeave={play}>
      <div ref={trackRef} className="flex w-max gap-4">
        {loop.map((m, i) => (
          <ReelCard key={`${m.name}-${i}`} member={m} src={photo(i % items.length)} />
        ))}
      </div>
    </div>
  );
}

export function TeamMarqueeReel({ team }: { team: TeamMember[] }) {
  const rowA = team;
  const rowB = [...team].reverse();

  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-forja-muted">The blacksmiths</p>
        <p className="mt-2 text-sm text-forja-muted/70">Hover para pausar el reel.</p>
      </div>
      <div className="flex flex-col gap-4">
        <Row items={rowA} dir={1} speed={32} />
        <Row items={rowB} dir={-1} speed={38} />
      </div>
      {/* Edge fades */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24" style={{ background: "linear-gradient(to right, var(--color-bg, #0A0A0B), transparent)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-24" style={{ background: "linear-gradient(to left, var(--color-bg, #0A0A0B), transparent)" }} />
    </section>
  );
}
