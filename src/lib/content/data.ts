import type {
  Accent,
  LocalizedString,
  ProjectCategory,
} from "./types";

// ── Mock content (placeholder until the client provides real materials) ──
// Shapes mirror the planned WordPress CPTs (doc 03). Localized fields use
// LocalizedString; lib/wp/client.ts resolves them for the active locale.

export const categoryLabels: Record<ProjectCategory, LocalizedString> = {
  "animation-2d": { es: "Animación 2D", en: "2D Animation" },
  "animation-3d": { es: "Animación 3D", en: "3D Animation" },
  vfx: { es: "VFX", en: "VFX" },
  "concept-art": { es: "Concept Art", en: "Concept Art" },
  game: { es: "Videojuego", en: "Game" },
  illustration: { es: "Ilustración", en: "Illustration" },
};

const amber: Accent = ["#FFB23E", "#FF6A2C"];
const ember: Accent = ["#FF6A2C", "#E03A2E"];
const dusk: Accent = ["#FF6A2C", "#7A1E12"];

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
}

export const projects: RawProject[] = [
  {
    slug: "india-catalina",
    title: "India Catalina",
    client: "Forja Studios",
    category: "animation-3d",
    year: 2025,
    description: {
      es: "Cortometraje de animación 3D que reimagina la leyenda con luz, fuego y detalle artesanal.",
      en: "3D animated short reimagining the legend with light, fire and handcrafted detail.",
    },
    featured: true,
    accent: ember,
  },
  {
    slug: "carameloki",
    title: "Carameloki",
    client: "Forja Studios",
    category: "illustration",
    year: 2024,
    description: {
      es: "Universo de personajes lúdicos: ilustración, branding y desarrollo de IP.",
      en: "A playful character universe: illustration, branding and IP development.",
    },
    featured: true,
    accent: amber,
  },
  {
    slug: "emberfall",
    title: "Emberfall",
    client: "Nightforge Games",
    category: "game",
    year: 2025,
    description: {
      es: "Cinemáticas y concept art para un RPG de mundo abierto ambientado en una fragua viva.",
      en: "Cinematics and concept art for an open-world RPG set in a living forge.",
    },
    featured: true,
    accent: dusk,
  },
  {
    slug: "aurora-vfx",
    title: "Aurora",
    client: "Lumen Films",
    category: "vfx",
    year: 2024,
    description: {
      es: "Secuencia de VFX y simulación de partículas para la escena clave del tercer acto.",
      en: "VFX sequence and particle simulation for the third-act key scene.",
    },
    featured: true,
    accent: ember,
  },
  {
    slug: "tiny-gods",
    title: "Tiny Gods",
    client: "Pixel & Co.",
    category: "animation-2d",
    year: 2023,
    description: {
      es: "Serie de animación 2D con un estilo cálido y un ritmo cómico cuidado.",
      en: "2D animation series with a warm style and carefully tuned comedic timing.",
    },
    featured: true,
    accent: amber,
  },
  {
    slug: "the-foundry",
    title: "The Foundry",
    client: "Atlas Studios",
    category: "concept-art",
    year: 2025,
    description: {
      es: "Diseño de entornos y concept art para una saga de fantasía industrial.",
      en: "Environment design and concept art for an industrial-fantasy saga.",
    },
    featured: true,
    accent: dusk,
  },
];

export interface RawIP {
  slug: string;
  name: string;
  description: LocalizedString;
  accent: Accent;
}

export const ips: RawIP[] = [
  {
    slug: "carameloki",
    name: "Carameloki",
    description: {
      es: "IP propia de personajes lúdicos y coloridos, lista para animación y merchandising.",
      en: "Our own IP of playful, colorful characters, ready for animation and merchandising.",
    },
    accent: amber,
  },
  {
    slug: "india-catalina",
    name: "India Catalina",
    description: {
      es: "Un mundo épico inspirado en la leyenda, base de cortos y desarrollo audiovisual.",
      en: "An epic world inspired by the legend, a base for shorts and audiovisual development.",
    },
    accent: ember,
  },
];

export interface RawTeamMember {
  name: string;
  role: LocalizedString;
  initials: string;
  accent: Accent;
}

export const team: RawTeamMember[] = [
  { name: "Oscar D. Saldarriaga", role: { es: "CEO / Director de Arte", en: "CEO / Art Director" }, initials: "OS", accent: ember },
  { name: "Valentina Ríos", role: { es: "Directora de Animación", en: "Animation Director" }, initials: "VR", accent: amber },
  { name: "Mateo Herrera", role: { es: "Supervisor de VFX", en: "VFX Supervisor" }, initials: "MH", accent: dusk },
  { name: "Camila Ardila", role: { es: "Lead Concept Artist", en: "Lead Concept Artist" }, initials: "CA", accent: amber },
  { name: "Diego Marín", role: { es: "Diseño de Sonido", en: "Sound Design" }, initials: "DM", accent: ember },
  { name: "Sara Quintero", role: { es: "Productora Ejecutiva", en: "Executive Producer" }, initials: "SQ", accent: dusk },
];

export const clients: string[] = [
  "Gobierno de Colombia",
  "Champions Ascension",
  "DC Comics",
  "DDB°",
  "DeNA",
  "Disney Emoji Blitz",
  "Lumen Films",
  "Atlas Studios",
];

export const services: { key: string; label: LocalizedString }[] = [
  { key: "animation", label: { es: "Animación 2D / 3D", en: "2D / 3D Animation" } },
  { key: "illustration", label: { es: "Ilustración", en: "Illustration" } },
  { key: "concept-art", label: { es: "Concept Art", en: "Concept Art" } },
  { key: "vfx", label: { es: "VFX", en: "VFX" } },
  { key: "sound", label: { es: "Diseño de Sonido", en: "Sound Design" } },
  { key: "audiovisual", label: { es: "Producción Audiovisual", en: "Audiovisual Production" } },
  { key: "games", label: { es: "Videojuegos", en: "Games" } },
];

export const meta = {
  tagline: "Forge your flame",
  descriptor: {
    es: "Desarrollo de entretenimiento audiovisual",
    en: "Audiovisual Entertainment Development",
  } as LocalizedString,
  // Showreel destacado del canal @ForjaCollective.
  showreelId: "6nN0LBIOH0c",
  stats: { years: 12, blacksmiths: 60, projects: 1300 },
  contact: { email: "admin@forjastudios.com", whatsapp: "+57 301 242 2976" },
  socials: [
    { label: "Instagram", href: "https://instagram.com/forja_studios" },
    { label: "Facebook", href: "https://facebook.com/ForjaStudios" },
    { label: "X", href: "https://x.com/StudiosForja" },
    { label: "YouTube", href: "https://youtube.com/@ForjaCollective" },
    { label: "LinkedIn", href: "https://linkedin.com/company/86712225" },
  ],
};
