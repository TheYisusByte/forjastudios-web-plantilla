import { Inter, Archivo, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";

// Body font, shared across all concepts.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Concept A — Garet, the real Forja Studios brand display face (self-hosted
// from the live site: Book + Heavy). "FORGE YOUR FLAME" uses Garet Heavy.
export const garet = localFont({
  src: [
    { path: "./fonts/garet-book.woff2", weight: "400", style: "normal" },
    { path: "./fonts/garet-heavy.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-garet",
  display: "swap",
});

// Concept B — expanded variable sans display.
export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

// Concept C — elegant serif display.
export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const fontVariables = `${inter.variable} ${garet.variable} ${archivo.variable} ${playfair.variable}`;
