# PRIME Society — Static Site

A self-contained static replica of [primesociety.network](https://www.primesociety.network), built to replace the Wix-hosted site.

## Structure
- `index.html` — Home (hero, About, PRIME Tools, Team, CivitasNews, Newsletter, Footer)
- `about.html` — About PRIME Society + Daniel Schnaider bio
- `intro.html` — Introduction
- `kairos.html` — Kairos PRIME tool
- `civitasnews.html` — Articles + Books
- `engage.html` — Products, Sponsorship Plans, Donate CTA
- `contact.html` — Contact form + info
- `donate.html` — Donate flow
- `assets/css/styles.css` — All styles
- `assets/js/main.js` — Menu toggle, form handlers, donate selectors
- `assets/img/` — All images (downloaded from the original site)

## Local preview
```bash
python -m http.server 8765
# open http://localhost:8765
```

## Deploy
Deployed to [primesocietyweb.luby.digital](https://primesocietyweb.luby.digital) via Hostinger.

## Stack
Pure HTML / CSS / JS. No build step. No frameworks. No external runtime dependencies — only the Google Fonts CSS (Roboto).
