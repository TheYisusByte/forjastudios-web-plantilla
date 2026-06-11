"use client";

import { useState } from "react";
import type { AnimatedAsset } from "@/lib/content/assets";
import { cn } from "@/lib/utils";

/**
 * Shows a light poster (first frame) and only loads the heavy animated GIF on
 * first interaction (hover or focus/click). The legacy site autoplays several
 * multi-MB gifs at once; this keeps the replica faithful but fast.
 */
export function AnimatedGif({
  asset,
  alt,
  className,
}: {
  asset: AnimatedAsset;
  alt: string;
  className?: string;
}) {
  const [play, setPlay] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setPlay(true)}
      onFocus={() => setPlay(true)}
      onClick={() => setPlay(true)}
      role="img"
      aria-label={alt}
      tabIndex={0}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={play ? asset.gif : asset.poster}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-contain"
      />
      {!play && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-forja-black/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-forja-bone">
          ▶ play
        </span>
      )}
    </div>
  );
}
