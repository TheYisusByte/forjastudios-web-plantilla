"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { VideoSource } from "@/lib/wp/videos";

/** Viewports estrechos: ahí el video ni se descarga (datos móviles) . */
const MOBILE_MQ = "(max-width: 639px)";
const REDUCE_MQ = "(prefers-reduced-motion: reduce)";

/** Suscribe a varias media queries a la vez; sirve para `useSyncExternalStore`. */
function subscribeMedia(queries: string[]) {
  return (onChange: () => void) => {
    const mqs = queries.map((q) => window.matchMedia(q));
    mqs.forEach((mq) => mq.addEventListener("change", onChange));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", onChange));
  };
}

const subscribeToMobile = subscribeMedia([MOBILE_MQ]);
const subscribeToEnvironment = subscribeMedia([MOBILE_MQ, REDUCE_MQ]);

const isMobileNow = () => window.matchMedia(MOBILE_MQ).matches;

/**
 * ¿Vale la pena descargar el video? En móvil no: son varios MB de datos móviles
 * para un fondo que además se recorta a una franja estrecha. Tampoco con el
 * ahorro de datos, con conexión 2G ni si se pidió menos movimiento.
 */
function shouldLoadVideo(): boolean {
  if (window.matchMedia(MOBILE_MQ).matches) return false;
  if (window.matchMedia(REDUCE_MQ).matches) return false;
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (conn?.saveData === true) return false;
  return !/^(slow-)?2g$/.test(conn?.effectiveType ?? "");
}

/** En el servidor no se sabe nada del dispositivo: el HTML sale con el póster. */
const serverFalse = () => false;

/**
 * Fondo de video del hero servido como archivo (.mp4/.webm) en lugar de un
 * iframe de YouTube. Encuadre "cover": el video llena el hero al 100% y se
 * recorta con `object-fit: cover`. `object-position` controla qué franja se ve
 * — útil en móvil (portrait), donde un video 16:9 se recorta a los lados.
 *
 * El video pesa varios MB, así que solo se monta cuando tiene sentido gastarlos
 * (ver `shouldLoadVideo`). En el resto de casos se queda el póster, una imagen
 * de ~130 KB, y no se descarga nada más.
 */
export function HeroBgVideoFile({
  sources,
  poster,
  objectPosition = "center",
  mobileObjectPosition,
}: {
  /** Fuentes en orden de preferencia; el navegador elige la primera que soporta. */
  sources: VideoSource[];
  /** Imagen de respaldo: se ve al instante y es lo único que carga en móvil. */
  poster?: string;
  /** Encuadre horizontal por defecto (desktop/tablet). Ej: "center", "70% center". */
  objectPosition?: string;
  /** Encuadre en móvil (<640px). Si se omite, usa `objectPosition` en todos lados.
   *  Ej: "25% center" muestra la franja izquierda; "75% center" la derecha. */
  mobileObjectPosition?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Permanece false hasta que el video se está reproduciendo — mantiene el
  // póster visible para que ningún flash de carga se vea.
  const [playing, setPlaying] = useState(false);

  const isMobile = useSyncExternalStore(subscribeToMobile, isMobileNow, serverFalse);
  const loadVideo = useSyncExternalStore(subscribeToEnvironment, shouldLoadVideo, serverFalse);

  // Fuerza autoplay (algunos navegadores requieren play() explícito tras montar).
  useEffect(() => {
    if (!loadVideo) return;
    videoRef.current?.play().catch(() => {
      /* autoplay bloqueado: el video queda pausado; se ve el póster */
    });
  }, [loadVideo]);

  const pos = isMobile && mobileObjectPosition ? mobileObjectPosition : objectPosition;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Póster: se pinta de inmediato y es el fondo definitivo cuando no hay
          video (móvil, reduced-motion, ahorro de datos). */}
      {poster ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${poster})`, backgroundPosition: pos }}
        />
      ) : (
        // Sin póster: cubierta sólida del color del sitio, que se desvanece
        // cuando el video arranca. Evita el flash de carga.
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundColor: "#0A0A0B",
            opacity: playing ? 0 : 1,
            transition: playing ? "opacity 0.8s ease" : "none",
          }}
        />
      )}

      {loadVideo && (
        <video
          ref={videoRef}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlaying={() => {
            // Revela el video con un pequeño retardo para que cualquier flash
            // de transición desaparezca antes de descubrirlo del todo.
            setTimeout(() => setPlaying(true), 400);
          }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: pos, opacity: playing ? 1 : 0, transition: "opacity 0.6s ease" }}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}
    </div>
  );
}
