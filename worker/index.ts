// Cava Glass Builders — Cloudflare Worker entry.
// Serves static Astro build (./dist) via the ASSETS binding and handles
// the /api/contact form submission.

interface Env {
  ASSETS: Fetcher;
  WEB3FORMS_ACCESS_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Form handler
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405);
      }
      return handleContact(request, env);
    }

    // Everything else → static asset
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleContact(request: Request, env: Env): Promise<Response> {
  let payload: Record<string, string> = {};
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      payload = (await request.json()) as Record<string, string>;
    } else {
      const fd = await request.formData();
      fd.forEach((v, k) => (payload[k] = String(v)));
    }
  } catch {
    return json({ ok: false, error: "Invalid request body" }, 400);
  }

  // Honeypot — silently accept and drop
  if (payload.website && payload.website.trim() !== "") {
    return json({ ok: true });
  }

  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim();
  const message = (payload.message || "").trim();
  if (!name || !email || !message) {
    return json({ ok: false, error: "Missing required fields" }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Invalid email" }, 400);
  }

  if (!env.WEB3FORMS_ACCESS_KEY) {
    console.error("WEB3FORMS_ACCESS_KEY not configured");
    return json({ ok: false, error: "Email service not configured" }, 500);
  }

  const subject = `New inquiry from ${name}${payload.company ? ` (${payload.company})` : ""}`;

  const body = {
    access_key: env.WEB3FORMS_ACCESS_KEY,
    subject,
    from_name: "Cava Glass Builders Website",
    name,
    email,
    phone: payload.phone || "",
    company: payload.company || "",
    project_type: payload.project_type || "",
    message,
    replyto: email,
  };

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
    if (!res.ok || data.success === false) {
      console.error("web3forms error", res.status, data);
      return json({ ok: false, error: data.message || "Upstream failure" }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error("contact handler error", err);
    return json({ ok: false, error: "Network error" }, 502);
  }
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
