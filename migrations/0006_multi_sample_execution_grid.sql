PRAGMA foreign_keys = ON;

CREATE TABLE run_step_comments (
  id TEXT PRIMARY KEY,
  run_step_id TEXT NOT NULL REFERENCES run_steps(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('common', 'individual')),
  operation_group_id TEXT,
  body TEXT NOT NULL,
  actor_email TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX run_step_comments_step_created_idx
ON run_step_comments(run_step_id, created_at, id);

CREATE INDEX run_step_comments_operation_group_idx
ON run_step_comments(operation_group_id)
WHERE operation_group_id IS NOT NULL;

INSERT INTO run_step_comments
  (id, run_step_id, scope, operation_group_id, body, actor_email, created_at)
SELECT lower(hex(randomblob(16))), id, 'individual', NULL, trim(notes), updated_by, updated_at
FROM run_steps
WHERE notes IS NOT NULL AND trim(notes) != '';
