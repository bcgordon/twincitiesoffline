// Builds the site: reads the words in content/ (JSON files that Pages CMS
// edits), fills in template.html,
// and writes the finished site to dist/ (with everything in site/).
// No packages needed. Run: node build.js

const fs = require("fs");
const path = require("path");

const root = __dirname;
const out = path.join(root, "dist");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

// ---- small helpers ----

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Links, **bold** and *italic*, after escaping.
function inline(text) {
  let s = escape(text.trim());
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    if (!/^(https?:|mailto:|\/|#)/.test(url)) return m;
    return `<a href="${url}">${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return s.replace(/\n/g, "<br>");
}

// Paragraphs split by blank lines. "# " lines become headings of the given level.
function markdown(text, headingLevel = 2) {
  return text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const h = b.match(/^#\s+(.*)$/s);
      if (h) return `<h${headingLevel}>${inline(h[1])}</h${headingLevel}>`;
      return `<p>${inline(b)}</p>`;
    })
    .join("\n");
}

// The words, as saved by Pages CMS (or by hand). Missing keys are fine.
const json = (f) => JSON.parse(read("content/" + f));
const s = json("settings.json");
const page = json("page.json");
const str = (v) => (v == null ? "" : String(v));

function steps() {
  return json("steps.json")
    .map((st) => `<li><h3>${inline(str(st.title))}</h3><div class="step-body">${markdown(str(st.body))}</div></li>`)
    .join("\n");
}

function events() {
  return json("events.json")
    .filter((ev) => str(ev.name).trim() || str(ev.date).trim())
    .map((ev) => {
      const time = str(ev.time).trim(), place = str(ev.place).trim(), tag = str(ev.tag).trim();
      return `<li class="event">
  <div class="event-when">${inline(str(ev.date))}${time ? `<span>${inline(time)}</span>` : ""}</div>
  <div class="event-what"><span class="event-name">${inline(str(ev.name))}</span>${place ? `<span class="event-place">${inline(place)}</span>` : ""}</div>
  ${tag ? `<span class="event-tag">${inline(tag)}</span>` : ""}
</li>`;
    })
    .join("\n");
}

// A heading plus paragraphs, for the boxes that have both.
const titled = (heading, body, level) =>
  (str(heading).trim() ? `<h${level}>${inline(str(heading))}</h${level}>\n` : "") + markdown(str(body));

// ---- assemble ----

const link = (url) => escape(str(url).trim());

const calendarLinks = [
  str(s.calendar_pdf).trim() && `<a href="${link(s.calendar_pdf)}">Print the calendar (PDF)</a>`,
  str(s.add_event_link).trim() && `<a href="${link(s.add_event_link)}">Add your event</a>`,
].filter(Boolean);

const signup = str(s.signup_action).trim()
  ? `<form class="signup" action="${link(s.signup_action)}" method="post">
  <label for="email">Your email</label>
  <input id="email" name="email" type="email" placeholder="you@example.com" required>
  <button type="submit">Sign me up</button>
</form>`
  : `<p class="soon">Signups open soon.</p>`;

const description = str(page.intro).trim().replace(/\[|\]|\(.*?\)|\*/g, "");

// Coming soon: blur the page and put the sign over it. Team members who
// enter the password see the real page (functions/_middleware.js).
const soon = s.coming_soon === true || /^(on|yes|true)$/i.test(str(s.coming_soon));
const comingSoon = soon
  ? `<div id="coming-soon" class="soon-cover">
  <div class="sign" role="dialog" aria-modal="true" aria-labelledby="sign-title">
    <span class="tape tape-left" aria-hidden="true"></span>
    <span class="tape tape-right" aria-hidden="true"></span>
    <p class="eyebrow">Minneapolis · Saint Paul</p>
    <p id="sign-title" class="sign-title">Twin Cities Offline</p>
    <div class="sign-text">${titled(page.coming_soon_heading, page.coming_soon_body, 2)}</div>
    <form class="team" action="/__team" method="post">
      <label for="team-password">On the team? Enter the password</label>
      <div class="team-row">
        <input id="team-password" name="password" type="password" autocomplete="current-password" required>
        <button type="submit">Let me in</button>
      </div>
      <p id="team-wrong" class="team-wrong" hidden>That's not it. Try again.</p>
      <p id="team-unset" class="team-wrong" hidden>The team password isn't set up on the site yet. (Cloudflare: add the SITE_PASSWORD secret, then redeploy.)</p>
    </form>
  </div>
</div>`
  : "";

const signal = str(s.signal_link).trim();
const values = {
  robots: soon ? `<meta name="robots" content="noindex">` : "",
  body_class: soon ? ` class="is-soon"` : "",
  main_attrs: soon ? ` inert aria-hidden="true"` : "",
  coming_soon: comingSoon,
  description: escape(description),
  eyebrow: inline(str(s.eyebrow)),
  intro: markdown(str(page.intro)),
  signal_pill: signal ? `<a class="pill" href="${link(signal)}">Join the Signal group</a>` : "",
  cohort: titled(page.cohort_heading, page.cohort_body, 2),
  cohort_button: str(s.cohort_link).trim() ? `<a class="pill" href="${link(s.cohort_link)}">Save me a spot</a>` : "",
  steps: steps(),
  calendar_note: str(s.calendar_note).trim() ? `<span class="calendar-note">${inline(str(s.calendar_note))}</span>` : "",
  events: events(),
  calendar_links: calendarLinks.length ? `<p class="calendar-links">${calendarLinks.join(" · ")}</p>` : "",
  bulletin: titled(page.bulletin_heading, "", 3),
  signup,
  group_chat: markdown(str(page.group_chat)),
  signal_button: signal
    ? `<a class="pill pill-ink" href="${link(signal)}">Join on Signal</a>`
    : `<p class="soon">Link coming soon.</p>`,
  note: markdown(str(page.note)),
  why: markdown(str(page.why)),
  contact: str(s.contact_email).trim() ? ` · <a href="mailto:${link(s.contact_email)}">${escape(str(s.contact_email).trim())}</a>` : "",
};

let html = read("template.html");
html = html.replace(/\{\{(\w+)\}\}/g, (m, key) => {
  if (!(key in values)) throw new Error(`template.html asks for {{${key}}}, which build.js doesn't know`);
  return values[key];
});

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, "site"), out, { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), html);
console.log("Built dist/index.html");
