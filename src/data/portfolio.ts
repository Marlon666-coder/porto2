/**
 * ============================================================================
 *  SINGLE SOURCE OF TRUTH FOR ALL PORTFOLIO CONTENT
 * ============================================================================
 *
 *  Edit this file only — every scene, panel and HUD label reads from here.
 *  No personal content is hardcoded anywhere else in the codebase.
 *
 *  IMPORTANT / HONESTY NOTE
 *  ------------------------
 *  Nothing in this file claims a real achievement that has not been supplied.
 *  - Projects are marked `isExample: true` and are clearly labelled as samples.
 *  - Skills are plain technology lists, with no invented proficiency numbers.
 *  - Certificates are empty reserved slots.
 *  - Contact channels are disabled until you fill in real handles, so the UI
 *    shows "awaiting configuration" instead of rendering a broken link.
 *
 *  HOW TO ADD IMAGES
 *  -----------------
 *  Drop files into `public/assets/images/` and reference them WITHOUT a leading
 *  slash, e.g. `image: 'assets/images/portrait.jpg'`. The deployment-safe base
 *  path (GitHub Pages sub-folder) is applied automatically by `src/utils/asset.ts`.
 */

import type { PortfolioData } from '../types';

export const portfolio: PortfolioData = {
  identity: {
    name: 'Marlo',
    displayName: "I'M MARLO",
    welcomeLine: 'WELCOME TO MY PORTFOLIO WEBSITE',
    descriptors: ['COMPUTER SCIENCE STUDENT', 'CREATIVE DEVELOPER', 'FUTURE INNOVATOR'],
    location: 'BINUS University',
  },

  about: {
    name: 'Marlo Rizky Valentino',
    callsign: 'MARLO',
    role: 'Computer Science Student',
    education: 'BINUS University — Computer Science (2026 – Present)',
    introduction: [
      "Hi, I'm Marlo Rizky Valentino — a Computer Science student at BINUS University.",
      'I like building things that live on a screen but feel like somewhere you can actually go: interfaces with depth, motion and a bit of atmosphere.',
      'This site is both my portfolio and my playground — an excuse to push what a browser can render in real time.',
    ],
    interests: [
      'Interactive 3D and WebGL',
      'Front-end engineering',
      'Creative coding & shaders',
      'UI / UX and motion design',
      'Game-like web experiences',
      'Science fiction and space',
    ],
    learningJourney: [
      'Building a foundation in programming fundamentals, data structures and algorithms.',
      'Learning modern web development with TypeScript and React.',
      'Exploring real-time 3D rendering with Three.js and GLSL shaders.',
      'Practising version control, code review and deployment workflows with Git and GitHub.',
    ],
    goals: [
      'Keep turning ideas into things people can actually click, explore and use.',
      'Grow into a developer who is strong in both engineering and visual craft.',
      'Contribute to open-source and learn in public.',
      'Build products that feel genuinely memorable, not just functional.',
    ],
    focusAreas: ['Creative Front-End', 'Real-Time 3D', 'Interaction Design', 'Web Performance'],
    // Real portrait: upload the file to public/assets/images/portrait.jpg.
    // Until the file exists, a holographic placeholder frame is shown instead
    // (and the onError handler falls back to it if the upload is missing).
    portrait: 'assets/images/portrait.jpg',
    portraitAlt: 'Marlo at Computer Science Festival 2026',
  },

  /**
   * SAMPLE PROJECTS — placeholders labelled as examples.
   * Replace the content, set `isExample: false`, and add real links.
   */
  projects: [
    {
      id: 'project-alpha',
      title: 'Sample Project — Orbital Dashboard',
      tagline: 'Placeholder entry · replace with your own project',
      description:
        'Example slot for a data-visualisation dashboard. Swap this text for a real project description: what problem it solves, what you built, and what you learned while building it.',
      stack: ['React', 'TypeScript', 'Vite'],
      image: '',
      repository: { url: '' },
      demo: { url: '' },
      isExample: true,
      status: 'Example slot',
    },
    {
      id: 'project-beta',
      title: 'Sample Project — Shader Playground',
      tagline: 'Placeholder entry · replace with your own project',
      description:
        'Example slot for a real-time graphics experiment. Describe the technique you explored, the maths behind it, and the performance trade-offs you had to make.',
      stack: ['Three.js', 'GLSL', 'WebGL'],
      image: '',
      repository: { url: '' },
      demo: { url: '' },
      isExample: true,
      status: 'Example slot',
    },
    {
      id: 'project-gamma',
      title: 'Sample Project — Campus Utility App',
      tagline: 'Placeholder entry · replace with your own project',
      description:
        'Example slot for an application project. Outline the users, the core feature set, the architecture you chose, and how you tested it.',
      stack: ['Python', 'REST API', 'SQL'],
      image: '',
      repository: { url: '' },
      demo: { url: '' },
      isExample: true,
      status: 'Example slot',
    },
    {
      id: 'project-delta',
      title: 'Open Slot',
      tagline: 'Reserved for an upcoming build',
      description:
        'An empty hangar bay, waiting for the next project. Add a new entry to the `projects` array in src/data/portfolio.ts to fill it.',
      stack: [],
      image: '',
      repository: { url: '' },
      demo: { url: '' },
      isExample: true,
      status: 'Reserved',
    },
  ],

  /**
   * SKILLS — technology lists only. No proficiency percentages are claimed.
   * Edit the lists to match what you actually work with.
   */
  skills: [
    {
      id: 'languages',
      title: 'Programming Languages',
      items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C'],
      note: 'Languages used in coursework and personal projects.',
    },
    {
      id: 'web',
      title: 'Web Development',
      items: ['HTML5', 'CSS3', 'Responsive Layout', 'Accessibility Basics', 'REST APIs'],
      note: 'Core web platform fundamentals.',
    },
    {
      id: 'frameworks',
      title: 'Frameworks & Libraries',
      items: ['React', 'Three.js', 'React Three Fiber', 'GSAP', 'Node.js'],
      note: 'The stack this very website is built on.',
    },
    {
      id: 'tools',
      title: 'Development Tools',
      items: ['Git', 'GitHub', 'Vite', 'VS Code', 'npm', 'GitHub Actions'],
      note: 'Daily workflow and build tooling.',
    },
    {
      id: 'other',
      title: 'Other Technologies',
      items: ['GLSL / Shaders', 'WebGL', 'SQL', 'Figma', 'Blender (basics)'],
      note: 'Areas currently being explored.',
    },
  ],

  education: [
    {
      id: 'binus',
      institution: 'BINUS UNIVERSITY',
      program: 'Computer Science',
      period: '2026 – Present',
      detail: 'Undergraduate programme in Computer Science.',
      highlights: [
        'Programming fundamentals and problem solving',
        'Data structures and algorithms',
        'Software engineering practice',
        'Mathematics for computing',
      ],
    },
  ],

  /**
   * ACHIEVEMENTS — real documentation of competitions, awards and milestones.
   * (The field is still named `certificates` internally.) For each entry: set
   * the title / issuer / date, upload the photo to public/assets/images/, point
   * `image` at it, and keep `isPlaceholder: false`.
   */
  certificates: [
    {
      id: 'cert-olympicad',
      title: "Bronze Medal — Musabaqoh Fahmil Qur'an 3",
      issuer: 'Olympic Ahmad Dahlan VII · National Level',
      issued: 'March 2024 · Bandung',
      image: 'assets/images/cert-fahmil-quran.jpg',
      verifyUrl: '',
      isPlaceholder: false,
    },
    {
      id: 'cert-hafalan-quran',
      title: "Memorised 30 Juz of the Qur'an",
      issuer: 'Hafiz · 30 Juz',
      issued: '2025',
      image: 'assets/images/cert-hafalan-quran.jpg',
      verifyUrl: '',
      isPlaceholder: false,
    },
    {
      id: 'cert-debat-bawaslu',
      title: 'Debate Competition Winner — Bawaslu',
      issuer: 'Provincial Level',
      issued: '2024',
      image: 'assets/images/cert-debat-bawaslu.jpg',
      verifyUrl: '',
      isPlaceholder: false,
    },
    {
      id: 'cert-best-of-best',
      title: 'Best of the Best — Top of the Cohort',
      issuer: 'Awarded as the best student of the batch',
      issued: '',
      image: 'assets/images/cert-best-of-best.jpg',
      verifyUrl: '',
      isPlaceholder: false,
    },
    {
      id: 'cert-koleksi',
      title: '30+ Certificates & Awards',
      issuer: 'A collection of achievements in one frame',
      issued: '',
      image: 'assets/images/cert-koleksi.jpg',
      verifyUrl: '',
      isPlaceholder: false,
    },
  ],

  contact: {
    heading: 'READY TO CONNECT?',
    message:
      'Open channel. Collaborations, questions, internships, or just a conversation about 3D on the web — all welcome.',
    /**
     * Fill in `handle` + `href` and flip `enabled` to true for each channel you
     * want to expose. Disabled channels render as inert "awaiting configuration"
     * rows, so the terminal never shows a broken link.
     */
    channels: [
      {
        id: 'instagram',
        label: 'Instagram',
        handle: '@your.handle',
        href: '',
        enabled: false,
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        handle: '+62 ••• •••• ••••',
        // Example once configured: 'https://wa.me/628123456789'
        href: '',
        enabled: false,
      },
      {
        id: 'email',
        label: 'Email',
        handle: 'you@example.com',
        // Example once configured: 'mailto:you@example.com'
        href: '',
        enabled: false,
      },
      {
        id: 'github',
        label: 'GitHub',
        handle: 'github.com/your-username',
        href: '',
        enabled: false,
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        handle: 'linkedin.com/in/your-profile',
        href: '',
        enabled: false,
      },
    ],
  },
};

export default portfolio;
