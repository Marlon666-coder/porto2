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
      "Hi, I'm Marlo Rizky Valentino — a Computer Science student at BINUS University, and someone who refuses to be defined by a single field.",
      "I live at the intersection of three worlds: technology, communication, and faith. I write code and build interactive 3D experiences on the web; I speak, moderate events, and mentor others; and as someone who has memorised all 30 Juz of the Qur'an, I try to carry discipline and purpose into everything I do.",
      'I believe the most interesting work happens where disciplines meet — where logic meets language, and where engineering meets meaning.',
    ],
    // The principle this whole page is built around.
    principle: {
      quote: 'Die like the living, and never live like the dead.',
      original: 'Matilah seperti orang hidup, dan jangan hidup seperti orang mati.',
      meaning:
        "To me this means: when I'm gone, I want to leave behind a contribution worth remembering — a work meaningful enough that it keeps me alive in people's minds. The opposite is to merely exist: to pass through the world producing nothing, unnoticed. I choose the first. Everything I build is an attempt to leave something real behind.",
    },
    interests: [
      'Interactive 3D & WebGL',
      'Front-end engineering',
      'Public speaking & debate',
      'Mentoring & teaching',
      'Creative media & design',
      "Qur'an & Islamic studies",
    ],
    learningJourney: [
      'Building a strong foundation in programming fundamentals, data structures and algorithms.',
      'Learning modern web development with JavaScript, TypeScript and React.',
      'Exploring real-time 3D rendering on the web with Three.js and GLSL shaders.',
      'Sharpening communication through debate, public speaking, and mentoring — technical and spiritual.',
      'Growing creative skills in video editing, social media management and visual design.',
    ],
    goals: [
      'To leave a lasting work behind — something the world remembers.',
      'To bridge technology, communication and values rather than choosing just one.',
      'To build products that are not only functional, but genuinely meaningful.',
      'To keep learning in public, and to help others grow along the way.',
    ],
    focusAreas: ['Creative Front-End', 'Real-Time 3D', 'Communication & Leadership', 'Purpose-Driven Work'],
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
      id: 'savor-ordering',
      title: 'SAVOR — Restaurant Ordering Website',
      tagline: 'Good food, better moments · a mobile-first ordering experience',
      description:
        'A fully working, mobile-first food & drink ordering website for a café/restaurant. It covers the whole flow end to end: a searchable, category-filtered menu of 39 products; live product customisation (size, hot/iced, sugar & ice level, add-ons, notes) with prices that update as you go; a persistent cart (saved in localStorage); checkout with form validation, dine-in/takeaway and payment options; an order confirmation with a unique order number; and order tracking with a status timeline. Built as a dependency-free single-page app in modern vanilla JavaScript (ES modules) with hand-written CSS and inline-SVG illustrations, in a component-style architecture (data / state / ui / views). It is also accessibility-minded and reduced-motion aware.',
      stack: ['JavaScript (ES Modules)', 'CSS', 'HTML', 'SPA', 'localStorage', 'SVG'],
      image: '',
      repository: { url: 'https://github.com/Marlon666-coder/OrderMenu' },
      demo: { url: 'https://marlon666-coder.github.io/OrderMenu/' },
      isExample: false,
      status: 'Live',
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
   * SKILLS — plain capability lists grouped by category (technical, languages,
   * communication, creative). No proficiency percentages are claimed.
   * Edit the lists to match what you actually do.
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
    {
      id: 'spoken-languages',
      title: 'Languages',
      items: ['Indonesian (native)', 'Arabic', 'English'],
      note: 'Spoken and written languages.',
    },
    {
      id: 'communication',
      title: 'Public Speaking & Communication',
      items: [
        'Public speaking',
        'Event moderator / MC',
        'Mentoring (general studies)',
        'Mentoring (Islamic studies)',
      ],
      note: 'Speaking, hosting and teaching in front of an audience.',
    },
    {
      id: 'creative-media',
      title: 'Creative & Media',
      items: [
        'Video editing',
        'Social media management',
        'Poster & graphic design',
        'Instagram feed design',
      ],
      note: 'Content creation and digital media.',
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
        handle: '@minrzky.__',
        href: 'https://instagram.com/minrzky.__',
        enabled: true,
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        handle: '+62 813-4631-7088',
        // wa.me needs the international format with no leading 0 and no symbols.
        href: 'https://wa.me/6281346317088',
        enabled: true,
      },
      {
        id: 'email',
        label: 'Email',
        handle: 'hzikri86@gmail.com',
        href: 'mailto:hzikri86@gmail.com',
        enabled: true,
      },
      {
        id: 'github',
        label: 'GitHub',
        handle: 'github.com/Marlon666-coder',
        href: 'https://github.com/Marlon666-coder',
        enabled: true,
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        handle: 'Marlo Rizky Valentino',
        // The ?isSelfProfile=true parameter is stripped: it only appears when
        // you view your own profile and is not part of the public URL.
        href: 'https://www.linkedin.com/in/marlo-rizky-valentino-b239a542a',
        enabled: true,
      },
    ],
  },
};

export default portfolio;
