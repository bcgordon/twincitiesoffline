# twincitiesoffline.com

The site for Twin Cities Offline, a Month Offline cohort (offline.community, phones from dumb.co). It is not an Own Your Media project: don't use OYM branding or the OYM Brand Kit here.

- **Look:** it must look made by a person, not AI. That means no gradient washes, no stock templates and no over-polish. Small tilts and imperfections are welcome. Colors are typewriter, ink and paper (see the top of `site/styles.css`). The design source is "A1" on the Twin Cities Offline design canvas.
- **No images** for now (BC's call, Nov 17 2026). The typed note is set in type, not a scan.
- **Words:** BC writes the copy. `[Brackets]` mark text still to come. Fix typos only, unless asked.
- **How it's built:** text lives in `content/`; `template.html` holds the layout; `node build.js` writes `dist/`; Cloudflare Pages runs that on every push to `main`. Keep it dependency-free, and keep it free of trackers and third-party requests.
- **Coming soon:** `coming_soon` in `content/settings.txt` blurs the page behind a sign. `functions/_middleware.js` lets the team past it with the `SITE_PASSWORD` secret, which lives in Cloudflare. Never put the password in the repo or in chat logs you write.
- **Readable:** text is big (body 20px) and the page has to work at phone width.
- **Changes arrive by pull request.** BC merges. Never push to `main`.
