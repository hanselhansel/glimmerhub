# GlimmerHub

Open-source movement, explained with evidence.

GlimmerHub is a static prototype for personalized open-source intelligence. It turns repository momentum into a lead thesis, supporting signals, and source-linked project briefings.

## Run locally

```bash
cd apps/web
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Prototype features

- General weekly briefing with one lead signal and a ranked movement list
- Physical AI lens for robotics, embodied AI, simulation, and robot learning
- Custom local lenses built from a description, themes, exclusions, and example repositories
- Dedicated project briefings with evidence, risks, alternatives, and score breakdowns
- Two-project comparison
- Light and dark themes
- Responsive desktop and mobile layouts

Custom lenses and theme preference are stored in the browser under `glimmerhub-preferences-v1`. No account or backend is used.

## Routes

The static site uses hash routes so every view works on GitHub Pages:

- `#briefings`
- `#project/<repository-id>`
- `#compare/<repository-id>/<repository-id>`
- `#topics`
- `#sources`
- `#lens/new`
- `#lens/<lens-id>/edit`

## Repository structure

- `apps/web/` contains the static application, mock data, lens logic, renderers, and styles
- `apps/web/assets/brand/` contains replaceable SVG brand assets
- `packages/entities/schema.json` defines the tracked entity shape
- `packages/scoring/rubric.json` defines the Glimmer Score
- `DESIGN.md` defines the visual and interaction rules
- `tests/` contains Node tests for routing, lens ranking, storage fallback, and the page shell

## Verify

```bash
node --test tests/*.test.js
for file in apps/web/*.js tests/*.js; do node --check "$file"; done
```

## Data note

The repository metrics and editorial statements are prototype fixtures. They demonstrate the product model and should not be treated as current market data.

## Roadmap

- v2: fetch current GitHub metadata through a local build script
- v3: ingest GitHub, Hacker News, Product Hunt, Reddit, and package usage on a schedule

## License

MIT
