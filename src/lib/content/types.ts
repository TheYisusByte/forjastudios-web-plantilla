import type { Locale } from "@/i18n/routing";

/** A string available in every supported locale. */
export type LocalizedString = Record<Locale, string>;

export type ProjectCategory =
  | "animation-2d"
  | "animation-3d"
  | "vfx"
  | "concept-art"
  | "game"
  | "illustration";

/** Two-stop gradient seed used for placeholder art until real assets arrive. */
export type Accent = readonly [string, string];

// ── Resolved shapes (strings already in the active locale) ───────────────
// Components consume these. They mirror the future WPGraphQL response so the
// swap from mock to CMS only touches lib/wp/client.ts.

export interface Project {
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  categoryLabel: string;
  year: number;
  description: string;
  featured: boolean;
  accent: Accent;
  videoUrl?: string;
  /** Real thumbnail extracted from the legacy site. Falls back to accent gradient. */
  coverUrl?: string;
}

export interface IP {
  slug: string;
  name: string;
  description: string;
  accent: Accent;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  accent: Accent;
}

export interface Client {
  name: string;
}

export interface Service {
  key: string;
  label: string;
}

export interface SiteMeta {
  tagline: string;
  descriptor: string;
  stats: { years: number; blacksmiths: number; projects: number };
  contact: { email: string; whatsapp: string };
  socials: { label: string; href: string }[];
  /** YouTube video id for the studio showreel (channel @ForjaCollective). */
  showreelId: string;
}

export interface SiteContent {
  meta: SiteMeta;
  services: Service[];
  projects: Project[];
  ips: IP[];
  team: TeamMember[];
  clients: Client[];
}
