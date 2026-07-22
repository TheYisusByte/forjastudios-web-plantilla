"use client";

import { useEffect, useRef } from "react";

const REEL_URL =
  "https://wzfwvbfikmgkjeay.public.blob.vercel-storage.com/REEL%20FORJA%20STUDIOS%20ANIMACIO%CC%81N%202023.mp4";

/**
 * Reel a pantalla completa (100% del ancho). El video mantiene su proporción
 * (`w-full h-auto`) así que en móvil se redimensiona al ancho disponible sin
 * desbordar. Solo carga/reproduce al entrar en viewport (el archivo pesa ~22MB)
 * y se pausa al salir; respeta `prefers-reduced-motion`.
 */
export function ReelE() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
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
  }, []);

  return (
    <section id="reel" className="w-full bg-bg leading-[0]">
      <video
        ref={videoRef}
        src={REEL_URL}
        muted
        loop
        playsInline
        preload="metadata"
        className="block h-auto w-full"
      />
    </section>
  );
}
