# Deployment — Cloudflare Workers (Static Assets)

The site lives at **https://cavaglassbuilders.com** and is deployed automatically by Cloudflare Workers Builds on every push to the `main` branch of the GitHub repo.

We use the modern **Workers + Static Assets** model (not classic Pages):
- Astro builds static HTML/CSS/JS into `./dist`
- A small Worker entry at `worker/index.ts` serves those files via the `ASSETS` binding
- The same Worker handles the contact form at `/api/contact`, verifies Turnstile, and sends the inquiry email

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

### 2. Configure contact-form email and Turnstile

In the Worker → **Settings → Variables and Secrets → Production**:

| Name                   | Value                                   | Type     |
| ---------------------- | --------------------------------------- | -------- |
| `TURNSTILE_SITE_KEY`   | (from the Cloudflare Turnstile widget)  | Variable |
| `TURNSTILE_SECRET_KEY` | (from the Cloudflare Turnstile widget)  | Secret   |

`CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` are committed in `wrangler.jsonc`:

| Name                 | Value                         |
| -------------------- | ----------------------------- |
| `CONTACT_FROM_EMAIL` | `website@cavaglassbuilders.com` |
| `CONTACT_TO_EMAIL`   | `cavaglassbuilders@gmail.com` |

#### Turnstile widget

In Cloudflare dashboard → **Turnstile** → **Add widget**:

1. Name it `Cava Glass Builders contact form`
2. Add hostnames:
   - `cavaglassbuilders.com`
   - `www.cavaglassbuilders.com`
   - any preview hostname you want to test
3. Use **Managed** mode
4. Copy the site key to `TURNSTILE_SITE_KEY`
5. Copy the secret key to `TURNSTILE_SECRET_KEY`

#### Email binding

In Cloudflare dashboard → **Email** / **Email Routing**:

1. Enable Email Routing for `cavaglassbuilders.com`
2. Verify `cavaglassbuilders@gmail.com` as a destination address
3. Make sure `website@cavaglassbuilders.com` is allowed as a sender/from address for Worker email

The Worker email binding is committed in `wrangler.jsonc`:

```jsonc
"send_email": [
  {
    "name": "CONTACT_EMAIL",
    "destination_address": "cavaglassbuilders@gmail.com"
  }
]
```

Re-deploy after adding or changing these values so the Worker picks them up.

`WEB3FORMS_ACCESS_KEY` is no longer used and can be removed from the Worker secrets after this migration is deployed.

`wrangler.jsonc` has `keep_vars` enabled so dashboard-managed Turnstile variables are preserved during deploys. If `GET /api/contact` returns `Verification service not configured`, re-check that `TURNSTILE_SITE_KEY` exists on the deployed Worker environment.

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
