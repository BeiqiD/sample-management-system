import { describe, expect, it } from "vitest";
import type { SampleEvent } from "../../shared/types";
import { filterSampleHistory, sampleEventCategory, sampleEventLabel } from "./sampleHistory";

function event(overrides: Partial<SampleEvent> = {}): SampleEvent {
  return {
    id: "event-1",
    sampleId: "sample-1",
    kind: "created",
    body: "Sample created",
    assetKey: null,
    metadata: {},
    actorEmail: null,
    createdAt: "2026-07-20T08:00:00.000Z",
    ...overrides,
  };
}

describe("sample history presentation", () => {
  it("uses specific, readable labels for known audit actions", () => {
    expect(sampleEventLabel(event({
      kind: "step",
      metadata: { action: "step_comment" },
    }))).toBe("Processing comment");
    expect(sampleEventLabel(event({ kind: "verification" }))).toBe("State verification");
  });

  it("separates important notes from processing and sample-level audit events", () => {
    const entries = [
      event({ id: "note", kind: "comment", metadata: { action: "sample_record" } }),
      event({ id: "process-comment", kind: "step", metadata: { action: "step_comment" } }),
      event({ id: "run", kind: "run" }),
      event({ id: "sample", kind: "status" }),
    ];

    expect(entries.map(sampleEventCategory)).toEqual(["notes", "notes", "processing", "sample"]);
    expect(filterSampleHistory(entries, "notes").map((entry) => entry.id)).toEqual(["note", "process-comment"]);
    expect(filterSampleHistory(entries, "all")).not.toBe(entries);
  });
});
