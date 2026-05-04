// Cava Glass Builders — Cloudflare Worker entry.
// Serves static Astro build (./dist) via the ASSETS binding and handles
// runtime contact-form configuration.

interface Env {
  ASSETS: Fetcher;
  WEB3FORMS_ACCESS_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Form configuration. Web3Forms expects free-plan submissions to come
    // from the browser; server-side submissions require IP safelisting.
    if (url.pathname === "/api/contact") {
      if (request.method !== "GET") {
        return json({ ok: false, error: "Method not allowed" }, 405);
      }
      return handleContactConfig(env);
    }

    // Everything else → static asset
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleContactConfig(env: Env): Promise<Response> {
  if (!env.WEB3FORMS_ACCESS_KEY) {
    console.error("WEB3FORMS_ACCESS_KEY not configured");
    return json({ ok: false, error: "Email service not configured" }, 500);
  }

  return json({ ok: true, accessKey: env.WEB3FORMS_ACCESS_KEY });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
