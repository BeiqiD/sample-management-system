# Sample Management System

A low-friction, event-based sample log for fabrication work. The app is a single open-source Cloudflare Worker project: React and Vite provide the interface, Hono provides the API, D1 stores structured records, and private R2 stores workbooks and compressed images.

## MVP flow

1. Find or create a sample.
2. Add comments and phone photos to its timeline.
3. Import a FabuBlox Excel workbook in the browser and review its sheets and embedded media.
4. Store each confirmed import as an immutable process, module, or recipe version.

See [MVP_SPEC.md](./MVP_SPEC.md) for scope and [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) for the data model.

## Local development

```bash
npm install
npm run db:migrate:local
npm run dev
```

Cloudflare's Vite plugin runs the API inside the Workers runtime and uses local D1/R2 simulations by default.

## Deploy

Log in to Wrangler, then run:

```bash
npm run db:migrate:remote
npm run deploy
```

The `wrangler.jsonc` bindings intentionally omit production IDs so Wrangler can provision D1 and R2 resources during the first deployment. Review the generated binding identifiers before deploying migrations.

## Data ownership

The planned export format contains JSON tables, Markdown summaries, and assets using relative paths. No export should depend on a temporary signed URL.
