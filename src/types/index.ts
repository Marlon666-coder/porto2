/**
 * Shared domain types for the MARLO universe experience.
 * Scene / navigation types live here so that components never invent their own
 * string unions that can drift out of sync.
 */

/** Cinematic scenes, in narrative order. */
export type CinematicSceneId =
  | 'awakening'
  | 'starfield'
  | 'ringed-planet'
  | 'asteroid-belt'
  | 'ship-approach'
  | 'cockpit-entry'
  | 'hologram'
  | 'universe';

/** The six portfolio destinations. */
export type DestinationId =
  | 'about'
  | 'projects'
  | 'skills'
  | 'education'
  | 'certificates'
  | 'contact';

/** Any addressable place in the experience. */
export type StageId = CinematicSceneId | DestinationId;

/**
 * Which heavy 3D world group must be mounted for a stage.
 * Swapping groups is always hidden behind a flare or warp transition.
 */
export type WorldGroup = 'voyage' | 'cockpit' | 'destination';

/** How the camera gets from one stage to the next. */
export type TransitionKind = 'glide' | 'flare' | 'warp';

export type TransitionPhase = 'idle' | 'out' | 'swap' | 'in';

export type Triple = [number, number, number];

/** A single camera pose. Scenes are authored as one or more poses. */
export interface CameraPose {
  /** World-space camera position. */
  position: Triple;
  /** World-space point the camera looks at. */
  target: Triple;
  /** Vertical field of view in degrees. */
  fov?: number;
  /** Seconds to reach this pose from the previous one. */
  duration?: number;
  /** GSAP easing name. */
  ease?: string;
}

export interface SceneDefinition {
  id: StageId;
  /** Short label shown in the HUD. */
  label: string;
  /** Longer caption used by the scene indicator tooltip / screen readers. */
  caption: string;
  /** Which world group must be live. */
  world: WorldGroup;
  /** Camera path. The last pose is the resting pose. */
  path: CameraPose[];
  /** Multiplier for mouse-driven camera parallax (0 disables it). */
  parallax?: number;
  /** Gentle idle drift so the shot never feels frozen. */
  drift?: { amplitude: number; speed: number };
  /** Only true for the six portfolio destinations. */
  isDestination?: boolean;
  /** Origin of the destination world in space (destinations only). */
  worldOrigin?: Triple;
  /** Accent colour used by the HUD and the destination panel. */
  accent?: string;
}

/* ------------------------------------------------------------------ */
/* Portfolio content types                                             */
/* ------------------------------------------------------------------ */

export interface ProjectLink {
  /** Leave empty to render the link as "not published yet" instead of a dead anchor. */
  url: string;
  label?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  /** Path relative to `public/`, e.g. 'assets/images/project-a.jpg'. Empty = procedural placeholder. */
  image: string;
  repository: ProjectLink;
  demo: ProjectLink;
  /** Marks sample content so nothing reads as a real, finished project. */
  isExample?: boolean;
  status?: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  /** Plain list of technologies. No fabricated proficiency numbers. */
  items: string[];
  note?: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  program: string;
  period: string;
  detail?: string;
  highlights?: string[];
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issued: string;
  /** Path relative to `public/`. Empty = empty holographic slot. */
  image: string;
  verifyUrl: string;
  /** True for the reserved, not-yet-filled slots. */
  isPlaceholder?: boolean;
}

export type ContactChannelId = 'instagram' | 'whatsapp' | 'email' | 'github' | 'linkedin';

export interface ContactChannel {
  id: ContactChannelId;
  label: string;
  /** Shown on the terminal row. */
  handle: string;
  /** Final href. Empty string => channel renders as "awaiting configuration". */
  href: string;
  /** Explicit switch so unconfigured channels never produce broken links. */
  enabled: boolean;
}

export interface AboutPrinciple {
  /** The guiding quote, in the site's display language. */
  quote: string;
  /** The original wording (kept so the meaning is never lost in translation). */
  original?: string;
  /** What the principle means to the author. */
  meaning: string;
}

export interface AboutMoment {
  /** Path relative to `public/`, e.g. 'assets/images/moment-mc.jpg'. */
  image: string;
  caption: string;
}

export interface AboutContent {
  name: string;
  callsign: string;
  role: string;
  education: string;
  introduction: string[];
  /** A personal guiding principle, featured prominently in About Me. */
  principle?: AboutPrinciple;
  /** "In action" photos — speaking, hosting, teaching. */
  moments?: AboutMoment[];
  interests: string[];
  learningJourney: string[];
  goals: string[];
  focusAreas: string[];
  /** Path relative to `public/`. Empty = holographic placeholder frame. */
  portrait: string;
  portraitAlt: string;
}

export interface PortfolioData {
  identity: {
    name: string;
    displayName: string;
    welcomeLine: string;
    descriptors: string[];
    location: string;
  };
  about: AboutContent;
  projects: Project[];
  skills: SkillGroup[];
  education: EducationEntry[];
  certificates: Certificate[];
  contact: {
    heading: string;
    message: string;
    channels: ContactChannel[];
  };
}

/* ------------------------------------------------------------------ */
/* Runtime quality                                                     */
/* ------------------------------------------------------------------ */

export type QualityTier = 'high' | 'medium' | 'low';

export interface QualitySettings {
  tier: QualityTier;
  isMobile: boolean;
  isTouch: boolean;
  dpr: [number, number];
  starCount: number;
  deepStarCount: number;
  dustCount: number;
  asteroidCount: number;
  nebulaLayers: number;
  postProcessing: boolean;
  bloomIntensity: number;
  shadows: boolean;
  cometCount: number;
  particleSize: number;
}
