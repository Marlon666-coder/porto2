# Assets

Files in `public/` are served from the site root, with the GitHub Pages base path added automatically.

Reference them from `data/portfolio.ts` **without a leading slash**:

```ts
portrait: 'assets/images/portrait.jpg',
cv: 'assets/cv/marlo-rizky-valentino-cv.pdf',
```

| Folder | Contents |
| --- | --- |
| `images/` | Portrait, achievement photos, "In action" photos, optional project screenshots |
| `cv/` | Your CV as a PDF (enables the *Download CV* button) |

A missing or broken image shows a neutral placeholder instead of a broken box.

Suggested sizes: portrait about 1000 × 1250 px (4:5); project screenshots about 1600 × 1100 px. WebP or JPEG under 500 KB keeps the page fast.
