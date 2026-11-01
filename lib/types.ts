/**
 * Content types for the portfolio. Every section reads from `data/portfolio.ts`
 * through these types, so a typo in the content is caught at build time.
 */

export interface Link {
  /** Empty string = not published yet. The UI hides the button instead of linking nowhere. */
  url: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  /** Path relative to `public/`, e.g. 'assets/images/savor.png'. Empty = typographic thumbnail. */
  image: string;
  repository: Link;
  demo: Link;
  isExample?: boolean;
  status?: string;
}

export interface SkillGroup {
  id: string;
  title: string;
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

export interface ExperienceEntry {
  id: string;
  role: string;
  organisation: string;
  period: string;
  description: string;
  /** Short, scannable outcomes/skills drawn from the description. */
  highlights?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  issued: string;
  image: string;
  verifyUrl: string;
  isPlaceholder?: boolean;
  /** Award or ranking, taken from the existing title/issuer text. */
  award?: string;
  /** Competition level, taken from the existing issuer text. */
  level?: string;
}

export type ContactChannelId = 'instagram' | 'whatsapp' | 'email' | 'github' | 'linkedin';

export interface ContactChannel {
  id: ContactChannelId;
  label: string;
  handle: string;
  href: string;
  enabled: boolean;
}

export interface AboutPrinciple {
  quote: string;
  original?: string;
  meaning: string;
}

export interface AboutMoment {
  image: string;
  caption: string;
}

export interface AboutContent {
  name: string;
  callsign: string;
  role: string;
  education: string;
  introduction: string[];
  principle?: AboutPrinciple;
  moments?: AboutMoment[];
  interests: string[];
  learningJourney: string[];
  goals: string[];
  focusAreas: string[];
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
  /**
   * Path to your CV relative to `public/`, e.g. 'assets/cv/marlo-cv.pdf'.
   * Empty = the hero shows "Request CV" (opens an email) instead of a dead
   * download button.
   */
  cv: string;
  about: AboutContent;
  projects: Project[];
  skills: SkillGroup[];
  education: EducationEntry[];
  /** Organisation & volunteer experience (optional section). */
  experience?: ExperienceEntry[];
  certificates: Achievement[];
  contact: {
    heading: string;
    message: string;
    channels: ContactChannel[];
  };
}
