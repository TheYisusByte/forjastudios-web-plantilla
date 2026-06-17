"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { MediaItem, Project } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GAP = 8; // px entre imágenes (filas justificadas)

// ── Helpers de cover / aspecto ───────────────────────────────────────────────

function coverOf(p: Project): { src?: string; w: number; h: number } {
  const m: MediaItem | undefined = p.gallery?.find((g) => g.type === "image");
  const src = p.coverUrl ?? m?.src;
  const w = m?.width ?? 1600;
  const h = m?.height ?? 900;
  return { src, w, h };
}

function aspectOf(p: Project): number {
  const { w, h } = coverOf(p);
  return w / h;
}

// ── Card (overlay de título compartido) ──────────────────────────────────────

function CardOverlay({ title }: { title: string }) {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <div className="mb-2 h-px w-12 bg-gradient-to-r from-amber-400 via-orange-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <p className="font-display text-base font-bold uppercase leading-tight text-white drop-shadow-lg">
          {title}
        </p>
      </div>
    </>
  );
}

// ── Layout: Masonry (CSS columns, alturas naturales, sin recorte) ────────────

function Masonry({ projects }: { projects: Project[] }) {
  return (
    <div className="columns-3 xl:columns-4 [column-gap:8px]">
      {projects.map((p) => {
        const c = coverOf(p);
        return (
          <Link
            key={p.slug}
            href={`/concepto-e/proyecto/${p.slug}`}
            className="project-e-cell group relative mb-2 block break-inside-avoid overflow-hidden"
          >
            {c.src ? (
              <Image
                src={c.src}
                alt={p.title}
                width={c.w}
                height={c.h}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div
                className="aspect-[4/3] w-full"
                style={{ background: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})` }}
              />
            )}
            <CardOverlay title={p.title} />
          </Link>
        );
      })}
    </div>
  );
}

// ── Layout: Filas justificadas (altura común por fila, sin recorte) ──────────

interface JCell {
  project: Project;
  src?: string;
  w: number;
  h: number;
}

function Justified({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const rows = useMemo<JCell[][]>(() => {
    if (width <= 0) return [];
    const targetH = width < 640 ? 200 : width < 1024 ? 280 : 340;
    const out: JCell[][] = [];
    let row: Project[] = [];
    let arSum = 0;
    const flush = (last: boolean) => {
      if (!row.length) return;
      const gaps = (row.length - 1) * GAP;
      let h = (width - gaps) / arSum;
      if (last) h = Math.min(h, targetH); // última fila: no agrandar de más
      out.push(
        row.map((p) => {
          const ar = aspectOf(p);
          return { project: p, src: coverOf(p).src, w: ar * h, h };
        }),
      );
      row = [];
      arSum = 0;
    };
    for (const p of projects) {
      row.push(p);
      arSum += aspectOf(p);
      const gaps = (row.length - 1) * GAP;
      if (arSum * targetH + gaps >= width) flush(false);
    }
    flush(true);
    return out;
  }, [projects, width]);

  return (
    <div ref={ref} className="flex flex-col" style={{ gap: GAP }}>
      {rows.map((row, ri) => (
        <div key={ri} className="flex" style={{ gap: GAP }}>
          {row.map((cell) => (
            <Link
              key={cell.project.slug}
              href={`/concepto-e/proyecto/${cell.project.slug}`}
              className="project-e-cell group relative block shrink-0 overflow-hidden"
              style={{ width: cell.w, height: cell.h }}
            >
              {cell.src ? (
                <Image
                  src={cell.src}
                  alt={cell.project.title}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${cell.project.accent[0]}, ${cell.project.accent[1]})`,
                  }}
                />
              )}
              <CardOverlay title={cell.project.title} />
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Sección ──────────────────────────────────────────────────────────────────

export function ProjectsE({ projects }: { projects: Project[] }) {
  const t = useTranslations("ConceptE");
  const sectionRef = useRef<HTMLElement>(null);
  const [order, setOrder] = useState<Project[]>(projects);
  const [layout, setLayout] = useState<0 | 1>(0);

  // En cliente: baraja el orden y elige uno de los 2 layouts al azar.
  // (Solo en cliente para no romper la hidratación con valores aleatorios.)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setOrder([...projects].sort(() => Math.random() - 0.5));
    setLayout(Math.floor(Math.random() * 2) as 0 | 1);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [projects]);

  // Reveal del título — corre UNA sola vez (como el de clientes); nunca se
  // re-ejecuta al cambiar de layout, así el título no se queda invisible.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".projects-e-heading > *", {
          y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  // Reveal de las celdas — sí se re-ejecuta cuando cambia el layout.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".project-e-cell", {
          opacity: 0, duration: 0.5, stagger: { each: 0.04, from: "random" }, ease: "power2.out",
          scrollTrigger: { trigger: ".project-e-grid", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [layout] },
  );

  return (
    <section ref={sectionRef} id="work" className="relative bg-forja-coal py-24">
      <div className="projects-e-heading mx-auto max-w-7xl px-6 pb-20">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-forja-muted">
          {t("projectsTitle")}
        </p>
        <h2
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: "clamp(2.6rem, 6.5vw, 5.5rem)" }}
        >
          <span className="block text-forja-bone">{t("projectsHeading1")}</span>
          <span className="fire-text block">{t("projectsHeading2")}</span>
        </h2>
      </div>

      <div className="project-e-grid">
        {layout === 0 ? <Masonry projects={order} /> : <Justified projects={order} />}
      </div>
    </section>
  );
}
