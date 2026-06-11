"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatedGif } from "@/components/ui/AnimatedGif";
import { forjaAssets } from "@/lib/content/assets";
import type { AnimatedAsset } from "@/lib/content/assets";
import type { Project } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GIFS: AnimatedAsset[] = [
  forjaAssets.anim.illustration,
  forjaAssets.anim.ip,
  forjaAssets.anim.projects,
  forjaAssets.anim.contact,
  forjaAssets.anim.team,
  forjaAssets.anim.illustration,
];

const SIZES = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
] as const;

type Size = (typeof SIZES)[number];

interface GridItem {
  project: Project;
  gif: AnimatedAsset;
  size: Size;
}

function buildItems(projects: Project[], randomize: boolean): GridItem[] {
  const p = randomize ? [...projects].sort(() => Math.random() - 0.5) : [...projects];
  const g = randomize ? [...GIFS].sort(() => Math.random() - 0.5) : [...GIFS];
  return p.map((project, i) => ({
    project,
    gif: g[i % g.length],
    size: SIZES[i % SIZES.length],
  }));
}

// ── Card — hover info only, no per-card torch ────────────────────────────────

function ProjectCard({ project, gif }: { project: Project; gif: AnimatedAsset }) {
  return (
    <div className="group relative h-full w-full overflow-hidden">
      {/* Media */}
      <div className="e-img absolute inset-0">
        <AnimatedGif asset={gif} alt={project.title} className="h-full w-full" />
      </div>

      {/* Base scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Category tag */}
      <div className="absolute left-4 top-4 z-10">
        <span className="rounded-full bg-black/50 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70 backdrop-blur-sm">
          {project.categoryLabel}
        </span>
      </div>

      {/* Static bottom info — fades out on hover */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 transition-opacity duration-300 group-hover:opacity-0">
        <p className="font-display text-base font-bold uppercase leading-tight text-white">
          {project.title}
        </p>
        <p className="text-xs text-white/55">{project.client}</p>
      </div>

      {/* Hover overlay — slides up from bottom (TeamE style) */}
      <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-black/96 via-black/65 to-transparent pb-5 pl-5 pr-5 pt-14 transition-transform duration-400 ease-out group-hover:translate-y-0">
        <div className="mb-1 h-px bg-gradient-to-r from-amber-400 via-orange-500 to-transparent" />
        <p
          className="mt-3 font-display font-black uppercase leading-tight text-white"
          style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.25rem)" }}
        >
          {project.title}
        </p>
        <p className="mt-0.5 text-sm text-white/60">
          {project.client}&nbsp;·&nbsp;{project.year}
        </p>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface ProjectsEProps {
  projects: Project[];
}

export function ProjectsE({ projects }: ProjectsEProps) {
  const t = useTranslations("ConceptE");
  const sectionRef  = useRef<HTMLElement>(null);
  const torchWrap   = useRef<HTMLDivElement>(null);   // fade wrapper
  const torchGlow   = useRef<HTMLDivElement>(null);   // gradient that tracks mouse
  const [items, setItems] = useState<GridItem[]>(() => buildItems(projects, false));

  useEffect(() => {
    setItems(buildItems(projects, true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mouse tracking — direct DOM manipulation, no re-renders
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

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".projects-e-heading > *", {
          y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        });
        gsap.from(".project-e-cell", {
          opacity: 0, duration: 0.5, stagger: { each: 0.05, from: "random" }, ease: "power2.out",
          scrollTrigger: { trigger: ".project-e-grid", start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="work" className="relative bg-forja-coal">
      {/* Heading */}
      <div className="projects-e-heading mx-auto max-w-7xl px-6 pb-10 pt-36">
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

      {/* Grid wrapper — torch lives here at section level */}
      <div
        className="project-e-grid relative grid grid-cols-2 sm:grid-cols-3"
        style={{ gridAutoRows: "clamp(200px, 26vw, 340px)", gridAutoFlow: "dense" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {items.map(({ project, gif, size }) => (
          <div
            key={project.slug}
            className={`project-e-cell ${size} relative overflow-hidden`}
          >
            <ProjectCard project={project} gif={gif} />
          </div>
        ))}

        {/* ── Section-level torch — one glow across the whole grid ── */}
        <div
          ref={torchWrap}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{ opacity: 0, transition: "opacity 0.35s ease" }}
        >
          <div
            ref={torchGlow}
            className="animate-candle-flicker absolute inset-0"
            style={{
              background:
                "radial-gradient(circle 280px at var(--mx, 50%) var(--my, 50%), rgba(255,148,38,0.85) 0%, rgba(224,80,28,0.45) 38%, transparent 68%)",
              "--flicker-dur":   "3.4s",
              "--flicker-delay": "0s",
            } as React.CSSProperties}
          />
        </div>
      </div>
    </section>
  );
}
