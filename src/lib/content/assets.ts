// Real assets extracted from the legacy Wix site (public/assets/forja/*).
// Friendly names so components don't carry the cryptic Wix filenames.
// See public/assets/forja/manifest.json for source URLs.

const IMG = "/assets/forja/images";
const GIF = "/assets/forja/gifs";
const POSTER = "/assets/forja/posters";
const TEAM = "/assets/forja/team";
const ICONS = "/assets/forja/ICONS";

export interface AnimatedAsset {
  gif: string;
  poster: string;
}

const gif = (id: string): AnimatedAsset => ({
  gif: `${GIF}/f40ce8_${id}~mv2.gif`,
  poster: `${POSTER}/f40ce8_${id}~mv2.jpg`,
});

export const forjaAssets = {
  /** India Catalina key art — the hero background. */
  heroKeyArt: `${IMG}/f40ce8_d7f9b08172e045088bc97c1cd41ed11ff000.jpg`,
  /** Carameloki animation still — leopard drummer scene. */
  caramelokiStill: `${IMG}/f40ce8_2a6ae8c91747484182209fde1ff15411f000.jpg`,
  /** Dark fire/embers texture, used as section overlay. */
  fireTexture: `${IMG}/f40ce8_27c213f0c90d4cee9b998700ac2070de~mv2.jpg`,
  /** Three blacksmiths line illustration. */
  blacksmiths: `${IMG}/f40ce8_30947597c09d4af2b2cc572163f1b4e6~mv2.png`,
  /** Vertical "FORJA STUDIOS" logo (light). */
  logoVertical: `${IMG}/f40ce8_8c82fa00e6a64918a364a075dce9ed23~mv2.png`,
  /** Carameloki IP wordmark. */
  caramelokiLogo: `${IMG}/f40ce8_1e5edae9376d4035910038bff3914851~mv2.png`,
  /** Ship-crest emblem. */
  crest: `${IMG}/f40ce8_54c70335883e4115ab035396d8db0215~mv2.png`,

  // Animated brand illustrations (poster + gif for lazy reveal).
  anim: {
    projects: gif("001130ac380d4e689b78cd25ae32a4d2"),
    ip: gif("6172fa97e78341ddada44f50c7849a9c"),
    contact: gif("7c1d8fbff70644009e58dc0e26f7f0ca"),
    illustration: gif("8e6356af1cdd48478c31dc1841fa5003"),
    team: gif("dce2b0cfc10848b7ad4c9ed226009b68"),
  },

  /** Social media icons (rounded app-tile PNGs in ICONS/), keyed by socials label. */
  socialIcons: {
    Instagram: `${ICONS}/instagram_icon.png`,
    Facebook: `${ICONS}/facebook_icon.png`,
    X: `${ICONS}/x_icon.png`,
    YouTube: `${ICONS}/youtube_icon.png`,
    LinkedIn: `${ICONS}/linkedin_icon.png`,
    WhatsApp: `${ICONS}/whastapp_icon.png`,
    Email: `${ICONS}/mail_icon.png`,
  } as Record<string, string>,

  /** Team member portrait thumbnails (order matches data.ts team list start). */
  teamPhotos: [
    `${TEAM}/f40ce8_947d3af9c4e54fa69a8e07fbf19fdede~mv2.webp`,
    `${TEAM}/f40ce8_dba9447c34d74d3997cdf6c0b2f52a41~mv2.webp`,
    `${TEAM}/f40ce8_cd7d956a1b2044d2a2e1463b856cbd97~mv2.webp`,
    `${TEAM}/f40ce8_b5e817a54f8a4112a0af9d9aa53b37f0~mv2.webp`,
    `${TEAM}/f40ce8_d1db0c0aa1ac4d2d8def12aec9530a49~mv2.webp`,
    `${TEAM}/f40ce8_a57b34324bf449c9893b6f3d381cfc97~mv2.webp`,
    `${TEAM}/f40ce8_71709bfcaf2645b5b3394684b61eb463~mv2.webp`,
    `${TEAM}/f40ce8_793f7546298a4e41832107315d3e7061~mv2.webp`,
  ],
} as const;
