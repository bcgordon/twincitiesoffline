# twincitiesoffline.com

The website for Twin Cities Offline, a Month Offline cohort in Minneapolis and Saint Paul.

It's one plain page with no tracking, no third-party scripts and no framework. The fonts are stored here too, so a visit doesn't call Google or anyone else.

## Changing what the site says

Everything you'd want to change is in `content/`. Edit a file on GitHub (open it, click the pencil, then "Commit changes"). Cloudflare rebuilds the site by itself within a minute or two.

| File | What it is |
|---|---|
| `content/coming-soon.md` | The words on the "Coming soon" sign. Add a signup link here when you have one, like `[Sign up if you're interested](https://...)` |
| `content/settings.txt` | `coming_soon` on or off, plus links: Signal group, email signup, printable calendar, "Save me a spot", contact email, and the small line above the title |
| `content/intro.md` | The line under the big title |
| `content/cohort.md` | The dark "Next cohort" box. The line starting with `#` is its heading |
| `content/how-it-works.md` | The four steps. Each step starts with `## ` and its title |
| `content/events.txt` | The calendar, one event per line: `date \| time \| name \| place \| tag` |
| `content/bulletin.md` | The heading on the email signup card |
| `content/group-chat.md` | The words on the Signal card |
| `content/note.md` | "A note from us", the typed letter |
| `content/why.md` | "Why we're doing this" |

In the `.md` files:
- Leave a blank line between paragraphs.
- `**bold**` makes **bold**, and `*italic*` makes *italic*.
- `[words](https://example.com)` makes a link.

When a setting in `settings.txt` is empty, the site leaves that piece out or shows "coming soon". Nothing breaks.

**The printable calendar:** put the PDF in `site/` (for example `site/calendar.pdf`) and write `calendar_pdf: calendar.pdf` in `settings.txt`.

## Coming soon and the team password

While `coming_soon: on` is in `content/settings.txt`, visitors see the page blurred, with a "Coming soon" sign taped over it, and search engines are asked not to list it. On launch day, change it to `coming_soon: off`.

The team gets past the sign by typing the password into the box on it. The site then remembers them for 30 days on that browser.

The password is **not** stored in this repo, where anyone who can see the code could read it. It's kept in Cloudflare:

- **Cloudflare dashboard → Workers & Pages → twincitiesoffline → Settings → Variables and Secrets → Add.**
- Type: **Secret**. Name: `SITE_PASSWORD`. Value: the team password.
- Add it for **Production** and for **Preview**, then redeploy (Deployments → ⋯ → Retry deployment).
- To change the password, edit that secret and redeploy. Everyone then has to enter the new one.

The check runs in `functions/_middleware.js`. The sign is a gate, not a safe: the page's text is still in the page source behind it. That's fine for a site that's about to be public, but don't put anything private on the page.

## Colors and type

Colors are typewriter, ink and paper. They're listed at the top of `site/styles.css`:

| Name | Hex | Used for |
|---|---|---|
| Bond paper | `#F2EDE3` | the page |
| Fresh sheet | `#FBF8F1` | cards, the typed note |
| Ribbon black | `#1C1A17` | text, rules, buttons |
| Ribbon red | `#A12E1D` | one accent per section, on paper only |
| Pen ink | `#23395D` | links, second accent |
| Graphite | `#57534B` | small print |

Type is Bricolage Grotesque for headings and text, IBM Plex Mono for small labels, Archivo for buttons, and American Typewriter for the typed parts. Special Elite stands in for American Typewriter on computers that don't have it.

## Hosting (Cloudflare Pages)

One-time setup, in the Cloudflare dashboard:

1. **Workers & Pages → Create → Pages → Connect to Git.** Pick `twincitiesoffline`.
2. Build settings:
   - Production branch: `main`
   - Framework preset: None
   - Build command: `node build.js`
   - Build output directory: `dist`
3. **Save and Deploy.** You get a `twincitiesoffline.pages.dev` address.
4. In the new project: **Custom domains → Set up a domain.** Add `twincitiesoffline.com`, then `www.twincitiesoffline.com`.
   - If the domain's DNS is already on Cloudflare, it's connected for you.
   - If not, Cloudflare shows the records to add where you bought the domain.

After that, every merge to `main` publishes the site.

## Working on it locally

```bash
node build.js
```

That writes the finished site to `dist/`. Open `dist/index.html` through a local server (for example `npx serve dist`) to see it with its fonts.

## Files

- `content/`: the words (see above)
- `template.html`: the page layout, with `{{slots}}` that `build.js` fills
- `site/`: styles, fonts, icon; copied as-is into the finished site
- `build.js`: puts it together. It needs nothing but Node.
- `functions/_middleware.js`: the team password check (Cloudflare Pages Functions)
- `FONTS.md`: font licenses
