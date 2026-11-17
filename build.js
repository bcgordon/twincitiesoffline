// Builds the site: reads the text in content/, fills in template.html,
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

function settings() {
  const s = {};
  for (const line of read("content/settings.txt").split("\n")) {
    if (/^\s*(#|$)/.test(line)) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    s[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return s;
}

function steps() {
  return read("content/how-it-works.md")
    .replace(/\r/g, "")
    .split(/^##\s+/m)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const [title, ...rest] = b.split("\n");
      return `<li><h3>${inline(title)}</h3><div class="step-body">${markdown(rest.join("\n"))}</div></li>`;
    })
    .join("\n");
}

function events() {
  return read("content/events.txt")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const [date = "", time = "", name = "", place = "", tag = ""] = l.split("|").map((p) => p.trim());
      return `<li class="event">
  <div class="event-when">${inline(date)}${time ? `<span>${inline(time)}</span>` : ""}</div>
  <div class="event-what"><span class="event-name">${inline(name)}</span>${place ? `<span class="event-place">${inline(place)}</span>` : ""}</div>
  ${tag ? `<span class="event-tag">${inline(tag)}</span>` : ""}
</li>`;
    })
    .join("\n");
}

// ---- assemble ----

const s = settings();
const link = (url) => escape(url);

const calendarLinks = [
  s.calendar_pdf && `<a href="${link(s.calendar_pdf)}">Print the calendar (PDF)</a>`,
  s.add_event_link && `<a href="${link(s.add_event_link)}">Add your event</a>`,
].filter(Boolean);

const signup = s.signup_action
  ? `<form class="signup" action="${link(s.signup_action)}" method="post">
  <label for="email">Your email</label>
  <input id="email" name="email" type="email" placeholder="you@example.com" required>
  <button type="submit">Sign me up</button>
</form>`
  : `<p class="soon">Signups open soon.</p>`;

const description = read("content/intro.md").trim().replace(/\[|\]|\(.*?\)|\*/g, "");

// Coming soon: blur the page and put the sign over it. Team members who
// enter the password see the real page (functions/_middleware.js).
const soon = /^(on|yes|true)$/i.test(s.coming_soon || "");
const comingSoon = soon
  ? `<div id="coming-soon" class="soon-cover">
  <div class="sign" role="dialog" aria-modal="true" aria-labelledby="sign-title">
    <span class="tape tape-left" aria-hidden="true"></span>
    <span class="tape tape-right" aria-hidden="true"></span>
    <p class="eyebrow">Minneapolis · Saint Paul</p>
    <p id="sign-title" class="sign-title">Twin Cities Offline</p>
    <div class="sign-text">${markdown(read("content/coming-soon.md"), 2)}</div>
    <form class="team" action="/__team" method="post">
      <label for="team-password">On the team? Enter the password</label>
      <div class="team-row">
        <input id="team-password" name="password" type="password" autocomplete="current-password" required>
        <button type="submit">Let me in</button>
      </div>
      <p id="team-wrong" class="team-wrong" hidden>That's not it. Try again.</p>
    </form>
  </div>
</div>`
  : "";

const values = {
  robots: soon ? `<meta name="robots" content="noindex">` : "",
  body_class: soon ? ` class="is-soon"` : "",
  main_attrs: soon ? ` inert aria-hidden="true"` : "",
  coming_soon: comingSoon,
  description: escape(description),
  eyebrow: inline(s.eyebrow || ""),
  intro: markdown(read("content/intro.md")),
  signal_pill: s.signal_link ? `<a class="pill" href="${link(s.signal_link)}">Join the Signal group</a>` : "",
  cohort: markdown(read("content/cohort.md"), 2),
  cohort_button: s.cohort_link ? `<a class="pill" href="${link(s.cohort_link)}">Save me a spot</a>` : "",
  steps: steps(),
  calendar_note: s.calendar_note ? `<span class="calendar-note">${inline(s.calendar_note)}</span>` : "",
  events: events(),
  calendar_links: calendarLinks.length ? `<p class="calendar-links">${calendarLinks.join(" · ")}</p>` : "",
  bulletin: markdown(read("content/bulletin.md"), 3),
  signup,
  group_chat: markdown(read("content/group-chat.md")),
  signal_button: s.signal_link
    ? `<a class="pill pill-ink" href="${link(s.signal_link)}">Join on Signal</a>`
    : `<p class="soon">Link coming soon.</p>`,
  note: markdown(read("content/note.md")),
  why: markdown(read("content/why.md")),
  contact: s.contact_email ? ` · <a href="mailto:${link(s.contact_email)}">${escape(s.contact_email)}</a>` : "",
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
