# MVP specification

## Goal

Make recording fabrication history less painful than maintaining an Obsidian database: open the site, find a sample, add a record, and continue working.

## Included

- Search and recent samples at `/` (no dashboard).
- Create a sample at `/samples/new`.
- Sample detail at `/samples/:sampleId`, including parent/children, facts, and an event timeline.
- Comments and directly captured images; browser-side compression is intentionally aggressive.
- FabuBlox workbook parsing at `/imports/fabublox` before upload.
- Extraction of worksheet values and OOXML embedded media.
- Relationship- and anchor-aware mapping of FabuBlox layer-stack drawings to normalized steps.
- Immutable process/module/recipe template versions at `/templates`.
- Assigning a template version creates a run checklist; step status, notes, and images append to the sample timeline.
- Export one sample as a ZIP containing Markdown, JSON, and all timeline images with relative paths.
- D1 for records and private R2 for workbook/image assets.
- Local development and one-Worker deployment.

## Next vertical slices

1. Export all versioned tables and R2 assets.
2. Add sample location/status mutations as explicit timeline events.
3. Add Cloudflare Access deployment notes and authorization checks.

## Explicit exclusions for the first slice

- General analytics/dashboard views.
- Editing an imported template version in place.
- SEM or other large raw instrument data.
- A traditional always-on server.
