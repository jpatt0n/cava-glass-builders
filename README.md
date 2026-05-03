# Cava Glass Builders — Website

Single-page marketing site for [Cava Glass Builders](https://cavaglassbuilders.com), a Houston interior glass company.

- **Stack:** Astro 5 + Tailwind CSS 4, deployed as static HTML
- **Hosting:** Cloudflare Pages (auto-deploys on push to `main`)
- **Forms:** Cloudflare Pages Function → Web3Forms → Gmail
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
│   └── styles/global.css         # Tailwind import + brand tokens (@theme block)
├── functions/api/contact.ts      # Cloudflare Pages Function — handles form POSTs
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
| Showcase / project gallery     | `src/data/site.ts` → `showcase`            |
| Add or replace a project photo | drop file in `src/assets/projects/`, then reference its base filename in `site.ts` |
| Contact form fields            | `src/components/Contact.astro`             |
| Form submission destination    | `functions/api/contact.ts` + Web3Forms key |

---

## Deploy

Pushes to `main` deploy automatically via Cloudflare Pages. See `docs/DEPLOYMENT.md` for the one-time setup (Pages project, env vars, custom domain) and `docs/COLLABORATORS.md` to give the client (or another developer/agent) push access.

---

## Working with AI agents

This site is structured to be edited by Claude Code, Cursor, etc:

- All copy lives in `src/data/site.ts` — agents can update text without touching layout.
- Each section is its own small `.astro` file (~1 component per concern).
- Brand tokens are CSS variables in `global.css` — easy to retune without find/replace.
- Images are referenced by filename — drop a new file in `src/assets/projects/` and update the data file.

When asking an agent to make changes, point it at `src/data/site.ts` first; only fall back to the components for visual/structural changes.
