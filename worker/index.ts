// Cava Glass Builders — Cloudflare Worker entry.
// Serves static Astro build (./dist) via the ASSETS binding and handles
// contact-form verification + delivery.

interface Env {
  ASSETS: Fetcher;
  CONTACT_EMAIL?: SendEmail;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "GET") {
        return handleContactConfig(env);
      }

      if (request.method === "POST") {
        return handleContactSubmission(request, env);
      }

      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    // Everything else -> static asset
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

type ContactPayload = {
  company?: unknown;
  email?: unknown;
  message?: unknown;
  name?: unknown;
  phone?: unknown;
  project_type?: unknown;
  turnstileToken?: unknown;
  website?: unknown;
  "cf-turnstile-response"?: unknown;
};

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

async function handleContactConfig(env: Env): Promise<Response> {
  if (!env.TURNSTILE_SITE_KEY) {
    console.error("TURNSTILE_SITE_KEY not configured");
    return json({ ok: false, error: "Verification service not configured" }, 500);
  }

  return json({ ok: true, turnstileSiteKey: env.TURNSTILE_SITE_KEY });
}

async function handleContactSubmission(request: Request, env: Env): Promise<Response> {
  const configError = getSubmissionConfigError(env);
  if (configError) {
    console.error(configError);
    return json({ ok: false, error: "Contact form is not configured" }, 500);
  }

  let payload: ContactPayload;
  try {
    payload = await readContactPayload(request);
  } catch {
    return json({ ok: false, error: "Invalid form submission" }, 400);
  }

  // Honeypot: act successful so basic bots do not learn anything useful.
  if (cleanLine(payload.website)) {
    return json({ ok: true });
  }

  const name = cleanLine(payload.name, 120);
  const company = cleanLine(payload.company, 160);
  const email = cleanLine(payload.email, 200);
  const phone = cleanLine(payload.phone, 80);
  const projectType = cleanLine(payload.project_type, 120);
  const message = clean(payload.message, 5000);
  const turnstileToken = cleanLine(payload.turnstileToken || payload["cf-turnstile-response"], 2048);

  if (!name || !email || !message) {
    return json({ ok: false, error: "Please complete the required fields" }, 400);
  }

  if (!isValidEmail(email)) {
    return json({ ok: false, error: "Please enter a valid email address" }, 400);
  }

  if (!turnstileToken) {
    return json({ ok: false, error: "Please complete the verification" }, 400);
  }

  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || undefined;
  const verification = await verifyTurnstile(env.TURNSTILE_SECRET_KEY!, turnstileToken, ip);
  if (!verification.success) {
    console.warn("Turnstile verification failed", verification["error-codes"]);
    return json({ ok: false, error: "Verification failed. Please try again" }, 400);
  }

  const toEmail = env.CONTACT_TO_EMAIL || "cavaglassbuilders@gmail.com";
  const fromEmail = env.CONTACT_FROM_EMAIL || "website@cavaglassbuilders.com";
  const subject = `New inquiry from ${name}${company ? ` (${company})` : ""}`;

  await env.CONTACT_EMAIL!.send({
    from: { name: "Cava Glass Builders Website", email: fromEmail },
    to: toEmail,
    replyTo: { name, email },
    subject,
    text: [
      "New website inquiry",
      "",
      `Name: ${name}`,
      `Company: ${company || "-"}`,
      `Email: ${email}`,
      `Phone: ${phone || "-"}`,
      `Project Type: ${projectType || "-"}`,
      "",
      "Message:",
      message,
      "",
      `Submitted: ${new Date().toISOString()}`,
      `IP: ${ip || "-"}`,
      `Verified Hostname: ${verification.hostname || "-"}`,
    ].join("\n"),
  });

  return json({ ok: true });
}

function getSubmissionConfigError(env: Env): string | null {
  if (!env.TURNSTILE_SECRET_KEY) {
    return "TURNSTILE_SECRET_KEY not configured";
  }

  if (!env.CONTACT_EMAIL) {
    return "CONTACT_EMAIL send_email binding not configured";
  }

  return null;
}

async function readContactPayload(request: Request): Promise<ContactPayload> {
  const contentType = request.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as ContactPayload;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    return Object.fromEntries(form.entries()) as ContactPayload;
  }

  throw new Error("Unsupported content type");
}

async function verifyTurnstile(secret: string, token: string, remoteip?: string): Promise<TurnstileResponse> {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip,
      }),
    });

    if (!response.ok) {
      return { success: false, "error-codes": [`siteverify-${response.status}`] };
    }

    return (await response.json()) as TurnstileResponse;
  } catch (error) {
    console.error("Turnstile siteverify error", error);
    return { success: false, "error-codes": ["siteverify-unavailable"] };
  }
}

function clean(value: unknown, maxLength = 1000): string {
  return String(value || "")
    .replace(/[\r\n]+/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function cleanLine(value: unknown, maxLength = 1000): string {
  return clean(value, maxLength).replace(/\s+/g, " ");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
