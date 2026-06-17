"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { IP, Project } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CARD_W = 360;
const CARD_H = 490;
const GAP_X  = 260;
const ROT_Y  = 38;
const VISIBLE = 2;

// ── IP Card ───────────────────────────────────────────────────────────────────

interface IPCardProps {
  ip: IP;
  image: string;
  offset: number;
  isActive: boolean;
  onClick: () => void;
}

function IPCard({ ip, image, offset, isActive, onClick }: IPCardProps) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const absOff  = Math.abs(offset);
  const visible  = absOff <= VISIBLE + 1;
  const scale    = Math.max(0.65, 1 - absOff * 0.11);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isActive || !tiltRef.current) return;
      const r  = tiltRef.current.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width  - 0.5;
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(tiltRef.current, { rotateY: cx * 24, rotateX: -cy * 18, duration: 0.25, ease: "power2.out" });
      const shine = tiltRef.current.querySelector<HTMLElement>(".ip-shine");
      if (shine) {
        shine.style.opacity = "1";
        shine.style.background = `radial-gradient(circle at ${(cx + 0.5) * 100}% ${(cy + 0.5) * 100}%, rgba(255,255,255,0.15) 0%, transparent 55%)`;
      }
    },
    [isActive],
  );

  const handleMouseLeave = useCallback(() => {
    if (!tiltRef.current) return;
    gsap.to(tiltRef.current, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1,0.75)" });
    const shine = tiltRef.current.querySelector<HTMLElement>(".ip-shine");
    if (shine) gsap.to(shine, { opacity: 0, duration: 0.4 });
  }, []);

  return (
    <div
      className="absolute"
      style={{
        width: CARD_W,
        height: CARD_H,
        left: "50%",
        top: "50%",
        marginLeft: -CARD_W / 2,
        marginTop: -CARD_H / 2,
        zIndex: visible ? VISIBLE + 2 - absOff : 0,
        transform: `translateX(${offset * GAP_X}px) rotateY(${offset * -ROT_Y}deg) scale(${scale})`,
        opacity: !visible ? 0 : Math.max(0, 1 - absOff * 0.25),
        transition: "transform 0.62s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.45s ease",
        cursor: isActive ? "default" : "pointer",
        pointerEvents: visible ? "auto" : "none",
      }}
      onClick={!isActive ? onClick : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={tiltRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 18,
          overflow: "hidden",
          transformStyle: "preserve-3d",
          boxShadow: isActive
            ? "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(255,178,62,0.5)"
            : "0 14px 36px rgba(0,0,0,0.5)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Media — imagen de proyecto acomodada a la card */}
        <div className="absolute inset-0">
          <Image src={image} alt={ip.name} fill sizes="400px" className="object-cover" />
        </div>

        {/* Scrim */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.35) 100%)" }}
        />

        {/* Shine overlay */}
        <div
          className="ip-shine pointer-events-none absolute inset-0"
          style={{ opacity: 0, borderRadius: 18, transition: "opacity 0.3s" }}
        />

        {/* Active amber ring */}
        {isActive && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ borderRadius: 18, boxShadow: "inset 0 0 0 1.5px rgba(255,178,62,0.65)" }}
          />
        )}

        {/* Tag */}
        <div className="absolute left-4 top-4 z-10">
          <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60 backdrop-blur-sm">
            Original IP
          </span>
        </div>

        {/* Card info */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          <p className="font-display text-lg font-black uppercase leading-tight text-forja-bone">
            {ip.name}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function IPsE({ ips, projects }: { ips: IP[]; projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const infoRef    = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const total = ips.length;

  // Imágenes de proyectos para las cards: empareja por slug si existe el
  // proyecto homónimo (carameloki, india-catalina…); si no, usa el pool.
  const covers = projects.map((p) => p.coverUrl).filter((c): c is string => !!c);
  const imageForIp = (ip: IP, i: number) =>
    projects.find((p) => p.slug === ip.slug)?.coverUrl ??
    covers[i % Math.max(1, covers.length)] ??
    "";

  // ── Auto-rotate ─────────────────────────────────────────────────────────────
  const autoTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAuto = useCallback(() => {
    if (autoTimer.current)  { clearInterval(autoTimer.current);  autoTimer.current  = null; }
    if (restartRef.current) { clearTimeout(restartRef.current);  restartRef.current = null; }
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    autoTimer.current = setInterval(() => setActive(p => (p + 1) % total), 4000);
  }, [stopAuto, total]);

  const pauseResume = useCallback(() => {
    stopAuto();
    restartRef.current = setTimeout(startAuto, 5500);
  }, [stopAuto, startAuto]);

  useEffect(() => { startAuto(); return stopAuto; }, [startAuto, stopAuto]);

  // ── Navigate ─────────────────────────────────────────────────────────────────
  const navigate = useCallback((dir: 1 | -1) => {
    pauseResume();
    setActive(p => (p + dir + total) % total);
  }, [pauseResume, total]);

  const goTo = useCallback((i: number) => {
    pauseResume();
    setActive(i);
  }, [pauseResume]);

  // ── Drag / swipe ─────────────────────────────────────────────────────────────
  const dragStart = useRef(0);
  const dragging  = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current  = true;
    dragStart.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    stopAuto();
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 55) navigate(delta < 0 ? 1 : -1);
    else pauseResume();
  };

  // ── Info panel fade on change ────────────────────────────────────────────────
  useEffect(() => {
    if (!infoRef.current) return;
    gsap.fromTo(infoRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, [active]);

  // ── Entrance animations ──────────────────────────────────────────────────────
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(headingRef.current, {
          x: -50, opacity: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        });
        gsap.from(stageRef.current, {
          opacity: 0, scale: 0.94, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: stageRef.current, start: "top 84%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  const activeIP = ips[active];

  return (
    <section ref={sectionRef} id="ips" className="relative overflow-hidden" style={{ minHeight: "100vh" }}>

      {/* ── YouTube background videos — all loaded, only active is visible ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
        {ips.map((ip, i) => (
          <div
            key={ip.videoId}
            className="absolute inset-0"
            style={{
              opacity: i === active ? 1 : 0,
              transition: "opacity 1s ease",
            }}
          >
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
                src={`https://www.youtube-nocookie.com/embed/${ip.videoId}?autoplay=1&mute=1&loop=1&playlist=${ip.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                allow="autoplay; encrypted-media"
                className="h-full w-full border-0"
                title={ip.name}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: "linear-gradient(180deg, rgba(10,10,11,0.6) 0%, rgba(10,10,11,0.55) 50%, rgba(10,10,11,0.85) 100%)",
        }}
      />
      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32"
        style={{ zIndex: 1, background: "linear-gradient(to bottom, transparent, rgba(10,10,11,1))" }}
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col py-24" style={{ zIndex: 2 }}>

        {/* Heading */}
        <div ref={headingRef} className="mx-auto w-full max-w-7xl px-6 pb-20">
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
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-forja-muted">
            Stories born entirely inside the forge — concept, production, and soul all in‑house.
          </p>
        </div>

        {/* Carousel stage */}
        <div
          ref={stageRef}
          className="relative mx-auto w-full select-none"
          style={{
            height: CARD_H + 80,
            perspective: "1400px",
            perspectiveOrigin: "50% 50%",
            overflow: "hidden",
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {ips.map((ip, i) => {
              let offset = i - active;
              if (offset >  total / 2) offset -= total;
              if (offset < -total / 2) offset += total;
              return (
                <IPCard
                  key={ip.slug}
                  ip={ip}
                  image={imageForIp(ip, i)}
                  offset={offset}
                  isActive={i === active}
                  onClick={() => goTo(i)}
                />
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center justify-center gap-8">
          <button
            onClick={() => navigate(-1)}
            aria-label="IP anterior"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-forja-muted backdrop-blur-sm transition-all hover:border-forja-amber hover:text-forja-amber"
          >
            ←
          </button>

          <div className="flex items-center gap-2">
            {ips.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`IP ${i + 1}`}
                style={{
                  width: i === active ? 22 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === active ? "#FF6A2C" : "rgba(244,241,236,0.25)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => navigate(1)}
            aria-label="IP siguiente"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-forja-muted backdrop-blur-sm transition-all hover:border-forja-amber hover:text-forja-amber"
          >
            →
          </button>
        </div>

        {/* Active IP detail */}
        <div ref={infoRef} className="mx-auto mt-8 max-w-md px-6 text-center">
          <p className="font-display text-2xl font-black uppercase text-forja-bone">
            {activeIP.name}
          </p>
          {activeIP.description && (
            <p className="mt-3 text-sm leading-relaxed text-forja-muted/75">
              {activeIP.description}
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
