# GlimmerHub

See what is rising before it breaks.

This is the v1.2 GlimmerHub prototype. It uses curated mock data to demonstrate a redesigned, agentic trend intelligence experience.

## Live site

After the `main` branch is deployed, the site is available at `https://hanselhansel.github.io/glimmerhub/`. Point a custom domain at it once the domain is registered.

## Open the prototype locally

Open `apps/web/index.html` in any browser. No build is required. A local server is recommended so the relative `data.json` or `data.js` loads correctly.

```bash
cd apps/web
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Repo structure

- `apps/web/` - the v1.2 static prototype (index.html, theme.css, layout.css, components.css, rubric.js, utils.js, score.js, radar.js, render.js, app.js, data.js)
- `packages/entities/schema.json` - the shared entity data contract
- `packages/scoring/rubric.json` - the scoring rubric for the Glimmer Score
- `data/` - JSON produced by the v2 build pipeline
- `.github/workflows/pages.yml` - GitHub Pages deployment

## Glimmer Score

The Glimmer Score is a weighted, transparent signal that explains why a project is rising and how credible the momentum is. The rubric is defined in `packages/scoring/rubric.json` and `apps/web/rubric.js`. The detail view shows the score breakdown on every project.

## Data

`apps/web/data.js` contains realistic but static mock data. Replace it with `data/data.json` from the v2 build script when you are ready for real GitHub data.

## Roadmap

- v2: a local build script that fetches GitHub data and writes `data/data.json`
- v3: a multi-source backend with scheduled ingestion

## License

MIT
