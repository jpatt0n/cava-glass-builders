# Cava Glass Builders — Website

Single-page marketing site for [Cava Glass Builders](https://cavaglassbuilders.com), a Houston interior glass company.

- **Stack:** Astro 5 + Tailwind CSS 4, deployed as static HTML + a small Worker
- **Hosting:** Cloudflare Workers (Static Assets), auto-deploys on push to `main`
- **Forms:** Browser → Cloudflare Worker → Turnstile verification → Cloudflare email binding → Gmail
- **Images:** Auto-converted to AVIF / WebP at build time via Astro's image pipeline

---

## Local development

Requires Node 20+.

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # production build → ./dist
npm run preview      # serve the built ./dist locally
```

The dev server hot-reloads on file changes.

### Project structure

```
.
├── public/                       # static assets served as-is (logos, favicon, robots.txt)
├── src/
│   ├── assets/projects/          # source images — Astro optimizes these to AVIF/WebP
│   ├── components/               # one .astro file per section (Hero, Services, …)
│   ├── data/site.ts              # SINGLE SOURCE OF TRUTH for copy, services, contact info
│   ├── layouts/Base.astro        # <head>, fonts, JSON-LD, scripts
│   ├── pages/index.astro         # the home page (composes the components)
│   ├── pages/about.astro         # standalone /about page (wraps the About component)
│   ├── pages/work/[slug].astro   # /work/showers, /work/mirrors, /work/interior-glass galleries
│   └── styles/global.css         # Tailwind import + brand tokens (@theme block)
├── worker/index.ts               # Cloudflare Worker — serves /dist + handles /api/contact
├── wrangler.jsonc                # Cloudflare deployment config
├── astro.config.mjs
└── package.json
```

### Where to edit common things

| Want to change…                | Edit                                       |
| ------------------------------ | ------------------------------------------ |
| Phone, email, service area     | `src/data/site.ts`                         |
| Service descriptions / bullets | `src/data/site.ts` → `services`            |
| Brand colors, fonts, spacing   | `src/styles/global.css` → `@theme` block   |
| Header navigation              | `src/components/Header.astro`              |
| Hero copy & headline           | `src/components/Hero.astro`                |
| Work category pages & galleries| `src/data/site.ts` → `workCategories`      |
| About page copy                | `src/components/About.astro`               |
| Add or replace a project photo | drop file in `src/assets/projects/`, then reference its base filename in `site.ts` |
| Contact form fields            | `src/components/Contact.astro`             |
| Form submission destination    | `src/components/Contact.astro` + `worker/index.ts`                 |

---

## Deploy

Pushes to `main` deploy automatically via Cloudflare Workers Builds. See `docs/DEPLOYMENT.md` for the one-time setup (Worker project, env vars, custom domain) and `docs/COLLABORATORS.md` to give the client (or another developer/agent) push access.

---

## Working with AI agents

This site is structured to be edited by Claude Code, Cursor, etc:

- All copy lives in `src/data/site.ts` — agents can update text without touching layout.
- Each section is its own small `.astro` file (~1 component per concern).
- Brand tokens are CSS variables in `global.css` — easy to retune without find/replace.
- Images are referenced by filename — drop a new file in `src/assets/projects/` and update the data file.

When asking an agent to make changes, point it at `src/data/site.ts` first; only fall back to the components for visual/structural changes.

---

## Changelog

### 2026-05-31 — Work pages, navbar dropdown, About page

- **Split "Selected Work" into dedicated category pages.** Removed the single-page showcase mosaic from the homepage. Created `/work/showers`, `/work/mirrors`, and `/work/interior-glass`, each a masonry gallery with a pill switcher to jump between categories. All driven by `workCategories` in `src/data/site.ts` via the dynamic route `src/pages/work/[slug].astro`.
- **Navbar "Work" is now a dropdown** (desktop + mobile) linking to the three category pages. Homepage anchors were made absolute (`/#services`, `/#contact`) so they work from sub-pages.
- **Services section:** tagline changed to "Crafted glass for residential and commercial builds," and each service card got a "View [category] →" link to its page.
- **Added 7 new real-project photos** (converted from HEIC → AVIF, stored in `src/assets/projects/`): 3 showers, 2 mirrors, and 2 interior glass including the wine room. Service cards now lead with these.
- **Moved the About section to its own `/about` page** (`src/pages/about.astro`) and removed it from the homepage to shorten the landing page. Navbar "About" now points to `/about`.
- Note: `src/components/Showcase.astro` is now unused (no longer imported) and can be deleted.

