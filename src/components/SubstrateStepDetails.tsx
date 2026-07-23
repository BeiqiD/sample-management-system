import type { InitialSubstrateStep } from "../../shared/types";

const STANDARD_FIELDS = new Set([
  "step #",
  "step number",
  "step no",
  "step",
  "step name",
  "name",
  "tool name",
  "tool",
  "parameters",
  "parameter",
  "comments",
  "comment",
  "layer stacks",
  "layer stack",
]);

function normalizedField(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function SubstrateStepDetails({ step, className = "initial-substrate-details" }: {
  step: InitialSubstrateStep;
  className?: string;
}) {
  const additional = Object.entries(step.rawCells).filter(([label, value]) =>
    !STANDARD_FIELDS.has(normalizedField(label))
    && value !== null
    && value !== undefined
    && String(value).trim() !== "");
  return <dl className={className}>
    <dt>Tool</dt><dd>{step.toolName || "—"}</dd>
    <dt>Parameters</dt><dd>{step.parametersText || "—"}</dd>
    <dt>Comments</dt><dd>{step.commentsText || "—"}</dd>
    {additional.flatMap(([label, value]) => [
      <dt key={`${label}:label`}>{label}</dt>,
      <dd key={`${label}:value`}>{String(value)}</dd>,
    ])}
  </dl>;
}
