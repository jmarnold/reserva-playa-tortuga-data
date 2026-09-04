# reserva-playa-tortuga-data

Sea turtle nesting dashboard for [Reserva Playa Tortuga](https://reservaplayatortuga.org). This repo builds and publishes the monitoring microfrontend that is embedded at **https://reservaplayatortuga.org/monitoring**.

## How it works

The build produces a self-contained IIFE bundle (`dist/tortuga-charts.[hash].iife.js`) that registers a set of custom web components. A `dist/manifest.json` file is emitted alongside it pointing to the hashed filename. The host site (`reservaplayatortuga.org`) reads the manifest to load the correct bundle, which then renders the dashboard inside `index.html`.

Custom elements registered by the bundle:

| Element | Description |
|---|---|
| `<tortuga-stat-tiles>` | KPI summary tiles |
| `<tortuga-year-over-year>` | Year-over-year nesting trend |
| `<tortuga-activity-breakdown>` | Activity type breakdown |
| `<tortuga-nest-vs-poached>` | Nest vs. poached timeline |
| `<tortuga-clutch-size>` | Clutch size distribution |
| `<tortuga-species-phenology>` | Species phenology (full season) |
| `<tortuga-nests-by-month>` | Monthly nest counts |
| `<tortuga-nests-by-beach>` | Nests by beach |
| `<tortuga-beach-trend>` | Per-beach trend over time |
| `<tortuga-hatchery-productivity>` | Hatchery productivity |

## Development

```bash
npm install
npm run dev       # local dev server with index.html as the host page
npm run build     # produces dist/tortuga-charts.[hash].iife.js + dist/manifest.json
npm run preview   # serve the dist/ output locally
```

`index.html` at the repo root mirrors the markup used on the live monitoring page, so `npm run dev` gives an accurate local preview of what appears at https://reservaplayatortuga.org/monitoring.

## Data

Processed data files live in `data/`. To refresh them, see the scripts in that directory. After refreshing, commit the updated files and the host site picks up the new data on the next bundle load.
