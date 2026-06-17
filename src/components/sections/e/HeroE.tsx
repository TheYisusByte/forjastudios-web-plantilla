"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { HeroBgVideo } from "@/components/sections/d/HeroBgVideo";
import { meta } from "@/lib/content/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ── Tuning constants ──────────────────────────────────────────────────────

const NUM_SMOKE   = 300;   // white/grey diffuse smoke
const NUM_SPARKS  = 45;    // small glowing embers (orange scale)
const REP_RADIUS  = 190;   // mouse repulsion radius (px)
const REP_FORCE   = 4.2;   // repulsion impulse strength
const DAMPING     = 0.91;  // extra-velocity decay per frame

// ── Types ─────────────────────────────────────────────────────────────────

interface SmokeParticle {
  x: number; y: number;
  vx: number; vy: number;
  riseSpeed: number;
  life: number; lifeSpeed: number;
  r: number;
  peakAlpha: number;
}

// Spark colors: hot inner / glow middle / transparent edge
const SPARK_PALETTES = [
  ["rgba(255,218,100,", "rgba(255,178,62,",  "rgba(255,130,40,"],  // gold
  ["rgba(255,145,45,",  "rgba(255,106,44,",  "rgba(224,58,46,"],   // orange
  ["rgba(255,100,50,",  "rgba(224,58,46,",   "rgba(180,30,20,"],   // red-orange
  ["rgba(255,200,80,",  "rgba(255,160,50,",  "rgba(255,100,40,"],  // amber
] as const;

interface SparkParticle {
  x: number; y: number;
  vx: number; vy: number;
  riseSpeed: number;
  life: number; lifeSpeed: number;
  r: number;         // tiny: 1.5–4.5 px
  palette: number;   // index into SPARK_PALETTES
  peakAlpha: number;
}

// ── Init helpers ──────────────────────────────────────────────────────────

function mkSmoke(w: number, h: number, randLife = false): SmokeParticle {
  return {
    x: Math.random() * w,
    y: h * (0.62 + Math.random() * 0.36),
    vx: 0, vy: 0,
    riseSpeed: 0.30 + Math.random() * 0.42,
    life: randLife ? Math.random() : 0,
    lifeSpeed: 0.0013 + Math.random() * 0.0009,
    r: 36 + Math.random() * 24,        // smaller: 18–42 px
    peakAlpha: 0.055 + Math.random() * 0.07,
  };
}

function mkSpark(w: number, h: number, randLife = false): SparkParticle {
  return {
    x: Math.random() * w,
    // Sparks start in the bottom 25% — very close to the forge base
    y: h * (0.76 + Math.random() * 0.22),
    vx: (Math.random() - 0.5) * 0.6,
    vy: 0,
    riseSpeed: 1.1 + Math.random() * 1.9,  // faster than smoke
    life: randLife ? Math.random() : 0,
    lifeSpeed: 0.003 + Math.random() * 0.003, // shorter lifetime
    r: 0.7 + Math.random() * 1.4,
    palette: Math.floor(Math.random() * SPARK_PALETTES.length),
    peakAlpha: 0.75 + Math.random() * 0.25,
  };
}

// ── Pre-rendered smoke texture (one radial gradient → reusable canvas) ────

function buildSmokeTexture(): HTMLCanvasElement {
  const SZ = 256;
  const t = document.createElement("canvas");
  t.width = SZ; t.height = SZ;
  const tc = t.getContext("2d")!;
  const c = SZ / 2;
  const g = tc.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0.00, "rgba(240,235,228,1)");
  g.addColorStop(0.30, "rgba(240,235,228,0.55)");
  g.addColorStop(0.65, "rgba(240,235,228,0.18)");
  g.addColorStop(1.00, "rgba(240,235,228,0)");
  tc.beginPath(); tc.arc(c, c, c, 0, Math.PI * 2); tc.fillStyle = g; tc.fill();
  return t;
}

// ── Canvas hook ───────────────────────────────────────────────────────────

function useForgeCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  mouseRef: React.RefObject<{ x: number; y: number; inside: boolean }>,
) {
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const rawCtx = canvasEl.getContext("2d");
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    const canvas: HTMLCanvasElement = canvasEl;

    let w = 0, h = 0;
    let smoke: SmokeParticle[] = [];
    let sparks: SparkParticle[] = [];
    let raf: number;
    const tex = buildSmokeTexture();

    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w; canvas.height = h;
      smoke  = Array.from({ length: NUM_SMOKE  }, () => mkSmoke(w, h, true));
      sparks = Array.from({ length: NUM_SPARKS }, () => mkSpark(w, h, true));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function applyRepulsion(
      px: number, py: number,
      vxRef: { value: number }, vyRef: { value: number },
      forceMult = 1,
    ) {
      if (!mouseRef.current.inside) return;
      const dx = px - mouseRef.current.x;
      const dy = py - mouseRef.current.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < REP_RADIUS * REP_RADIUS && d2 > 1) {
        const d = Math.sqrt(d2);
        const t = 1 - d / REP_RADIUS;
        const f = t * t * REP_FORCE * forceMult;
        vxRef.value += (dx / d) * f;
        vyRef.value += (dy / d) * f;
      }
    }

    function tick() {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, w, h);

      // ── Smoke ────────────────────────────────────────────────────────
      for (let i = 0; i < smoke.length; i++) {
        const p = smoke[i];
        p.y -= p.riseSpeed;
        p.vx += (Math.random() - 0.5) * 0.07;
        p.vy += (Math.random() - 0.5) * 0.035;
        const vxObj = { value: p.vx }, vyObj = { value: p.vy };
        applyRepulsion(p.x, p.y, vxObj, vyObj, 1.0);
        p.vx = vxObj.value * DAMPING;
        p.vy = vyObj.value * DAMPING;
        p.x += p.vx; p.y += p.vy;
        p.life += p.lifeSpeed;
        if (p.life >= 1 || p.y < -p.r) { smoke[i] = mkSmoke(w, h, false); continue; }
        const alpha = Math.sin(p.life * Math.PI) * p.peakAlpha;
        if (alpha < 0.003) continue;
        ctx.globalAlpha = alpha;
        ctx.drawImage(tex, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }

      // ── Sparks ───────────────────────────────────────────────────────
      for (let i = 0; i < sparks.length; i++) {
        const p = sparks[i];
        p.y -= p.riseSpeed;
        // Sparks drift more chaotically than smoke
        p.vx += (Math.random() - 0.5) * 0.22;
        const vxObj = { value: p.vx }, vyObj = { value: p.vy };
        // Sparks scatter more easily (lighter) so stronger repulsion response
        applyRepulsion(p.x, p.y, vxObj, vyObj, 1.6);
        p.vx = vxObj.value * 0.90;
        p.vy = vyObj.value * 0.90;
        p.x += p.vx; p.y += p.vy;
        p.life += p.lifeSpeed;
        if (p.life >= 1 || p.y < -p.r) { sparks[i] = mkSpark(w, h, false); continue; }
        // Sparks flicker: sharp peak, quick fade (power-2 fall-off)
        const t = p.life;
        const alpha = (t < 0.15 ? t / 0.15 : Math.pow(1 - (t - 0.15) / 0.85, 1.8)) * p.peakAlpha;
        if (alpha < 0.01) continue;
        const pal = SPARK_PALETTES[p.palette];
        const r = p.r;
        ctx.globalAlpha = alpha;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
        grd.addColorStop(0.00, pal[0] + "1)");
        grd.addColorStop(0.35, pal[1] + "0.6)");
        grd.addColorStop(0.70, pal[2] + "0.2)");
        grd.addColorStop(1.00, pal[2] + "0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [canvasRef, mouseRef]);
}

// ── Component ─────────────────────────────────────────────────────────────

// Hero title: "Forge your ___" — la última palabra rota (misma animación que
// el formulario de contacto). Editable: cambia/añade palabras aquí.
const STATIC_LINES = ["Forge", "your"];
const ROTATE_WORDS = ["flame.", "world.", "story.", "legend."];

export function HeroE() {
  const t = useTranslations("ConceptE");
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouseRef   = useRef({ x: -999, y: -999, inside: false });
  const rotWrapRef = useRef<HTMLSpanElement>(null);
  const [rotIdx, setRotIdx] = useState(0);
  useForgeCanvas(canvasRef, mouseRef);

  // Rota la última palabra del título tras la animación de entrada.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        const el = rotWrapRef.current;
        if (!el) return;
        gsap.to(el, {
          yPercent: -100, opacity: 0, duration: 0.32, ease: "power2.in",
          onComplete: () => {
            setRotIdx((i) => (i + 1) % ROTATE_WORDS.length);
            gsap.fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
          },
        });
      }, 2600);
    }, 2200);
    return () => { clearTimeout(start); clearInterval(interval); };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-e-line", {
          y: "108%", duration: 1.1, ease: "power4.out", stagger: 0.07, delay: 0.15,
        });
        gsap.from(".hero-e-fade", {
          opacity: 0, y: 24, duration: 0.85, ease: "power3.out", stagger: 0.1, delay: 0.75,
        });
        gsap.to(contentRef.current, {
          y: -80, opacity: 0, ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top", end: "40% top", scrub: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-dvh flex-col items-start justify-end overflow-hidden pb-24 pt-28"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true };
      }}
      onMouseLeave={() => { mouseRef.current.inside = false; }}
    >
      {/* ── Showreel video background ─────────────────────────────────── */}
      <HeroBgVideo videoId={meta.showreelId} />

      {/* ── Overlay: heavier at top & bottom for nav/text readability ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(10, 10, 11, 0.2) 0%, rgba(10, 10, 11, 0.16) 30%, rgba(10, 10, 11, 0.6) 100%)",
        }}
      />

      {/* ── Forge-smoke + ember canvas ───────────────────────────────── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ width: "100%", height: "100%" }}
      />

      {/* ── Section-transition blur-fade (video + smoke blur into next section) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          zIndex: 3,
          height: 180,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(10,10,11,0.6) 45%, rgba(10,10,11,1) 78%, rgba(10,10,11,1) 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 42%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 42%)",
        }}
      />

      {/* ── Hero content ─────────────────────────────────────────────── */}
      <div ref={contentRef} className="relative z-[4] mx-auto w-full max-w-7xl px-6">
        <p className="hero-e-fade mb-8 text-xs uppercase tracking-[0.35em] text-forja-bone">
          {t("heroKicker")}
        </p>

        <h1
          className="font-display font-black uppercase leading-[0.86]"
          style={{ fontSize: "clamp(2.8rem, 8.5vw, 7.5rem)" }}
        >
          {STATIC_LINES.map((word) => (
            <span key={word} className="block overflow-hidden">
              <span className="hero-e-line block">{word}</span>
            </span>
          ))}
          <span className="block overflow-hidden">
            <span ref={rotWrapRef} className="hero-e-line fire-text block">
              {ROTATE_WORDS[rotIdx]}
            </span>
          </span>
        </h1>

        <div className="hero-e-fade mt-8 flex max-w-2xl items-stretch gap-8">
        <div className="relative w-28 shrink-0 self-stretch sm:w-36">
            <Image
              src="/assets/forja/images/f40ce8_06ce8f8811974527b879786bd5a49248~mv2.png"
              alt=""
              fill
              className="object-contain object-center"
            />
          </div>
          <p className="flex-1 text-pretty text-base text-forja-muted sm:text-lg">
            {t("heroSub")}
          </p>          
        </div>

        <div className="hero-e-fade mt-10 flex flex-wrap gap-4">
          <a
            href="#work"
            className="fire-bg inline-flex items-center rounded-full px-8 py-3.5 font-semibold text-forja-black transition-opacity hover:opacity-85"
          >
            {t("heroCtaWork")}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center rounded-full border border-forja-bone/25 px-8 py-3.5 font-semibold text-forja-bone/85 transition-all hover:border-fg hover:text-fg"
          >
            {t("heroCtaContact")}
          </a>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="hero-e-fade absolute bottom-8 left-1/2 z-[4] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <div className="h-10 w-px bg-gradient-to-b from-forja-bone/60 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-forja-muted">
          Scroll
        </span>
      </div>
    </section>
  );
}
