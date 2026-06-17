import type {
  Accent,
  LocalizedString,
  MediaItem,
  ProjectCategory,
} from "./types";
import rawData from "../../../data.json";

// ── Fuente de verdad del contenido (fallback hasta conectar WordPress) ───────
// Todo el contenido editorial + rutas de imágenes vive en `data.json` (raíz).
// Aquí solo se tipa y se reexporta; lib/wp/client.ts lo resuelve por locale.
// Cuando WP esté vivo, este JSON queda como fallback (ver lib/wp/client.ts).

export interface RawProject {
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: number;
  description: LocalizedString;
  featured: boolean;
  accent: Accent;
  videoUrl?: string;
  cover?: string;
  gallery?: MediaItem[];
}

export interface RawIP {
  slug: string;
  name: string;
  description: LocalizedString;
  accent: Accent;
  videoId: string;
}

export interface RawTeamMember {
  name: string;
  role: LocalizedString;
  initials: string;
  accent: Accent;
}

export interface RawClient {
  name: string;
  logo?: string;
}

export interface RawService {
  key: string;
  label: LocalizedString;
}

export interface SiteMetaRaw {
  tagline: string;
  descriptor: LocalizedString;
  showreelId: string;
  stats: { years: number; blacksmiths: number; projects: number };
  contact: { email: string; whatsapp: string };
  socials: { label: string; href: string }[];
}

interface ContentData {
  meta: SiteMetaRaw;
  categoryLabels: Record<ProjectCategory, LocalizedString>;
  services: RawService[];
  projects: RawProject[];
  ips: RawIP[];
  team: RawTeamMember[];
  clients: RawClient[];
}

// `as unknown as` salva el ensanchamiento de las tuplas Accent al leer JSON.
const data = rawData as unknown as ContentData;

export const meta = data.meta;
export const categoryLabels = data.categoryLabels;
export const services = data.services;
export const projects = data.projects;
export const ips = data.ips;
export const team = data.team;
export const clients = data.clients;
