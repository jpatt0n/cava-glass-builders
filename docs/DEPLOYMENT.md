# Deployment — Cloudflare Pages

The site lives at **https://cavaglassbuilders.com** and is deployed automatically by Cloudflare Pages on every push to the `main` branch of the GitHub repo.

## One-time setup (already done if the site is live)

### 1. Create the Pages project

In the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**:

- Select the `cava-glass-builders` GitHub repo
- **Production branch:** `main`
- **Framework preset:** Astro
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** `20` (set as `NODE_VERSION` env var)

### 2. Add the Web3Forms secret

In **Settings → Variables and Secrets → Production**:

| Name                    | Value                       | Type   |
| ----------------------- | --------------------------- | ------ |
| `WEB3FORMS_ACCESS_KEY`  | (from web3forms.com signup) | Secret |
| `NODE_VERSION`          | `20`                        | Plain  |

To get the Web3Forms key: sign up at https://web3forms.com using `cavaglassbuilders@gmail.com`. Submissions will be delivered to that inbox.

Re-deploy after adding secrets so the Function picks them up.

### 3. Enable Web Analytics

**Web Analytics** (free, no cookie banner needed):

1. Cloudflare dashboard → **Web Analytics** → **Add a site**
2. Pick `cavaglassbuilders.com`
3. Copy the JS snippet's **token**
4. Open `src/layouts/Base.astro`, find `data-cf-beacon` and replace `REPLACE_WITH_TOKEN` with the token
5. Commit, push — auto-deploys

### 4. Connect the custom domain

In **Pages → cava-glass-builders → Custom domains**:

- Add `cavaglassbuilders.com`
- Add `www.cavaglassbuilders.com` (will redirect to apex)

Cloudflare auto-creates the necessary CNAME / proxy entries since the domain is on Cloudflare DNS.

## How deploys work

1. You (or an agent) push a commit to `main`
2. Cloudflare Pages detects the push, runs `npm install && npm run build`
3. Astro generates static HTML in `dist/`
4. Cloudflare Pages also picks up the `functions/` directory and deploys it as Workers behind `/api/*`
5. Site is live within ~60s

You can preview every PR — Pages creates a `*.pages.dev` preview URL per branch automatically.

## Rolling back

In **Pages → Deployments**, click any prior deployment → **Rollback to this deployment**. Instant revert with no rebuild.
