export interface TemplateStepSnapshot {
  position: number;
  title: string;
}

export function templateStepsFromContent(content: unknown): TemplateStepSnapshot[] {
  if (!content || typeof content !== "object") return [];
  const steps = (content as { steps?: unknown }).steps;
  if (!Array.isArray(steps)) return [];
  return steps.flatMap((step, index) => {
    if (typeof step === "string") {
      const title = step.trim();
      return title ? [{ position: index, title }] : [];
    }
    if (!step || typeof step !== "object") return [];
    const candidate = step as { title?: unknown; name?: unknown };
    const title = String(candidate.title ?? candidate.name ?? "").trim();
    if (!title) return [];
    const rawPosition = Number((step as { position?: unknown }).position);
    return [{ position: Number.isInteger(rawPosition) ? rawPosition : index, title }];
  }).sort((a, b) => a.position - b.position).map((step, position) => ({ ...step, position }));
}
