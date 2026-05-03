// Cloudflare Pages Function: POST /api/contact
// Forwards form submissions to Web3Forms (which delivers to the recipient
// email associated with the access key). No client-side secrets — the access
// key lives in the WEB3FORMS_ACCESS_KEY environment variable in Cloudflare.
//
// Setup (one-time, by site owner):
//   1. Sign up at https://web3forms.com using cavaglassbuilders@gmail.com
//   2. Copy the Access Key it issues
//   3. In Cloudflare Pages → cava-glass-builders → Settings → Variables and Secrets,
//      add:  WEB3FORMS_ACCESS_KEY  =  <your key>   (encrypt as a Secret)
//   4. Re-deploy

interface Env {
  WEB3FORMS_ACCESS_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;

  let payload: Record<string, string> = {};
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      payload = await request.json();
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

  // Required fields
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
    // Reply-To so hitting Reply in Gmail goes to the lead
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
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
