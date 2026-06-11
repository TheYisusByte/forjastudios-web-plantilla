"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface YouTubeEmbedProps {
  id: string;
  title?: string;
}

/**
 * Lazy YouTube embed: shows a thumbnail poster with a fire play button.
 * Swaps in the iframe (with autoplay) only on click — avoids loading
 * YouTube scripts until the user explicitly requests playback.
 */
export function YouTubeEmbed({ id, title = "Video" }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-forja-carbon">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir ${title}`}
          className="group relative h-full w-full cursor-pointer"
        >
          {/* Thumbnail from YouTube CDN — raw <img> intentionally avoids remotePatterns */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
            alt={title}
            className="h-full w-full object-cover"
          />
          {/* Scrim */}
          <div className="absolute inset-0 bg-forja-black/45 transition-colors duration-300 group-hover:bg-forja-black/25" />
          {/* Fire play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="fire-bg flex h-20 w-20 items-center justify-center rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-1.5 size-8 fill-forja-black text-forja-black" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
