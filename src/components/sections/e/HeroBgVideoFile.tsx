"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fondo de video del hero servido como archivo (.webm/.mp4) en lugar de un
 * iframe de YouTube. Encuadre "cover": el video llena el hero al 100% y se
 * recorta con `object-fit: cover`. `object-position` controla qué franja se ve
 * — útil en móvil (portrait), donde un video 16:9 se recorta a los lados.
 */
export function HeroBgVideoFile({
  src,
  poster,
  objectPosition = "center",
  mobileObjectPosition,
}: {
  src: string;
  poster?: string;
  /** Encuadre horizontal por defecto (desktop/tablet). Ej: "center", "70% center". */
  objectPosition?: string;
  /** Encuadre en móvil (<640px). Si se omite, usa `objectPosition` en todos lados.
   *  Ej: "25% center" muestra la franja izquierda; "75% center" la derecha. */
  mobileObjectPosition?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Permanece false hasta que el video se está reproduciendo — mantiene una
  // cubierta sólida sobre el <video> para que ningún flash de carga se vea.
  const [playing, setPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta viewports móviles solo si hay un encuadre móvil distinto.
  useEffect(() => {
    if (!mobileObjectPosition) return;
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [mobileObjectPosition]);

  // Fuerza autoplay (algunos navegadores requieren play() explícito tras montar).
  useEffect(() => {
    videoRef.current?.play().catch(() => {
      /* autoplay bloqueado: el video queda pausado; la cubierta se mantiene */
    });
  }, []);

  const pos = isMobile && mobileObjectPosition ? mobileObjectPosition : objectPosition;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlaying={() => {
          // Revela el video con un pequeño retardo para que cualquier flash
          // de transición desaparezca antes de desvanecer la cubierta.
          setTimeout(() => setPlaying(true), 400);
        }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: pos }}
      />

      {/*
        Cubierta sólida que iguala el fondo del sitio. Se desvanece a
        transparente una vez el video se reproduce, evitando cualquier flash
        de carga.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0A0A0B",
          opacity: playing ? 0 : 1,
          transition: playing ? "opacity 0.8s ease" : "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
