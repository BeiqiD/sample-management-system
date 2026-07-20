import { describe, expect, it } from "vitest";
import { templateStepsFromContent } from "./template-steps";

describe("template step snapshots", () => {
  it("normalizes titles and positions", () => {
    expect(templateStepsFromContent({ steps: [
      { position: 4, title: " Etch " },
      { position: 1, title: "Coat" },
      { title: "Develop" },
      { title: "" },
    ] })).toEqual([
      { position: 0, title: "Coat" },
      { position: 1, title: "Develop" },
      { position: 2, title: "Etch" },
    ]);
  });

  it("rejects content without explicit mapped steps", () => {
    expect(templateStepsFromContent({ sheets: [] })).toEqual([]);
  });
});
