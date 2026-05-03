# Adding collaborators (so the client / other agents can push)

## Give the client push access on GitHub

1. Go to https://github.com/jpatt0n/cava-glass-builders/settings/access
2. Click **Add people**
3. Enter the client's GitHub username (or email — they'll get an invite)
4. Role: **Write** (lets them push and merge PRs but not change repo settings)
5. They'll get an email invite — once accepted they can `git clone` and push.

If the client doesn't have a GitHub account yet, send them to https://github.com/join — sign up with `cavaglassbuilders@gmail.com`.

## Letting an AI agent push on the client's behalf

Two safe options:

### Option A — agent pushes branches, human merges (recommended)

The client (or you) creates a [GitHub Personal Access Token](https://github.com/settings/tokens?type=beta) scoped to *just* this repo with **Read & write** on Contents and Pull requests. Hand the token to the agent (e.g. paste into a `.env` file the agent reads). The agent can push to feature branches and open PRs, but a human reviews and clicks Merge → Pages then deploys.

### Option B — agent pushes straight to `main`

Same token as above, but the agent pushes to `main` and Pages deploys immediately. Faster, less safe. Use only if you trust the agent and you have the rollback button (see `DEPLOYMENT.md`).

## Local clone for the client

Once invited, the client (or anyone with access) can:

```bash
git clone https://github.com/jpatt0n/cava-glass-builders.git
cd cava-glass-builders
npm install
npm run dev
```

…and start editing. First push will pop up GitHub auth in a browser (Git Credential Manager handles it on Windows; macOS uses Keychain).

## Branch protection (optional, recommended once stable)

Settings → Branches → Add rule for `main`:

- Require pull request before merging
- Require Cloudflare Pages preview to succeed

This stops anyone (human or agent) from pushing broken code straight to production.
