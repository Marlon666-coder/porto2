# MARLO — EXPLORE MY UNIVERSE

An immersive, cinematic 3D space portfolio. You wake up in darkness, stars
ignite around you, you fly past a ringed giant and through an asteroid belt,
board a futuristic spacecraft, and the ship's central projector spells out:

> **WELCOME TO MY PORTFOLIO WEBSITE**
> **I'M MARLO**

From there the hologram folds into a navigation map of six worlds — About,
Projects, Skills, Education, Certificates and Contact — each one its own 3D
environment inside the same continuous universe.

Built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei and GSAP.
Deploys as a fully static site to GitHub Pages.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Local development](#local-development)
- [Production build](#production-build)
- [Previewing the production build locally](#previewing-the-production-build-locally)
- [Editing your content](#editing-your-content)
- [Project structure](#project-structure)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [The base path explained](#the-base-path-explained)
- [Controls](#controls)
- [Accessibility and performance](#accessibility-and-performance)
- [Troubleshooting](#troubleshooting)
- [Honesty notes](#honesty-notes)

---

## Features

**Cinematic journey (8 scenes)**

1. Awakening in darkness — stars, dust and a faint nebula fade up behind a boot sequence
2. Entering the star field
3. Flying past a gigantic ringed planet
4. Passing through an asteroid belt
5. Approaching the spacecraft
6. Entering the cockpit (hidden behind a light flare, no hard cut)
7. The central hologram activation
8. The portfolio universe map

**Real-time 3D, not images**

- Tens of thousands of stars across three depth shells, each a single `THREE.Points` draw call with distance-attenuated sizes — so near stars sweep past while deep stars barely shift
- Fully procedural planets: banded fbm surfaces, soft terminators, atmospheric rim light, ring systems with Cassini-style gaps
- Instanced asteroid belt, drifting cosmic dust, comets with tapered tails, additive fbm nebulae
- A procedurally built spacecraft: lathed fuselage, swept wings, four engine nacelles with animated plumes, glass canopy, instanced hull greebles, blinking navigation beacons
- A cockpit interior with a curved panoramic window you genuinely look *through* at the planet outside

**The hologram reveal** — a ten-beat GSAP sequence: lights dim, core ignites,
rings emerge, particles rise, a beam forms, two brief glitches, and the text
materialises bottom-up before locking in. The type is rasterised to a canvas and
then driven through a GLSL shader on real 3D geometry (scanlines, RGB split,
travelling sweep, controlled flicker) — it is projected into the scene, not laid
over it.

**Navigation** — mouse wheel, touch swipe, arrow keys, on-screen prev/next, a
clickable scene rail, a full destination map, and direct shortcuts. A single
scene controller owns every transition, so rapid input can never stack
overlapping camera animations.

**Optional synthesised audio** — ambient pads, engine hum and interface cues are
generated at runtime with the Web Audio API. No audio files, no third-party
service, and nothing plays until you explicitly switch sound on.

**Built to degrade gracefully** — device-aware quality tiers, an FPS watchdog
that reduces load if the GPU struggles, `prefers-reduced-motion` support with an
in-app toggle, and a complete static portfolio fallback if WebGL is unavailable.

---

## Tech stack

| Purpose           | Choice                                     |
| ----------------- | ------------------------------------------ |
| UI framework      | React 18 + TypeScript (strict)             |
| Build tool        | Vite 5                                     |
| 3D renderer       | Three.js                                   |
| React 3D bindings | React Three Fiber + Drei                   |
| Post-processing   | `@react-three/postprocessing` (bloom, vignette) |
| Animation         | GSAP timelines                             |
| Styling           | Plain CSS with custom properties           |
| State             | ~60-line store on React's `useSyncExternalStore` |
| CI / hosting      | GitHub Actions → GitHub Pages              |

No state-management library, no CSS framework, no HDRI downloads, no font files
and no audio files. Everything else is generated at runtime.

---

## Requirements

- **Node.js 18.18 or newer** (Node 20 LTS recommended — that is what CI uses)
- **npm 9 or newer** (ships with Node)
- A browser with **WebGL** (any current Chrome, Edge, Firefox or Safari)

Check your versions:

```bat
node --version
npm --version
```

---

## Installation

```bat
cd marlo-universe
npm install
```

This creates `package-lock.json`. **Commit that file** — CI uses `npm ci` for
reproducible installs when the lockfile is present.

---

## Local development

```bat
npm run dev
```

Open the URL Vite prints (normally <http://localhost:5173/>).

Other scripts:

```bat
npm run typecheck     :: TypeScript only, no output
npm run build         :: typecheck + production build into dist\
npm run preview       :: serve dist\ locally
npm run build:nocheck :: skip the typecheck (escape hatch, not for CI)
```

---

## Production build

```bat
npm run build
```

`npm run build` runs `tsc --noEmit` first, so type errors fail the build rather
than shipping. Output goes to `dist\`, and the console prints the base path that
was used:

```
[marlo-universe] building with base path: /
```

---

## Previewing the production build locally

```bat
npm run build
npm run preview
```

To reproduce the GitHub Pages sub-folder exactly (catches any broken asset
path before you deploy):

```bat
set VITE_BASE_PATH=/REPOSITORY-NAME/
npm run build
npx vite preview --base /REPOSITORY-NAME/
```

PowerShell uses different syntax for the variable:

```powershell
$env:VITE_BASE_PATH="/REPOSITORY-NAME/"
npm run build
npx vite preview --base /REPOSITORY-NAME/
```

---

## Editing your content

**Everything lives in one file: [`src/data/portfolio.ts`](src/data/portfolio.ts).**
No personal content is hardcoded anywhere else.

| What to change        | Where                                   |
| --------------------- | --------------------------------------- |
| Name, welcome text, descriptors | `identity`                    |
| Bio, interests, goals, portrait | `about`                       |
| Projects              | `projects`                              |
| Skill categories      | `skills`                                |
| Education             | `education`                             |
| Certificates          | `certificates`                          |
| Contact channels      | `contact.channels`                      |

### Adding your portrait

1. Save your photo to `public/assets/images/portrait.jpg`
2. Set `about.portrait: 'assets/images/portrait.jpg'` — **no leading slash**

The holographic treatment (cyan edge light, scanlines, sweeping scanner, layered
glass, perspective tilt) is applied in CSS to whatever image you provide. While
it is empty you get a labelled placeholder frame.

### Adding contact links

Each channel is off until you turn it on, so the terminal never shows a dead
link:

```ts
{
  id: 'github',
  label: 'GitHub',
  handle: 'github.com/your-username',
  href: 'https://github.com/your-username',
  enabled: true,   // <- flip this
}
```

WhatsApp uses `https://wa.me/628123456789`, email uses `mailto:you@example.com`.

### Adding projects and certificates

Replace the example entries and set `isExample: false` (projects) or
`isPlaceholder: false` (certificates). Drop preview images into
`public/assets/images/` and reference them the same relative way. See
[`public/assets/README.md`](public/assets/README.md) for recommended sizes.

### Changing the colours

The palette is defined once in `src/styles/global.css` (CSS custom properties)
and `src/data/worldLayout.ts` (`PALETTE`, `DESTINATION_ACCENTS`).

---

## Project structure

```
marlo-universe/
├─ .github/workflows/deploy.yml   GitHub Pages CI
├─ public/
│  ├─ .nojekyll                   stops Jekyll from eating _-prefixed files
│  └─ assets/{images,textures,models,audio}/
├─ index.html
├─ vite.config.ts                 base-path resolution lives here
├─ tsconfig.json
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ data/
   │  ├─ portfolio.ts             ← ALL your content
   │  ├─ scenes.ts                camera choreography, 14 stages
   │  └─ worldLayout.ts           spatial layout + palette
   ├─ state/
   │  ├─ store.ts                 tiny useSyncExternalStore store
   │  ├─ experienceStore.ts       shared low-frequency state
   │  ├─ navigation.ts            the single scene controller
   │  └─ transitionTiming.ts      timings shared with CSS
   ├─ three/
   │  ├─ Experience.tsx           the R3F canvas root
   │  ├─ CameraController.tsx     the one camera rig
   │  ├─ cameraBus.ts             imperative bridge, DOM ↔ canvas
   │  ├─ StarField.tsx  NebulaField.tsx  CosmicDust.tsx  Comets.tsx
   │  ├─ Planet.tsx  AsteroidField.tsx  Spacecraft.tsx
   │  ├─ EnergyCore.tsx  HoloText.tsx  HoloSurfaces.tsx  Structures.tsx
   │  ├─ WarpStreaks.tsx  Effects.tsx  PerfGuard.tsx  SpaceEnvironment.tsx
   │  ├─ hologramControl.ts  materials.ts
   │  └─ shaders/                 GLSL: starfield, nebula, planet, hologram
   ├─ scenes/
   │  ├─ CosmicWorld.tsx          always-mounted backdrop
   │  ├─ VoyageWorld.tsx          scenes 01–05
   │  ├─ CockpitWorld.tsx         scenes 06–08
   │  ├─ HologramStage.tsx        the reveal sequence
   │  ├─ UniverseMap.tsx          scene 08 navigation map
   │  ├─ DestinationWorld.tsx     mounts one destination at a time
   │  └─ destinations/            the six worlds + shared set pieces
   ├─ components/                 HUD, boot screen, panels, modals, fallback
   ├─ hooks/                      quality tiers, input, fonts, text textures
   ├─ audio/audioEngine.ts        fully synthesised Web Audio
   ├─ utils/                      base-path-safe URLs, maths, pointer
   └─ styles/                     global, boot, hud, panels, fallback
```

---

## Deploying to GitHub Pages

### 1. Create the repository

Create an **empty** repository on GitHub first (no README, no `.gitignore`) —
<https://github.com/new>. Note the owner and the name.

### 2. Push the code

If this folder is not a git repository yet:

```bat
git init
git add .
git commit -m "Initial immersive 3D portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git
git push -u origin main
```

If it **is** already a git repository, skip `git init` and `git remote add` —
just commit and push:

```bat
git add .
git commit -m "Initial immersive 3D portfolio"
git push
```

Replace `USERNAME` and `REPOSITORY-NAME` with your real values.

### 3. Turn on GitHub Actions as the Pages source

This step is manual and the deployment will not run without it:

1. Go to your repository on GitHub
2. **Settings → Pages**
3. Under **Build and deployment → Source**, select **GitHub Actions**

### 4. Watch the deployment

Open the **Actions** tab. The *Deploy to GitHub Pages* workflow runs on every
push to `main` and can also be started by hand via **Run workflow**
(`workflow_dispatch`). It will:

1. Check out the repository
2. Set up Node.js 20 with npm caching
3. Install dependencies (`npm ci` when a lockfile is committed)
4. Run `npm run typecheck`
5. Run `npm run build`
6. Add `.nojekyll` to `dist`
7. Upload `dist` with `actions/upload-pages-artifact`
8. Publish with `actions/deploy-pages`

Failures appear in the Actions tab with full logs. `node_modules` is never
published, and `dist/` is gitignored — the artifact is built fresh in CI.

### 5. Your URL

```
https://USERNAME.github.io/REPOSITORY-NAME/
```

Or, if your repository is named `USERNAME.github.io`:

```
https://USERNAME.github.io/
```

The first deployment usually takes a couple of minutes to go live.

---

## The base path explained

GitHub Pages serves project sites from a sub-folder, so assets must be requested
from `/REPOSITORY-NAME/...` rather than `/...`. `vite.config.ts` works this out
on its own — nothing is hardcoded:

| Situation                                   | Resulting base      |
| ------------------------------------------- | ------------------- |
| `npm run dev`                                | `/`                 |
| CI, repo `USERNAME/my-portfolio`             | `/my-portfolio/`    |
| CI, repo `USERNAME/USERNAME.github.io`       | `/`                 |
| `VITE_BASE_PATH` set                         | that value          |
| Local build with nothing set                 | `/`                 |

In CI the repository name comes from the `GITHUB_REPOSITORY` variable that
GitHub provides automatically, which is why renaming your repository needs no
code change.

**Custom domain or another host?** Set a repository variable named
`VITE_BASE_PATH` (Settings → Secrets and variables → Actions → Variables) to
`/` and redeploy. The workflow already passes it through.

**For your own assets**, always store paths without a leading slash in
`src/data/portfolio.ts` and they will be resolved correctly — see
`src/utils/asset.ts`.

---

## Controls

| Input                        | Action                        |
| ---------------------------- | ----------------------------- |
| Mouse wheel                  | Travel forward / backward     |
| Swipe up / down              | Travel forward / backward     |
| `←` `→` `↑` `↓` `PgUp` `PgDn`| Travel forward / backward     |
| `Home`                       | Return to the universe map    |
| `M`                          | Destination map               |
| `S`                          | Toggle sound                  |
| `R`                          | Toggle reduced motion         |
| `Esc`                        | Close a modal or the map      |
| Click a map planet           | Fly to that destination       |
| Click a hangar display       | Open that project             |
| Move the mouse               | Camera parallax               |

Scrolling inside an information panel scrolls the panel — it never triggers a
scene change. Any element marked `data-nav-exempt` opts out of wheel and swipe
navigation.

---

## Accessibility and performance

- Visible `:focus-visible` outlines on every control; modals move focus to their
  close button and `Esc` always closes them
- Real DOM text and real anchors for all portfolio content — selectable,
  zoomable, translatable and screen-reader friendly
- `prefers-reduced-motion` is honoured on load and can be toggled in the HUD;
  it shortens transitions, stops camera drift and parallax, disables the shake
  impulse and cuts particle counts
- Audio never autoplays; muted is the default and the experience is complete
  without it
- Device-tiered quality: star, dust and asteroid counts, DPR clamp and
  post-processing all scale from a single budget in `src/hooks/useQuality.ts`
- An FPS watchdog (`PerfGuard`) halves the visual load once if the frame rate
  stays low, and tells you so in the HUD
- One world group is mounted at a time; swaps happen behind a flare or warp, and
  every geometry, material and texture is explicitly disposed
- `webglcontextlost` is caught and logged instead of failing silently

Target is a smooth 60 FPS on capable desktop hardware. Frame rates on phones and
integrated GPUs will be lower — that is what the quality tiers and the watchdog
are for.

---

## Troubleshooting

**Blank page after deploying, 404s for `/assets/index-*.js` in the console**
The base path is wrong. Confirm **Settings → Pages → Source** is *GitHub
Actions*, then check the build log line `building with base path: ...` matches
your repository name.

**`npm ci` fails in CI with "lockfile not found"**
Run `npm install` locally and commit `package-lock.json`. The workflow falls
back to `npm install` and prints a warning, but you lose reproducible installs.

**The site works locally but images are missing in production**
A leading slash in an asset path. Use `assets/images/x.jpg`, not
`/assets/images/x.jpg`.

**"WebGL is unavailable" fallback appears**
Hardware acceleration is off or the GPU is blocklisted. In Chrome check
`chrome://gpu`. The fallback still contains the entire portfolio.

**Stuttering or low frame rate**
Enable **CALM** (reduced motion) in the HUD, close other GPU-heavy tabs, or lower
the numbers in `src/hooks/useQuality.ts`.

**The intro feels long**
Use **SKIP INTRO** on the launch screen or in the HUD to jump straight to the
hologram, or press `M` for the destination map.

**Fonts look generic**
Orbitron and Rajdhani load from Google Fonts. If that is blocked, the CSS falls
back to a geometric system stack and the canvas-rendered 3D text redraws itself
once fonts are available. Nothing breaks either way.

**`npm run build` fails with type errors after I edited content**
Compare your edit against the types in `src/types/index.ts` — every content
array is typed, which is what caught the mistake.

---

## Honesty notes

This repository intentionally contains **no fabricated personal achievements**:

- Projects are marked as example slots and labelled as such in the UI
- Skills are plain technology lists — there are no invented proficiency
  percentages or seniority claims
- Certificate entries are empty reserved slots
- Contact channels are disabled until real handles are added
- The descriptors under the hologram ("Computer Science Student", "Creative
  Developer", "Future Innovator") are introductory, not claims of professional
  expertise

The only supplied facts baked in are the name (Marlo) and the education entry
(BINUS University, Computer Science, 2026 – Present).

---

Built for Marlo · BINUS University · Computer Science
