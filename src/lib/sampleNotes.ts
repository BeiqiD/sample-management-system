import { isSampleRecordEvent } from "../../shared/sample-records";
import type { SampleDetail, SampleEvent } from "../../shared/types";

export type SampleNoteKind = "sample_record" | "process_comment" | "execution_detail" | "deviation" | "state_mismatch" | "blocked_step";

export interface SampleNote {
  id: string;
  kind: SampleNoteKind;
  label: string;
  body: string;
  assetKey: string | null;
  thumbnailKey: string | null;
  actorEmail: string | null;
  createdAt: string;
  context: string;
  runId: string | null;
  stepId: string | null;
  sampleEvent: SampleEvent | null;
}

function eventThumbnailKey(event: SampleEvent) {
  return typeof event.metadata.thumbnailKey === "string"
    ? event.metadata.thumbnailKey
    : event.assetKey;
}

export function collectSampleNotes(sample: SampleDetail): SampleNote[] {
  const notes: SampleNote[] = sample.events
    .filter((event) => isSampleRecordEvent(event.kind, event.metadata))
    .map((event) => ({
      id: `sample:${event.id}`,
      kind: "sample_record",
      label: "Sample note",
      body: event.body?.trim() || (event.assetKey ? "Photo observation" : "Empty note"),
      assetKey: event.assetKey,
      thumbnailKey: eventThumbnailKey(event),
      actorEmail: event.actorEmail,
      createdAt: event.createdAt,
      context: "Added directly to this sample",
      runId: null,
      stepId: null,
      sampleEvent: event,
    }));

  const verificationEvents = new Map<string, SampleEvent>();
  for (const event of sample.events) {
    const verificationId = typeof event.metadata.verificationId === "string"
      ? event.metadata.verificationId
      : null;
    if (verificationId) verificationEvents.set(verificationId, event);
  }

  for (const run of sample.runs) {
    for (const step of run.steps) {
      const context = `Run ${run.sequenceNo} · ${run.templateName} v${run.templateVersion} · ${step.title}`;
      for (const comment of step.comments) {
        notes.push({
          id: `comment:${comment.id}`,
          kind: "process_comment",
          label: comment.scope === "common" ? "Common process comment" : "Process comment",
          body: comment.body.trim() || (comment.assetKey ? "Photo observation" : "Empty comment"),
          assetKey: comment.assetKey,
          thumbnailKey: comment.assetKey,
          actorEmail: comment.actorEmail,
          createdAt: comment.createdAt,
          context,
          runId: run.id,
          stepId: step.id,
          sampleEvent: null,
        });
      }

      const executionDetail = step.commentsText?.trim() || "";
      const plannedDetail = step.plannedCommentsText?.trim() || "";
      if (executionDetail && (step.origin === "ad_hoc" || executionDetail !== plannedDetail)) {
        notes.push({
          id: `execution:${step.id}`,
          kind: "execution_detail",
          label: "Execution note",
          body: executionDetail,
          assetKey: null,
          thumbnailKey: null,
          actorEmail: null,
          createdAt: step.updatedAt,
          context,
          runId: run.id,
          stepId: step.id,
          sampleEvent: null,
        });
      }

      if (step.status === "blocked") {
        notes.push({
          id: `blocked:${step.id}`,
          kind: "blocked_step",
          label: "Blocked step",
          body: step.deviationNote?.trim() || step.notes?.trim() || "This step is currently blocked.",
          assetKey: null,
          thumbnailKey: null,
          actorEmail: null,
          createdAt: step.updatedAt,
          context,
          runId: run.id,
          stepId: step.id,
          sampleEvent: null,
        });
      } else if (step.deviationNote?.trim()) {
        notes.push({
          id: `deviation:${step.id}`,
          kind: "deviation",
          label: "Process deviation",
          body: step.deviationNote.trim(),
          assetKey: null,
          thumbnailKey: null,
          actorEmail: null,
          createdAt: step.updatedAt,
          context,
          runId: run.id,
          stepId: step.id,
          sampleEvent: null,
        });
      }

      const verification = step.stateVerification;
      if (verification?.result === "mismatched") {
        const sourceEvent = verificationEvents.get(verification.id) ?? null;
        notes.push({
          id: `verification:${verification.id}`,
          kind: "state_mismatch",
          label: "State mismatch",
          body: verification.note?.trim() || "The observed structure did not match the expected state.",
          assetKey: sourceEvent?.assetKey ?? null,
          thumbnailKey: sourceEvent?.assetKey ?? null,
          actorEmail: verification.actorEmail,
          createdAt: verification.createdAt,
          context,
          runId: run.id,
          stepId: step.id,
          sampleEvent: null,
        });
      }
    }
  }

  return notes.sort((left, right) => {
    const byTime = Date.parse(right.createdAt) - Date.parse(left.createdAt);
    return byTime || left.id.localeCompare(right.id);
  });
}
