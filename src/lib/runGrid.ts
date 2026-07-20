import type { RunStep, SampleDetail, SampleRun } from "../../shared/types";

export interface RunGridColumn {
  sample: SampleDetail;
  run: SampleRun | null;
}

export interface RunGridRow {
  key: string;
  kind: "template" | "ad_hoc";
  recipeStep: RunStep | null;
  steps: Array<RunStep | null>;
}

function orderedSteps(run: SampleRun | null) {
  return run ? [...run.steps].sort((left, right) => left.position - right.position) : [];
}

export function buildRunGrid(columns: RunGridColumn[]): RunGridRow[] {
  const primaryRun = columns[0]?.run ?? null;
  if (!primaryRun) return [];
  const primaryTemplateSteps = orderedSteps(primaryRun).filter((step) => step.origin === "template");
  const templateStepsByColumn = columns.map(({ run }) => orderedSteps(run).filter((step) => step.origin === "template"));
  const primaryIndexByTemplateId = new Map(
    primaryTemplateSteps.flatMap((step, index) => step.templateStepId ? [[step.templateStepId, index] as const] : []),
  );

  const templateRows = primaryTemplateSteps.map<RunGridRow>((recipeStep, recipeIndex) => ({
    key: `template:${recipeStep.templateStepId ?? recipeIndex}`,
    kind: "template",
    recipeStep,
    steps: templateStepsByColumn.map((steps) => recipeStep.templateStepId
      ? steps.find((step) => step.templateStepId === recipeStep.templateStepId) ?? null
      : steps[recipeIndex] ?? null),
  }));

  const adHocByAnchor = new Map<number, RunGridRow[]>();
  columns.forEach(({ run }, columnIndex) => {
    const steps = orderedSteps(run);
    let templateOrdinal = -1;
    let anchorIndex = -1;
    for (const step of steps) {
      if (step.origin === "template") {
        templateOrdinal += 1;
        anchorIndex = step.templateStepId
          ? primaryIndexByTemplateId.get(step.templateStepId) ?? templateOrdinal
          : templateOrdinal;
        continue;
      }
      const rowSteps = Array.from<RunStep | null>({ length: columns.length }).fill(null);
      rowSteps[columnIndex] = step;
      const rows = adHocByAnchor.get(anchorIndex) ?? [];
      rows.push({
        key: `ad_hoc:${columnIndex}:${step.id}`,
        kind: "ad_hoc",
        recipeStep: null,
        steps: rowSteps,
      });
      adHocByAnchor.set(anchorIndex, rows);
    }
  });

  const rows = [...(adHocByAnchor.get(-1) ?? [])];
  templateRows.forEach((row, index) => {
    rows.push(row, ...(adHocByAnchor.get(index) ?? []));
  });
  return rows;
}
