"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { MediaItem, Project } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Galería interna de proyecto (concepto E) — mismo lenguaje masonry que la
 * sección de proyectos del home (ProjectsE): alturas naturales, sin recorte,
 * hover con leve zoom. Los videos se reproducen inline al pulsar el poster.
 */

const SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

function MediaCell({ item, alt }: { item: MediaItem; alt: string }) {
  const [playing, setPlaying] = useState(false);
  const w = item.width ?? 1600;
  const h = item.height ?? 900;

  if (item.type === "video") {
    return (
      <div className="proj-cell mb-2 break-inside-avoid overflow-hidden">
        {playing ? (
          <video
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            className="block h-auto w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Play"
            className="group relative block w-full overflow-hidden"
          >
            {item.poster ? (
              <Image
                src={item.poster}
                alt={alt}
                width={w}
                height={h}
                sizes={SIZES}
                className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <span className="block aspect-video w-full bg-forja-coal" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors duration-300 group-hover:bg-black/10">
              <span className="flex size-14 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Play className="size-6 fill-white" />
              </span>
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="proj-cell mb-2 break-inside-avoid overflow-hidden">
      <Image
        src={item.src}
        alt={alt}
        width={w}
        height={h}
        sizes={SIZES}
        className="block h-auto w-full"
      />
    </div>
  );
}

export function ProjectDetailGalleryE({ project }: { project: Project }) {
  const t = useTranslations("Common");
  const rootRef = useRef<HTMLDivElement>(null);

  const media: MediaItem[] =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : project.coverUrl
        ? [{ type: "image", src: project.coverUrl }]
        : [];

  // Imagen principal (portada). El resto va al grid, sin duplicar la portada.
  const cover = project.coverUrl;
  const grid = cover ? media.filter((m) => m.src !== cover) : media;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".gallery-head > *", {
          y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        });
        gsap.from(".proj-cell", {
          opacity: 0, y: 24, duration: 0.6, stagger: { each: 0.05, from: "start" }, ease: "power2.out",
          scrollTrigger: { trigger: ".gallery-grid", start: "top 88%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="min-h-screen">
      {/* Back (fijo) */}
      <Link
        href="/#work"
        aria-label={t("back")}
        className="fixed left-5 top-5 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm uppercase tracking-widest text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        <span>{t("back")}</span>
      </Link>

      {/* Imagen principal + título superpuesto */}
      <section className="gallery-head mx-auto max-w-7xl px-6 pt-24">
        {cover ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-inset ring-white/10 sm:aspect-[2.3/1]">
            <Image
              src={cover}
              alt={project.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/70">
                {project.categoryLabel} · {project.year}
              </p>
              <h1
                className="font-display font-black uppercase leading-[0.9] text-white drop-shadow-xl"
                style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
              >
                {project.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="pb-2 pt-4">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-forja-muted">
              {project.categoryLabel} · {project.year}
            </p>
            <h1
              className="font-display font-black uppercase leading-[0.9] text-forja-bone"
              style={{ fontSize: "clamp(2.4rem, 7vw, 6rem)" }}
            >
              {project.title}
            </h1>
          </div>
        )}
        {project.description && (
          <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-forja-muted">
            {project.description}
          </p>
        )}
      </section>

      {/* Masonry gallery */}
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-12">
        <div className="gallery-grid columns-1 sm:columns-2 lg:columns-3 [column-gap:8px]">
          {grid.map((m, i) => (
            <MediaCell key={i} item={m} alt={`${project.title} — ${i + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
