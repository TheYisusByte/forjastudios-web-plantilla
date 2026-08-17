"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Intro animado de marca que tapa la home mientras se reproduce.
 * ---------------------------------------------------------------------------
 * Se muestra UNA VEZ POR SESIÓN: quien entra, navega a un proyecto y vuelve a la
 * home no lo vuelve a ver; al cerrar la pestaña se reinicia.
 *
 * El overlay va en el HTML estático (no montado desde un efecto) para que tape
 * la página desde el primer paint, sin que se vea la web un instante antes. La
 * decisión de saltarlo la toma un script inline del layout ANTES de pintar
 * —React tarda demasiado para eso— marcando `data-intro="skip"` en el <html>;
 * el CSS de `globals.css` lo oculta con esa marca. Aquí solo se reacciona.
 *
 * Hay varios clips y se alternan (ver `CLIPS`): el elegido se asigna al
 * `<video>` ya en el cliente, con `preload="none"`, y solo se descarga al
 * llamar a `play()`. Quien ya vio el intro —o pidió menos animación— no
 * descarga nada, aunque el elemento siga en el DOM. Mientras se elige, el
 * overlay es negro sólido, que es justo como arrancan los clips.
 *
 * Nunca puede dejar la web inaccesible: se salta con un clic, con cualquier
 * tecla, si el navegador bloquea el autoplay, si el video no carga a tiempo o si
 * se agota el margen de seguridad.
 */

/** Clave de sesión: marca que este visitante ya vio el intro. */
const SEEN_KEY = "forja:intro";

/** Clave persistente: índice del último clip mostrado, para ir alternando. */
const LAST_CLIP_KEY = "forja:intro:clip";

/** Marca en <html> que apaga el overlay (la pone también el script del layout). */
const SKIP_ATTR = "skip";

/**
 * Clips del intro. Se alternan: cada visita ve el siguiente al que vio la
 * anterior, así quien vuelve al sitio no se encuentra siempre el mismo. Añadir
 * uno nuevo es añadir una entrada aquí (y su archivo en `public/`).
 */
const CLIPS = [
  {
    src: "/assets/forja/intro/forja-intro.mp4",
    poster: "/assets/forja/intro/forja-intro-poster.jpg",
  },
  {
    src: "/assets/forja/intro/forja-intro-2.mp4",
    poster: "/assets/forja/intro/forja-intro-2-poster.jpg",
  },
] as const;

/** Índice del clip a mostrar: el siguiente al último visto. */
function nextClipIndex(): number {
  const random = () => Math.floor(Math.random() * CLIPS.length);
  try {
    const raw = localStorage.getItem(LAST_CLIP_KEY);
    const last = raw === null ? Number.NaN : Number.parseInt(raw, 10);
    const next = Number.isInteger(last) ? (last + 1) % CLIPS.length : random();
    localStorage.setItem(LAST_CLIP_KEY, String(next));
    return next;
  } catch {
    // Modo privado o storage bloqueado: al azar, que para el caso vale igual.
    return random();
  }
}

/** Duración del clip más largo (3,4 s) + margen por si se atasca el buffering. */
const MAX_MS = 6000;

/** Si el video no llega ni a poder reproducirse en este tiempo, no se muestra. */
const READY_TIMEOUT_MS = 3000;

/** Duración del fundido de salida; debe coincidir con la transición del CSS. */
const FADE_MS = 600;

export function IntroOverlay() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const finished = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const t = useTranslations("Intro");

  // Idempotente: da igual cuántas de las salidas lo llamen, ni cuántas veces.
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setLeaving(true);
    window.setTimeout(() => {
      document.documentElement.dataset.intro = SKIP_ATTR; // libera el scroll
      setGone(true);
    }, FADE_MS);
  }, []);

  useEffect(() => {
    // El script del layout ya decidió saltarlo (sesión repetida o
    // prefers-reduced-motion). El CSS lo mantiene oculto y, sin `src`, el video
    // nunca se descarga: no hay nada que hacer.
    if (document.documentElement.dataset.intro === SKIP_ATTR) return;

    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Modo privado o storage bloqueado: se verá en cada carga, no es grave.
    }

    const video = videoRef.current;
    if (!video) {
      finish();
      return;
    }

    // El clip se elige aquí, no en el render: el HTML estático no compromete a
    // ninguno y quien salte el intro no descarga nada.
    const clip = CLIPS[nextClipIndex()];
    video.poster = clip.poster;
    video.src = clip.src;

    // Red de seguridad 1: el video no llega a estar listo (conexión lenta).
    const readyTimer = window.setTimeout(() => {
      if (video.readyState < 3) finish();
    }, READY_TIMEOUT_MS);

    // Red de seguridad 2: empezó pero se atascó y `ended` nunca llega.
    const maxTimer = window.setTimeout(finish, MAX_MS);

    // Autoplay bloqueado (política del navegador) → saltar en vez de congelar.
    void video.play().catch(finish);

    const onKey = () => finish();
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [finish]);

  if (gone) return null;

  return (
    <div
      className={`intro-overlay${leaving ? " is-leaving" : ""}`}
      onClick={finish}
      role="presentation"
      aria-hidden="true"
    >
      {/* `src` y `poster` los pone el efecto con el clip elegido. */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="none"
        onEnded={finish}
        onError={finish}
        className="h-full w-full object-cover"
      />
      <button type="button" onClick={finish} className="intro-skip">
        {t("skip")}
      </button>
    </div>
  );
}
