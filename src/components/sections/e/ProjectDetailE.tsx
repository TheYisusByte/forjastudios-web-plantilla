"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ChevronUp, ChevronDown, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { MediaItem, Project } from "@/lib/content/types";

/**
 * Página interna de proyecto (concepto E).
 * Visor a pantalla completa: el elemento activo (imagen o video) ocupa el 100%
 * de la pantalla (mostrado completo, sin recortes, con fondo desenfocado de sí
 * mismo para que nunca se vea negro). A la derecha-abajo, un riel VERTICAL de
 * miniaturas que se desplaza y permite saltar a cualquier posición; al cambiar,
 * el elemento seleccionado pasa a pantalla completa. Los videos no se reproducen
 * solos (controles manuales).
 */
export function ProjectDetailE({ project }: { project: Project }) {
  const media: MediaItem[] =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : project.coverUrl
        ? [{ type: "image", src: project.coverUrl }]
        : [];

  const total = media.length;
  const [active, setActive] = useState(0);
  const [showPlay, setShowPlay] = useState(true);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => setActive((p) => (p + dir + total) % total),
    [total],
  );

  // Flechas del teclado para navegar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") go(1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Desplaza la miniatura activa para mantenerla visible y reinicia el play.
  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setShowPlay(true);
  }, [active]);

  if (total === 0) return null;

  const current = media[active];
  const backdrop = current.type === "image" ? current.src : current.poster;
  const thumbSrc = (m: MediaItem) =>
    (m.type === "image" ? m.src : m.poster) ?? project.coverUrl ?? "";

  return (
    <div className="fixed inset-0 overflow-hidden bg-bg">
      {/* ── Elemento activo a pantalla completa ─────────────────────────────── */}
      <div className="absolute inset-0">
        {backdrop && (
          <Image
            src={backdrop}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="scale-110 object-cover blur-2xl brightness-[0.45]"
          />
        )}
        {current.type === "video" ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <video
              key={current.src}
              ref={videoRef}
              src={current.src}
              poster={current.poster}
              controls
              playsInline
              preload="metadata"
              onPlay={() => setShowPlay(false)}
              onPause={() => setShowPlay(true)}
              onEnded={() => setShowPlay(true)}
              className="max-h-full max-w-full"
            />
            {showPlay && (
              <button
                type="button"
                onClick={() => videoRef.current?.play()}
                aria-label="Reproducir"
                className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform hover:scale-110"
              >
                <Play className="size-8 fill-white" />
              </button>
            )}
          </div>
        ) : (
          <Image
            key={current.src}
            src={current.src}
            alt={`${project.title} — ${active + 1}`}
            fill
            sizes="100vw"
            priority
            className="z-10 object-contain"
          />
        )}
      </div>

      {/* ── Volver ──────────────────────────────────────────────────────────── */}
      <Link
        href="/#work"
        aria-label="Volver"
        className="fixed left-5 top-5 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm uppercase tracking-widest text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        <span className="hidden sm:inline">Proyectos</span>
      </Link>

      {/* ── Título ──────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed left-6 top-20 z-30 max-w-[60vw] sm:left-14 sm:top-24">
        <h1
          className="font-display font-black uppercase leading-[0.9] text-white drop-shadow-2xl"
          style={{ fontSize: "clamp(2.2rem, 6.5vw, 6rem)" }}
        >
          {project.title}
        </h1>
        {total > 1 && (
          <p className="mt-3 text-sm tabular-nums text-white/70">
            {active + 1} / {total}
          </p>
        )}
      </div>

      {/* ── Riel vertical de miniaturas (abajo derecha) ─────────────────────── */}
      {total > 1 && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2">
          <button
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
          >
            <ChevronUp className="size-4" />
          </button>

          <div className="flex max-h-[58vh] w-24 flex-col gap-2 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:w-28 [&::-webkit-scrollbar]:hidden">
            {media.map((m, i) => (
              <button
                key={i}
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                onClick={() => setActive(i)}
                aria-label={`Ver elemento ${i + 1}`}
                aria-current={i === active}
                className={`group relative aspect-video w-full shrink-0 overflow-hidden rounded-md border transition-all ${
                  i === active
                    ? "border-forja-amber ring-2 ring-forja-amber"
                    : "border-white/15 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={thumbSrc(m)} alt="" fill sizes="120px" className="object-cover" />
                {m.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="size-4 fill-white text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
