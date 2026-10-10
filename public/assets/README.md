# Asset folders

Everything in `public/` is copied to the site root at build time, **with the
GitHub Pages base path applied automatically**.

## How to reference a file

1. Drop the file into one of the folders below.
2. In `src/data/portfolio.ts`, reference it **without a leading slash**:

   ```ts
   portrait: 'assets/images/portrait.jpg',
   image: 'assets/images/project-orbital.png',
   ```

`src/utils/asset.ts` prefixes `import.meta.env.BASE_URL` at runtime, so the same
path works at `http://localhost:5173/` and at
`https://USERNAME.github.io/REPOSITORY-NAME/`. Never hardcode `/assets/...`.

## Folders

| Folder     | What goes here                                                          |
| ---------- | ----------------------------------------------------------------------- |
| `images/`  | Your portrait, project previews, certificate scans. JPG / PNG / WebP.    |
| `textures/`| Optional texture maps, if you extend the 3D scenes.                     |
| `models/`  | Optional `.glb` / `.gltf` models, if you extend the 3D scenes.          |
| `audio/`   | Optional audio files.                                                    |

## What the project ships with

**Nothing is required in these folders.** The build and the whole experience work
with all four folders empty:

- Planets, stars, nebulae, asteroids, the spacecraft and every hologram are
  generated procedurally in GLSL and Three.js geometry — no texture downloads.
- Audio is synthesised at runtime with the Web Audio API — no audio files.
- Missing images fall back to clearly-labelled holographic placeholders, and a
  broken image URL is caught by an `onError` handler rather than leaving a
  blank box.

## Recommended sizes

- Portrait: around 800 × 1000 px (4:5), under ~300 KB.
- Project previews: around 1200 × 750 px (16:10), under ~400 KB.
- Certificates: around 1600 × 1100 px (3:2), under ~500 KB.

Prefer WebP where you can — it is usually 25–35 % smaller than JPEG at the same
quality.
