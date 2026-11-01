# MONOCHROME — A Digital Identity

Personal portfolio of **Marlo Rizky Valentino**, Computer Science student at BINUS University.

Live: <https://marlon666-coder.github.io/porto2/>

A minimalist, black-and-white portfolio. Hierarchy comes from typography, spacing and contrast instead of colour. It is built for recruiters: who I am, what I have achieved, what I have built, what I can do and how to reach me are each one scroll away.

## Stack

| Purpose | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, static export) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 |
| Animation | GSAP + ScrollTrigger |
| Smooth scroll | Lenis (driven by GSAP's ticker, so there is one scroll loop) |
| Icons | Lucide React |
| Fonts | Geist Sans / Geist Mono (self-hosted via the `geist` package) |
| Hosting | GitHub Pages via GitHub Actions |

React Bits-style effects (word-by-word blur reveal, magnetic buttons, cursor-follow image preview) are written directly on GSAP, so the site has a single animation engine and no copy-pasted component library.

## Sections

1. **Hero** — name, role, photo, key numbers, *Explore my work* and *Download CV*.
2. **About** — at-a-glance facts, biography, guiding principle, photos of public speaking, interests, goals, learning journey.
3. **Achievements** — numbered index (hover shows the photo on desktop) and a documentation grid; both open a full-size viewer.
4. **Projects** — four live projects with demo and source links.
5. **Skills** — eight categories, plain lists, no self-ratings.
6. **Education** — timeline.
7. **Contact** — every enabled channel, plus footer.

## Editing content

All text, links and image paths live in **`data/portfolio.ts`**. No personal content is hardcoded in components.

- **Images:** put files in `public/assets/images/` and reference them without a leading slash, e.g. `'assets/images/portrait.jpg'`.
- **CV:** put your PDF in `public/assets/cv/` and set `cv: 'assets/cv/your-file.pdf'`. While `cv` is empty, the hero button reads **Request CV** and opens an email, so it never points at a missing file.
- **Project screenshots:** set a project's `image` field. Without one, the card shows a typographic cover with the project name.

## Run locally

Requires Node.js 18.18+ (20 LTS recommended).

```bat
npm install
npm run dev
```

Open <http://localhost:3000>.

Production build (writes the static site to `out\`, including a type check):

```bat
npm run build
npx serve out
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `out/` to GitHub Pages. Pages must be set to **Settings → Pages → Source: GitHub Actions** (already done for this repository).

The base path (`/porto2`) is derived from the repository name at build time in `next.config.mjs`, so renaming the repository needs no code change. To serve from a custom domain, set a repository variable `BASE_PATH` to `/`.

After running `npm install` once, commit `package-lock.json` for reproducible CI installs.

## Accessibility and motion

- Visible focus outlines; the image viewer and mobile menu trap focus, close on `Esc` and return focus.
- `prefers-reduced-motion` turns off smooth scrolling, entrance animations, tilt and magnetic effects.
- Hover-only effects (photo tilt, achievement preview) have tap or inline equivalents on touch screens.
- Content is rendered in the HTML and only hidden by GSAP on the client, so it stays readable if scripts fail.

## Previous version

The earlier 3D space version is preserved at the git tag `v1-3d-universe`:

```bat
git checkout v1-3d-universe
```
