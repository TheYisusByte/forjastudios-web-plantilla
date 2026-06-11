import "server-only";
import type { Locale } from "@/i18n/routing";
import type { SiteContent } from "@/lib/content/types";
import {
  categoryLabels,
  clients,
  ips,
  meta,
  projects,
  services,
  team,
} from "@/lib/content/data";
import { forjaAssets } from "@/lib/content/assets";

const projectCovers: Record<string, string> = {
  "india-catalina": forjaAssets.heroKeyArt,
  "carameloki": forjaAssets.caramelokiStill,
};

/**
 * Single entry point for site content.
 *
 * Today it resolves the typed mock data for the active locale. When WordPress
 * is live (doc 03), this is the only place that changes: fetch WPGraphQL with
 * the queries in ./queries.ts and map the response into `SiteContent`. The
 * shape returned here stays identical, so no component needs to change.
 */
export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  return {
    meta: {
      tagline: meta.tagline,
      descriptor: meta.descriptor[locale],
      stats: meta.stats,
      contact: meta.contact,
      socials: meta.socials,
      showreelId: meta.showreelId,
    },
    services: services.map((s) => ({ key: s.key, label: s.label[locale] })),
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      client: p.client,
      category: p.category,
      categoryLabel: categoryLabels[p.category][locale],
      year: p.year,
      description: p.description[locale],
      featured: p.featured,
      accent: p.accent,
      videoUrl: p.videoUrl,
      coverUrl: projectCovers[p.slug],
    })),
    ips: ips.map((ip) => ({
      slug: ip.slug,
      name: ip.name,
      description: ip.description[locale],
      accent: ip.accent,
    })),
    team: team.map((m) => ({
      name: m.name,
      role: m.role[locale],
      initials: m.initials,
      accent: m.accent,
    })),
    clients: clients.map((name) => ({ name })),
  };
}
