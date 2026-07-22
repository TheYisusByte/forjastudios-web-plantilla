"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Move3d } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link, useRouter } from "@/i18n/navigation";
import type { IP, Project } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CARD_W = 360;
const CARD_H = 490;
const GAP_X  = 260;
const ROT_Y  = 38;
const VISIBLE = 2;

// ── IP Card ───────────────────────────────────────────────────────────────────

// Carta WebGL (Three.js) — chunk aparte, sin SSR. Solo se carga en desktop.
const IPCardWebGL = dynamic(() => import("./IPCardWebGL"), { ssr: false });

interface IPCardProps {
  ip: IP;
  image: string;
  offset: number;
  isActive: boolean;
  isDesktop: boolean;
  onClick: () => void;
  /** Abrir el detalle de la IP (solo la card activa). */
  onOpen: () => void;
}

function IPCard({ ip, image, offset, isActive, isDesktop, onClick, onOpen }: IPCardProps) {
  const t = useTranslations("ConceptE");
  const tiltRef = useRef<HTMLDivElement>(null);
  const downRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const absOff  = Math.abs(offset);
  const visible  = absOff <= VISIBLE + 1;
  // La profundidad la da translateZ (no el zIndex): al interpolarse junto al
  // resto del transform, cada card pasa SIEMPRE por detrás de las demás
  // mientras viaja a su posición, sin solaparse por el frente.
  const depth    = -absOff * 230;
  // La carta activa en desktop se renderiza en WebGL (Three.js); el resto en CSS.
  const useWebGL = isActive && isDesktop;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isActive || !tiltRef.current) return;
      const r  = tiltRef.current.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width  - 0.5;
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(tiltRef.current, { rotateY: cx * 40, rotateX: -cy * 30, z: 110, duration: 0.3, ease: "power2.out" });
      const el = tiltRef.current;
      el.style.setProperty("--hx", `${((cx + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--hy", `${((cy + 0.5) * 100).toFixed(1)}%`);
      el.querySelectorAll<HTMLElement>(".ip-holo, .ip-glare, .ip-pattern").forEach((n) => {
        n.style.opacity = "1";
      });
    },
    [isActive],
  );

  const handleMouseLeave = useCallback(() => {
    if (!tiltRef.current) return;
    gsap.to(tiltRef.current, { rotateY: 0, rotateX: 0, z: 0, duration: 0.7, ease: "elastic.out(1,0.75)" });
    tiltRef.current.querySelectorAll<HTMLElement>(".ip-holo, .ip-glare, .ip-pattern").forEach((n) => {
      gsap.to(n, { opacity: 0, duration: 0.5 });
    });
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
        transformStyle: "preserve-3d",
        transform: `translateX(${offset * GAP_X}px) translateZ(${depth}px) rotateY(${offset * -ROT_Y}deg)`,
        opacity: !visible ? 0 : Math.max(0, 1 - absOff * 0.22),
        transition: "transform 0.7s cubic-bezier(0.22,0.61,0.36,1), opacity 0.5s ease",
        pointerEvents: visible ? "auto" : "none",
        willChange: "transform, opacity",
      }}
    >
      {useWebGL ? (
        // ── Carta WebGL (activa · desktop) — arrastrar para rotar; click abre ──
        <div
          className="group absolute inset-0"
          style={{ cursor: "grab" }}
          onPointerDown={(e) => {
            // Burbuja (no capture): así OrbitControls sí recibe el evento en el
            // canvas; el stopPropagation solo evita el swipe del carrusel (stage).
            e.stopPropagation();
            downRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            const d = downRef.current;
            downRef.current = null;
            if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6 && Date.now() - d.t < 300) onOpen();
          }}
        >
          <IPCardWebGL imageUrl={image} name={ip.name} />
          {/* Hint de interactividad — sutil siempre, más visible al hover */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/70 opacity-60 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Move3d className="h-3 w-3" />
            {t("ipsDrag")}
          </div>
        </div>
      ) : (
        // ── Carta CSS (side cards · móvil) ──
        <div
          className="h-full w-full"
          style={{ cursor: "pointer" }}
          onClick={isActive ? onOpen : onClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={tiltRef}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 18,
              transformStyle: "preserve-3d",
              // Sin sombra inferior: solo un glow tipo "bloom" + borde ámbar en la activa.
              boxShadow: isActive
                ? "0 0 55px rgba(255,150,70,0.22), 0 0 0 1.5px rgba(255,178,62,0.5)"
                : "none",
              transition: "box-shadow 0.4s ease",
            }}
          >
            {/* Cara de la card — capas planas, clip a esquinas redondeadas */}
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 18 }}>
              <div className="absolute inset-0">
                <Image src={image} alt={ip.name} fill sizes="400px" className="object-cover" />
              </div>
              {/* Scrim */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.35) 100%)" }}
              />
              {/* Patrón de foil + holográfico + glare — se activan con el puntero (card activa) */}
              <div className="ip-pattern pointer-events-none absolute inset-0" />
              <div className="ip-holo pointer-events-none absolute inset-0" />
              <div className="ip-glare pointer-events-none absolute inset-0" />
            </div>

            {/* Contenido flotante — parallax 3D (se despega de la cara al inclinar) */}
            <div className="absolute left-4 top-4 z-10" style={{ transform: "translateZ(38px)" }}>
              <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60 backdrop-blur-sm">
                {t("ipsTag")}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-10 p-5" style={{ transform: "translateZ(38px)" }}>
              <p className="font-display text-lg font-black uppercase leading-tight text-forja-bone">
                {ip.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function IPsE({ ips, projects }: { ips: IP[]; projects: Project[] }) {
  const t = useTranslations("ConceptE");
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const infoRef    = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // La carta WebGL solo en desktop con puntero fino; en móvil/touch se usa CSS.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const total = ips.length;

  // Reproduce solo el video de la IP activa; pausa el resto (ahorra recursos).
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  // Imágenes de proyectos para las cards: empareja por slug si existe el
  // proyecto homónimo (carameloki, india-catalina…); si no, usa el pool.
  const covers = projects.map((p) => p.coverUrl).filter((c): c is string => !!c);
  const imageForIp = (ip: IP, i: number) =>
    ip.coverUrl ??
    projects.find((p) => p.slug === ip.slug)?.coverUrl ??
    covers[i % Math.max(1, covers.length)] ??
    "";

  // ── Navigate (slider manual — sin auto-avance) ───────────────────────────────
  const navigate = useCallback((dir: 1 | -1) => {
    setActive(p => (p + dir + total) % total);
  }, [total]);

  const goTo = useCallback((i: number) => {
    setActive(i);
  }, []);

  // ── Drag / swipe ─────────────────────────────────────────────────────────────
  const dragStart = useRef(0);
  const dragging  = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current  = true;
    dragStart.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 55) navigate(delta < 0 ? 1 : -1);
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

  // Sin IPs (CMS sin contenido o idioma sin traducir) no renderizamos la sección
  // en lugar de romper al indexar ips[active].
  if (!activeIP) return null;

  return (
    <section ref={sectionRef} id="ips" className="relative overflow-hidden" style={{ minHeight: "100vh" }}>

      {/* ── Video de fondo (URL directa desde WP) — solo el activo visible ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
        {ips.map((ip, i) =>
          ip.videoUrl && ip.videoUrl.startsWith("http") ? (
            <video
              key={ip.slug}
              ref={(el) => { videoRefs.current[i] = el; }}
              src={ip.videoUrl}
              poster={imageForIp(ip, i)}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: i === active ? 1 : 0, transition: "opacity 1s ease" }}
            />
          ) : null,
        )}
      </div>

      {/* Overlay oscuro sobre el video de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 1, background: "rgba(10,10,11,0.55)" }}
      />

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32"
        style={{ zIndex: 1, background: "linear-gradient(to bottom, transparent, rgba(10,10,11,1))" }}
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col pt-12 pb-24" style={{ zIndex: 2 }}>

        {/* Heading */}
        <div ref={headingRef} className="mx-auto w-full max-w-7xl px-6 pb-20">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-forja-muted">
            {t("ipsTitle")}
          </p>
          <h2
            className="font-display font-black uppercase leading-none"
            style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
          >
            <span className="block text-forja-bone">{t("ipsHeading1")}</span>
            <span className="flame-text block">{t("ipsHeading2")}</span>
          </h2>
        </div>

        {/* Carousel stage */}
        <div
          ref={stageRef}
          className="relative mx-auto w-full select-none"
          style={{
            height: CARD_H + 80,
            perspective: "1150px",
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
                  isDesktop={isDesktop}
                  onClick={() => goTo(i)}
                  onOpen={() => router.push(`/ip/${ip.slug}`)}
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
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 text-forja-muted backdrop-blur-sm transition-all hover:border-forja-amber hover:text-forja-amber"
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
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 text-forja-muted backdrop-blur-sm transition-all hover:border-forja-amber hover:text-forja-amber"
          >
            →
          </button>
        </div>

        {/* Active IP detail — solo el CTA (título y descripción removidos) */}
        <div ref={infoRef} className="mx-auto mt-8 max-w-md px-6 text-center">
          <Link
            href={`/ip/${activeIP.slug}`}
            className="mt-5 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-forja-amber transition-colors hover:text-forja-bone"
          >
            {t("ipsView")} <span aria-hidden>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
