# Data model

| Entity | Purpose |
|---|---|
| `samples` | A physical wafer, chip, piece, or other tracked item. Self-reference represents parent/child splitting. |
| `events` | Append-oriented timeline records: creation, comments, images, location/status changes, and run-step activity. |
| `template_versions` | Immutable snapshots imported from FabuBlox as a process, module, or recipe. |
| `runs` | Assignment of one template version to one sample. |
| `run_steps` | Ordered, mutable execution state for the steps copied into a run. |
| `imports` | Pending/ready/failed state for one confirmed FabuBlox workbook import. |
| `assets` | R2 object metadata and readiness state for imported images. |
| `template_steps` | Structured immutable step records normalized from one template version. |
| `template_step_assets` | Relationship between an imported step and its layer-stack diagrams. |

R2 object keys are stored in D1. The bucket stays private and the Worker returns assets only through application routes. Exporters must replace those keys with relative paths inside the resulting ZIP.
