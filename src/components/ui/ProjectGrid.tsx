"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/lib/content/types";

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 36 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -36 }),
};

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (selected !== null && !el.open) el.showModal();
    else if (selected === null && el.open) el.close();
  }, [selected]);

  const open = (i: number) => { setDir(0); setSelected(i); };

  const go = useCallback((delta: number) => {
    setDir(delta);
    setSelected((s) =>
      s === null ? null : (s + delta + projects.length) % projects.length,
    );
  }, [projects.length]);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, go]);

  const project = selected !== null ? projects[selected] : null;

  return (
    <>
      {/* ── Full-width grid — no gap, no radius, edge-to-edge ──────────── */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => open(i)}
            aria-haspopup="dialog"
            className="group relative overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
          >
            {/* Background: real image when available, gradient fallback */}
            {p.coverUrl ? (
              <Image
                src={p.coverUrl}
                alt={p.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div
                className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})`,
                }}
              />
            )}
            {/* Bottom scrim for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-forja-black/80 via-forja-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {/* Labels — visible on hover */}
            <div className="relative flex aspect-video flex-col justify-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="mb-1 text-xs uppercase tracking-[0.18em] text-forja-bone/60">
                {p.categoryLabel} · {p.year}
              </span>
              <h3 className="font-display text-lg font-bold uppercase leading-tight drop-shadow-lg">
                {p.title}
              </h3>
              <p className="mt-0.5 text-sm text-forja-bone/70">{p.client}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <dialog
        ref={dialogRef}
        aria-labelledby="lb-title"
        onClose={() => setSelected(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        className="m-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface p-0 text-fg shadow-2xl backdrop:bg-forja-black/85 backdrop:backdrop-blur-md"
      >
        <AnimatePresence mode="wait" custom={dir}>
          {project && (
            <motion.div
              key={project.slug}
              custom={dir}
              variants={reduce ? {} : slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Banner */}
              {project.coverUrl ? (
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={project.coverUrl}
                    alt={project.title}
                    fill
                    sizes="672px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="h-52 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${project.accent[0]}, ${project.accent[1]})`,
                  }}
                />
              )}

              {/* Body */}
              <div className="px-8 py-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.18em] text-fg-muted">
                      {project.categoryLabel} · {project.year}
                    </span>
                    <h2
                      id="lb-title"
                      className="font-display mt-1 text-3xl font-bold uppercase"
                    >
                      {project.title}
                    </h2>
                    <p className="mt-1 text-sm text-fg-muted">{project.client}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Cerrar"
                    className="mt-1 shrink-0 cursor-pointer rounded-full border border-border p-2 transition-colors hover:bg-border"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <p className="mt-6 text-pretty leading-relaxed text-fg-muted">
                  {project.description}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="tabular-nums text-xs text-fg-muted">
                    {(selected ?? 0) + 1} / {projects.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label="Proyecto anterior"
                      className="cursor-pointer rounded-full border border-border p-2 transition-colors hover:bg-border"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      aria-label="Proyecto siguiente"
                      className="cursor-pointer rounded-full border border-border p-2 transition-colors hover:bg-border"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
    </>
  );
}
