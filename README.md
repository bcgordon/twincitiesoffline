# twincitiesoffline.com

The website for Twin Cities Offline, a Month Offline cohort in Minneapolis and Saint Paul.

It's one plain page with no tracking, no third-party scripts and no framework. The fonts are stored here too, so a visit doesn't call Google or anyone else.

## Changing what the site says

**The easy way: Pages CMS.** Go to [app.pagescms.org](https://app.pagescms.org), sign in with GitHub, and open `twincitiesoffline`. The sidebar has four screens:

- **Page text**: the intro line, the next cohort box, the note, "Why we're doing this", and the coming-soon sign
- **Events**: the calendar, one row per event, with add, remove and drag-to-reorder
- **How the month works**: the four steps
- **Settings and links**: the coming-soon switch, the Signal link, the email signup address, the calendar PDF upload, and the contact email

Click **Save** and Cloudflare publishes the change in about a minute.

**Inviting the team.** In Pages CMS, open the repo's **Collaborators** page and invite people **by email**. They don't need a GitHub account. They can edit the words and upload the calendar PDF, but they can't change the site's setup.

**First-time setup (once, by the repo owner).** Sign in at app.pagescms.org with GitHub. When it asks, install the Pages CMS GitHub app and give it access to `twincitiesoffline`.

**Writing tips** (the boxes are plain text):
- Leave a blank line between paragraphs.
- `**bold**` makes **bold**, and `*italic*` makes *italic*.
- `[words](https://example.com)` makes a link.

Empty boxes are fine. The site leaves that piece out or shows "coming soon".

**Without the CMS:** the same words live in `content/` as four small files (`page.json`, `events.json`, `steps.json`, `settings.json`). They can be edited on GitHub with the pencil button, but the CMS is friendlier. `.pages.yml` describes the CMS screens.

## Coming soon and the team password

While **Coming soon** is switched on (Pages CMS → Settings and links), visitors see the page blurred, with a "Coming soon" sign taped over it, and search engines are asked not to list it. On launch day, switch it off.

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

Type is American Typewriter throughout. Apple devices have it built in; everyone else sees Special Elite, a free typewriter face stored in the repo (see `FONTS.md`).

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
- `.pages.yml`: the Pages CMS editing screens
- `site/files/`: uploads from Pages CMS (the calendar PDF)
- `template.html`: the page layout, with `{{slots}}` that `build.js` fills
- `site/`: styles, fonts, icon; copied as-is into the finished site
- `build.js`: puts it together. It needs nothing but Node.
- `functions/_middleware.js`: the team password check (Cloudflare Pages Functions)
- `FONTS.md`: font licenses
