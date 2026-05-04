# Deployment — Cloudflare Workers (Static Assets)

The site lives at **https://cavaglassbuilders.com** and is deployed automatically by Cloudflare Workers Builds on every push to the `main` branch of the GitHub repo.

We use the modern **Workers + Static Assets** model (not classic Pages):
- Astro builds static HTML/CSS/JS into `./dist`
- A small Worker entry at `worker/index.ts` serves those files via the `ASSETS` binding
- The same Worker exposes runtime contact-form config at `GET /api/contact`

Configuration lives in [`wrangler.jsonc`](../wrangler.jsonc).

## One-time setup (already done if the site is live)

### 1. Create the Worker via Workers Builds

In the Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository**:

- Select the `jpatt0n/cava-glass-builders` GitHub repo
- **Production branch:** `main`
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Non-production branch deploy command:** `npx wrangler versions upload`
- **Path:** `/`

### 2. Add the Web3Forms access key

In the Worker → **Settings → Variables and Secrets → Production**:

| Name                    | Value                       | Type   |
| ----------------------- | --------------------------- | ------ |
| `WEB3FORMS_ACCESS_KEY`  | (from web3forms.com signup) | Secret |

To get the Web3Forms key: sign up at https://web3forms.com using `cavaglassbuilders@gmail.com`. Submissions will be delivered to that inbox.

Web3Forms access keys are public form IDs, not private API tokens. We store the key in Cloudflare so it does not have to be committed to the repo, but the browser still receives it from `GET /api/contact` and submits directly to Web3Forms. This is required for the free Web3Forms flow; server-side submissions require a paid Web3Forms plan plus server IP safelisting.

Re-deploy after adding or changing the value so the Worker picks it up.

### 3. Enable Web Analytics

**Web Analytics** (free, no cookie banner needed):

1. Cloudflare dashboard → **Web Analytics** → **Add a site**
2. Pick `cavaglassbuilders.com`
3. Enable Real User Measurements (RUM) automatic injection in Cloudflare
4. Do not add the manual JS snippet to the Astro layout

### 4. Connect the custom domain

In the Worker → **Settings → Domains & Routes** → **Add** → **Custom domain**:

- Add `cavaglassbuilders.com`
- Add `www.cavaglassbuilders.com` (will redirect to apex)

Cloudflare auto-creates the necessary DNS records since the domain is on the same Cloudflare account.

## How deploys work

1. You (or an agent) push a commit to `main`
2. Workers Builds detects the push, runs `npm install && npm run build`
3. Astro generates static HTML in `dist/`
4. `npx wrangler deploy` reads `wrangler.jsonc`, uploads `dist/*` as static assets and deploys `worker/index.ts`
5. Site is live within ~60s

Preview branches get a `<branch>-cava-glass-builders.<account>.workers.dev` preview URL.

## Local Worker preview (optional)

To preview exactly what production runs (static assets + the `/api/contact` Worker) locally:

```bash
npm run build
npm run wrangler:dev    # serves on http://localhost:8787
```

For everyday work, `npm run dev` (Astro dev server) is faster — but it doesn't run the Worker, so the form will fail locally. That's expected.

## Rolling back

In the Worker → **Deployments**, click any prior deployment → **Rollback**. Instant revert with no rebuild.
