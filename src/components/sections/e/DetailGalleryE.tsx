"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, Play, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MasonryColumns, type MasonryBreakpoint } from "@/components/ui/MasonryColumns";
import { resolveWpVariant } from "@/lib/wp/media";
import type { MediaItem } from "@/lib/content/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Galería interna genérica (concepto E) — portada a pantalla completa + masonry
 * + lightbox. La usan tanto el detalle de proyecto (ProjectDetailGalleryE) como
 * el de IP. Mismo lenguaje visual que la sección de proyectos del home.
 */

// Grid masonry de 4 columnas en desktop (1 / 2 / 3 / 4 según breakpoint).
const SIZES = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";

// Mismos cortes que `SIZES`, ahora en JS: el reparto de columnas lo hace
// `MasonryColumns` para que la galería se lea en horizontal (ver ese archivo).
const GALLERY_COLUMNS: MasonryBreakpoint[] = [
  { min: 1024, cols: 4 },
  { min: 768, cols: 3 },
  { min: 640, cols: 2 },
];

/** ¿Dos URLs apuntan al mismo archivo? Compara ignorando query y fragmento. */
function sameFile(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const clean = (url: string) => url.split(/[?#]/)[0];
  return clean(a) === clean(b);
}

/**
 * Miniatura de un video que no tiene póster propio: el propio `<video>` pintando
 * su primer fotograma. `#t=0.1` es un media fragment — el navegador se coloca
 * ahí y muestra ese frame como si fuera el póster.
 *
 * Es el plan B, no el camino normal: con `preload="metadata"` el navegador aún
 * descarga la cabecera y el primer keyframe (~1-2 MB por video), frente a los
 * ~80 KB de un póster. Por eso solo se monta cuando la celda se acerca al
 * viewport, y lo que toca es generar los pósters en WordPress
 * (`scripts/wp-video-posters.py`), que deja esta rama sin usar.
 */
function VideoFrameThumb({ src, width, height }: { src: string; width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="block w-full bg-forja-coal"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {near && (
        <video
          src={`${src}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          aria-hidden="true"
          className="block h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      )}
    </div>
  );
}

function MediaCell({
  item,
  alt,
  order,
  onOpen,
}: {
  item: MediaItem;
  alt: string;
  /** Posición en la galería: la entrada se escalona en orden de lectura. */
  order: number;
  onOpen: () => void;
}) {
  const w = item.width ?? 1600;
  const h = item.height ?? 900;
  const isVideo = item.type === "video";
  const thumb = isVideo ? item.poster : item.src;

  return (
    <div className="proj-cell overflow-hidden" data-order={order}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={isVideo ? "Reproducir" : "Ampliar"}
        className="group relative block w-full cursor-pointer overflow-hidden"
      >
        {thumb ? (
          <Image
            src={thumb}
            alt={alt}
            width={w}
            height={h}
            sizes={SIZES}
            className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : isVideo ? (
          <VideoFrameThumb src={item.src} width={w} height={h} />
        ) : (
          <span className="block aspect-video w-full bg-forja-coal" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
          <span
            className={`flex size-14 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-110 ${
              isVideo ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isVideo ? <Play className="size-6 fill-white" /> : <Maximize2 className="size-5" />}
          </span>
        </span>
      </button>
    </div>
  );
}

/**
 * Lightbox a pantalla completa: imagen (object-contain) o video con controles,
 * fondo borroso del propio elemento, navegación con flechas/teclado, cierre con
 * Esc o clic en el backdrop.
 */
function Lightbox({
  items,
  index,
  title,
  onClose,
  onPrev,
  onNext,
}: {
  items: MediaItem[];
  index: number;
  title: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const total = items.length;
  const item = items[index];
  const backdrop = item.type === "image" ? item.src : item.poster;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") onNext();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          aria-hidden
          fill
          // Va desenfocada al 25% de opacidad: pedir la variante grande solo
          // gastaría ancho de banda, a esta escala no se distingue.
          sizes="320px"
          className="scale-110 object-cover opacity-25 blur-2xl"
        />
      )}

      <div
        className="relative z-10 flex max-h-[88vh] max-w-[92vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video" ? (
          <video
            key={item.src}
            src={item.src}
            poster={item.poster && resolveWpVariant(item.poster, 1200)}
            controls
            autoPlay
            playsInline
            className="max-h-[88vh] max-w-[92vw]"
          />
        ) : (
          <Image
            key={item.src}
            src={item.src}
            alt={`${title} — ${index + 1}`}
            width={item.width ?? 1920}
            height={item.height ?? 1080}
            sizes="92vw"
            priority
            className="h-auto max-h-[88vh] w-auto max-w-[92vw] object-contain"
          />
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="fixed right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
      >
        <X className="size-5" />
      </button>

      {total > 1 && (
        <div className="fixed left-1/2 top-5 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs tabular-nums text-white/80 backdrop-blur-sm">
          {index + 1} / {total}
        </div>
      )}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Anterior"
            className="fixed left-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white sm:left-5"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Siguiente"
            className="fixed right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white sm:right-5"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
    </div>
  );
}

export interface DetailGalleryProps {
  /** Título principal (proyecto.title o ip.name). */
  title: string;
  /** Línea superior (p. ej. "categoría · año" o "IP Original"). */
  kicker?: string;
  description?: string;
  coverUrl?: string;
  /** URL de video para usar como portada (en vez de la imagen). Tiene prioridad. */
  coverVideoUrl?: string;
  gallery?: MediaItem[];
  /** Destino del botón "Regresar". Por defecto la sección de proyectos. */
  backHref?: string;
}

export function DetailGalleryE({
  title,
  kicker,
  description,
  coverUrl,
  coverVideoUrl,
  gallery,
  backHref = "/#work",
}: DetailGalleryProps) {
  const t = useTranslations("Common");
  const rootRef = useRef<HTMLDivElement>(null);
  const coverVideoRef = useRef<HTMLVideoElement>(null);

  const hasVideoCover = !!coverVideoUrl && coverVideoUrl.startsWith("http");

  // Miniatura del video de portada. Si ese mismo archivo está en la galería,
  // reutiliza su póster (el fotograma que le generó WordPress); si no, la
  // portada del proyecto. Es lo que rellena, desenfocado, lo que el video no
  // ocupa: el video se ve entero, nunca recortado.
  const coverBackdrop =
    (gallery ?? []).find((m) => m.type === "video" && sameFile(m.src, coverVideoUrl))?.poster ??
    coverUrl;

  // Grid = ítems de galería. Con portada de imagen se excluye esa imagen del
  // grid; con portada de video, la imagen de cover (si existe) queda de poster.
  const grid: MediaItem[] = (gallery ?? []).filter(
    (m) => hasVideoCover || m.src !== coverUrl,
  );

  // Fuerza autoplay del video de portada (algunos navegadores lo requieren
  // explícito aunque esté muted).
  useEffect(() => {
    const v = coverVideoRef.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, [coverVideoUrl]);

  // Lightbox: índice del elemento abierto (null = cerrado).
  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevLightbox = useCallback(
    () => setLightbox((p) => (p === null ? p : (p - 1 + grid.length) % grid.length)),
    [grid.length],
  );
  const nextLightbox = useCallback(
    () => setLightbox((p) => (p === null ? p : (p + 1) % grid.length)),
    [grid.length],
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".gallery-intro > *", {
          y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        });
        gsap.from(".proj-cell", {
          opacity: 0, y: 24, duration: 0.6, ease: "power2.out",
          // En el DOM las celdas van por columnas (col 1 entera, col 2…), así
          // que el escalonado se calcula con su posición real en la galería
          // para que entren en el orden en que se leen.
          stagger: (_i, el) => 0.05 * Number((el as HTMLElement).dataset.order ?? 0),
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
        href={backHref}
        aria-label={t("back")}
        className="fixed left-5 top-5 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm uppercase tracking-widest text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        <span>{t("back")}</span>
      </Link>

      {/* Portada a pantalla completa (video o imagen) + título superpuesto */}
      {hasVideoCover ? (
        <section className="relative h-dvh w-full overflow-hidden">
          {/* Fondo: la miniatura del video recortada a pantalla completa y
              desenfocada. Rellena las franjas que deja el video —que va
              `contain`, en su proporción real— sin recortarlo ni deformarlo. */}
          {coverBackdrop && (
            <Image
              src={coverBackdrop}
              alt=""
              aria-hidden
              fill
              // Va desenfocada: pedir la variante grande solo gastaría ancho de
              // banda, a esta escala no se distingue.
              sizes="320px"
              className="scale-110 object-cover blur-2xl brightness-[0.6]"
            />
          )}
          {/* El video se dimensiona a su proporción real (no se estira a la
              sección con `object-contain`: así el navegador no pinta su propio
              letterbox negro encima del fondo desenfocado). */}
          <div className="absolute inset-0 flex items-center justify-center">
            <video
              ref={coverVideoRef}
              src={coverVideoUrl}
              poster={coverBackdrop && resolveWpVariant(coverBackdrop, 1920)}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              className="max-h-full max-w-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="gallery-intro absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-14 sm:pb-20">
            {kicker && (
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/70">{kicker}</p>
            )}
            <h1
              className="font-display font-black uppercase leading-[0.9] text-white drop-shadow-xl"
              style={{ fontSize: "clamp(2.4rem, 7vw, 6rem)" }}
            >
              {title}
            </h1>
          </div>
        </section>
      ) : coverUrl ? (
        <section className="relative h-dvh w-full overflow-hidden">
          <Image
            src={coverUrl}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="gallery-intro absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-14 sm:pb-20">
            {kicker && (
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/70">{kicker}</p>
            )}
            <h1
              className="font-display font-black uppercase leading-[0.9] text-white drop-shadow-xl"
              style={{ fontSize: "clamp(2.4rem, 7vw, 6rem)" }}
            >
              {title}
            </h1>
          </div>
        </section>
      ) : (
        <section className="gallery-intro mx-auto max-w-7xl px-6 pt-28">
          {kicker && (
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-forja-muted">{kicker}</p>
          )}
          <h1
            className="font-display font-black uppercase leading-[0.9] text-forja-bone"
            style={{ fontSize: "clamp(2.4rem, 7vw, 6rem)" }}
          >
            {title}
          </h1>
        </section>
      )}

      {/* Descripción */}
      {description && (
        <div className="mx-auto max-w-7xl px-6 pt-10">
          <p className="max-w-2xl text-pretty leading-relaxed text-forja-muted">{description}</p>
        </div>
      )}

      {/* Masonry gallery */}
      {grid.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 pb-28 pt-12">
          <MasonryColumns
            className="gallery-grid"
            items={grid}
            breakpoints={GALLERY_COLUMNS}
            defaultColumns={4}
            gap="8px"
          >
            {(m, i) => (
              <MediaCell item={m} order={i} alt={`${title} — ${i + 1}`} onOpen={() => setLightbox(i)} />
            )}
          </MasonryColumns>
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && grid[lightbox] && (
        <Lightbox
          items={grid}
          index={lightbox}
          title={title}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </div>
  );
}
