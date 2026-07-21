import { describe, expect, it } from "vitest";
import { createSplitPieceDrafts, nextChildNumber } from "./splitSamples";

describe("split sample numbering", () => {
  it("starts direct children at one", () => {
    expect(nextChildNumber("SOD-014", [])).toBe(1);
  });

  it("continues after the highest matching numeric child", () => {
    expect(nextChildNumber("SOD-014", ["SOD-014-1", "SOD-014-note", "SOD-014-7", "OTHER-20"])).toBe(8);
  });

  it("creates editable stored pieces at the explicitly supplied location", () => {
    expect(createSplitPieceDrafts({
      code: "SOD-014",
      title: "Etch test",
      description: "Parent context",
      children: [{ id: "existing", code: "SOD-014-1", title: "Etch test" }],
    }, 2, "Box B")).toEqual([
      { code: "SOD-014-2", title: "Etch test", description: "Parent context", location: "Box B", status: "stored" },
      { code: "SOD-014-3", title: "Etch test", description: "Parent context", location: "Box B", status: "stored" },
    ]);
  });
});
