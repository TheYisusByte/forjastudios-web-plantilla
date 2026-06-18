import type { SiteMeta } from "@/lib/content/types";

const GIF = "/assets/forja/gifs";

export type AboutStatKey = "blacksmiths" | "projects" | "years";

export interface AboutStat {
  key: AboutStatKey;
  value: number;
  /** Animated forge illustration paired with this number. */
  gif: string;
}

/**
 * The three "forge in numbers" stats, in display order, each paired with its
 * animated GIF. Values come from the CMS-backed site meta so they stay in sync.
 */
export function buildAboutStats(stats: SiteMeta["stats"]): AboutStat[] {
  return [
    {
      key: "blacksmiths",
      value: stats.blacksmiths,
      gif: `${GIF}/f40ce8_8e6356af1cdd48478c31dc1841fa5003~mv2.gif`,
    },
    {
      key: "projects",
      value: stats.projects,
      gif: `${GIF}/f40ce8_6172fa97e78341ddada44f50c7849a9c~mv2.gif`,
    },
    {
      key: "years",
      value: stats.years,
      gif: `${GIF}/f40ce8_001130ac380d4e689b78cd25ae32a4d2~mv2.gif`,
    },
  ];
}
