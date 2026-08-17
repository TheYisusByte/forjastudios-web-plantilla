"use client";

import { useEffect, useRef, useState } from "react";

import { REEL_VIDEO_SOURCES } from "@/lib/wp/videos";

const REEL_POSTER = "/assets/forja/posters/reel-poster.jpg";

/**
 * Reel a pantalla completa (100% del ancho). El video mantiene su proporción
 * (`w-full h-auto`) así que en móvil se redimensiona al ancho disponible sin
 * desbordar.
 *
 * Carga diferida de verdad: el `<video>` no recibe fuentes hasta que la sección
 * se acerca al viewport (400 px antes), así que quien no baje hasta el reel no
 * descarga ni un byte de él. Mientras tanto se ve el póster. Al salir de
 * pantalla se pausa; respeta `prefers-reduced-motion`.
 */
export function ReelE() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [sourcesReady, setSourcesReady] = useState(false);

  // 1) Monta las fuentes cuando la sección está cerca: así empieza a
  //    descargarse justo antes de verse, no al abrir la página.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSourcesReady(true);
        io.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 2) Reproduce solo mientras está en pantalla.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !sourcesReady) return;
    // Los <source> se insertaron después de montar el <video>: sin load() el
    // navegador no reintenta la selección de fuente.
    el.load();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduce) el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sourcesReady]);

  return (
    <section ref={sectionRef} id="reel" className="w-full bg-bg leading-[0]">
      <video
        ref={videoRef}
        poster={REEL_POSTER}
        muted
        loop
        playsInline
        preload="none"
        className="block h-auto w-full"
      >
        {sourcesReady &&
          REEL_VIDEO_SOURCES.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
      </video>
    </section>
  );
}
