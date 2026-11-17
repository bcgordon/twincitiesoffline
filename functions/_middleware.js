// Cloudflare Pages runs this on every request.
//
// While the site is "coming soon" (content/settings.txt), everyone sees the
// page blurred behind the sign. The team enters the password on the sign;
// this checks it against SITE_PASSWORD (set in the Cloudflare dashboard,
// never in this repo), remembers them for 30 days with a cookie, and shows
// them the page without the sign.

const COOKIE = "tco_team";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

async function teamToken(password) {
  const bytes = new TextEncoder().encode("twincitiesoffline-team:" + password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameText(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function redirect(location, headers = {}) {
  return new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store", ...headers } });
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const password = env.SITE_PASSWORD || "";

  // The password form on the sign posts here.
  if (url.pathname === "/__team") {
    if (request.method !== "POST") return redirect("/");
    const form = await request.formData();
    const given = String(form.get("password") || "");
    if (password && sameText(given, password)) {
      const cookie = `${COOKIE}=${await teamToken(password)}; Path=/; Max-Age=${THIRTY_DAYS}; HttpOnly; Secure; SameSite=Lax`;
      return redirect("/", { "Set-Cookie": cookie });
    }
    return redirect("/?team=wrong");
  }

  const response = await next();
  if (!(response.headers.get("Content-Type") || "").includes("text/html")) return response;

  const cookies = (request.headers.get("Cookie") || "").split(/;\s*/);
  const isTeam = password && cookies.includes(`${COOKIE}=${await teamToken(password)}`);

  let rewriter = new HTMLRewriter();
  if (isTeam) {
    rewriter = rewriter
      .on("#coming-soon", { element: (el) => el.remove() })
      .on("body", { element: (el) => el.removeAttribute("class") })
      .on("main", { element: (el) => { el.removeAttribute("inert"); el.removeAttribute("aria-hidden"); } });
  } else if (url.searchParams.get("team") === "wrong") {
    rewriter = rewriter.on("#team-wrong", { element: (el) => el.removeAttribute("hidden") });
  }

  const page = rewriter.transform(response);
  const headers = new Headers(page.headers);
  headers.set("Cache-Control", "no-store"); // team and visitors see different pages
  return new Response(page.body, { status: page.status, headers });
}
