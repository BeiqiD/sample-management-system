PRAGMA foreign_keys = ON;

CREATE TABLE imports (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('pending', 'ready', 'failed')),
  source_filename TEXT NOT NULL,
  source_sha256 TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('process', 'module', 'recipe')),
  template_version_id TEXT REFERENCES template_versions(id),
  workbook_asset_key TEXT,
  manifest_asset_key TEXT,
  warning_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  import_id TEXT REFERENCES imports(id) ON DELETE SET NULL,
  r2_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'ready', 'failed')),
  created_at TEXT NOT NULL
);

CREATE TABLE template_steps (
  id TEXT PRIMARY KEY,
  template_version_id TEXT NOT NULL REFERENCES template_versions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  source_row INTEGER,
  step_number TEXT,
  section_name TEXT,
  name TEXT NOT NULL,
  tool_name TEXT,
  parameters_text TEXT,
  comments_text TEXT,
  raw_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(template_version_id, position)
);

CREATE TABLE template_step_assets (
  template_step_id TEXT NOT NULL REFERENCES template_steps(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  PRIMARY KEY (template_step_id, asset_id)
);

ALTER TABLE run_steps ADD COLUMN template_step_id TEXT REFERENCES template_steps(id);
CREATE INDEX template_steps_version_idx ON template_steps(template_version_id, position);
CREATE INDEX assets_import_idx ON assets(import_id);
