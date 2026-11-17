# Fonts

The whole site is set in **American Typewriter**. It comes with Apple devices (Mac, iPhone, iPad), so those visitors see it. It isn't free to put on a website, so it is not stored here.

Everyone else (Windows, Android) sees **Special Elite**, a free typewriter face stored in `site/fonts/` so the site makes no outside requests.

| File | Font | License |
|---|---|---|
| `special-elite-400.woff2` | Special Elite (Latin subset from Google Fonts) | Apache License 2.0 |

To show American Typewriter to everyone, buy a web license for it (it's an ITC font, sold by Monotype/MyFonts), add the `.woff2` files to `site/fonts/`, and add an `@font-face` for them at the top of `site/styles.css`.
