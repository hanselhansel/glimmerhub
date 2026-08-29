# GlimmerHub

See what is rising before it breaks.

This is the v1 local HTML prototype. It uses curated mock data to demonstrate the redesigned trend intelligence experience.

## Open the prototype

Open `apps/web/index.html` in any browser. No build or server is required.

## Repo structure

- `apps/web/` - the v1 static prototype (index.html, styles.css, app.js, data.js)
- `packages/entities/schema.json` - the shared entity data contract
- `data/` - JSON produced by the v2 build pipeline

## Data

`apps/web/data.js` contains realistic but static mock data. Replace it with `data/data.json` from the v2 build script when you are ready for real GitHub data.

## Roadmap

- v2: a local build script that fetches GitHub data and writes `data/data.json`
- v3: a multi-source backend with scheduled ingestion

## License

MIT
