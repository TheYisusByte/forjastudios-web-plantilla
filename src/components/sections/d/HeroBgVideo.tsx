"use client";

import { useEffect, useRef, useState } from "react";

interface YTPlayer {
  playVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function HeroBgVideo({
  videoId,
  mobileAnchorRight = false,
}: {
  videoId: string;
  /** En móvil ancla el video a la derecha (se corre a la izquierda) para que
   *  el borde derecho quede visible en lugar de recortar ambos lados. */
  mobileAnchorRight?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  // Stays false until the video is confirmed playing — keeps a solid cover
  // over the iframe so the YT loading UI / pause indicator never shows.
  const [playing, setPlaying] = useState(false);
  const [anchorRight, setAnchorRight] = useState(false);

  // Activa el anclaje a la derecha solo en viewports móviles (<640px).
  useEffect(() => {
    if (!mobileAnchorRight) return;
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setAnchorRight(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [mobileAnchorRight]);

  useEffect(() => {
    let active = true;

    function initPlayer() {
      if (!active || !wrapRef.current) return;

      playerRef.current = new window.YT!.Player(wrapRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => e.target.playVideo(),
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            if (e.data === 1 && active) {
              // State 1 = PLAYING — reveal the video with a short delay so any
              // transition flash is fully gone before we fade the cover out.
              setTimeout(() => { if (active) setPlaying(true); }, 400);
            }
            if (e.data === 0) {
              // State 0 = ENDED — restart immediately.
              e.target.seekTo(0);
              e.target.playVideo();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("yt-api")) {
        const s = document.createElement("script");
        s.id = "yt-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      active = false;
      playerRef.current?.destroy();
    };
  }, [videoId]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* iframe container — kept behind the cover until playing=true */}
      <div
        ref={wrapRef}
        className="absolute [&>iframe]:border-none [&>iframe]:pointer-events-none"
        style={{
          top: "50%",
          // `right` negativo corre el encuadre hacia la izquierda (muestra
          // contenido más central) sin dejar hueco. Ajustable: más negativo
          // = más a la izquierda.
          ...(anchorRight
            ? { right: "-38vw", transform: "translateY(-50%)" }
            : { left: "50%", transform: "translate(-50%, -50%)" }),
          width: "max(100%, calc(100vh * 16 / 9))",
          height: "max(100%, calc(100vw * 9 / 16))",
        }}
      />

      {/*
        Solid cover that matches the site background. Fades to transparent
        once the video is playing. Prevents the YouTube loading spinner,
        pause indicator, and any control flash from ever reaching the user.
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
