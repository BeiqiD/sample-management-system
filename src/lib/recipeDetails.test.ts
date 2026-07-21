import { describe, expect, it } from "vitest";
import { parameterEntryCount } from "./recipeDetails";

describe("parameterEntryCount", () => {
  it("counts non-empty parameter lines", () => {
    expect(parameterEntryCount("Time: 60 s\nTemperature: 100 C\nPressure: 2 mbar")).toBe(3);
  });

  it("ignores blank lines and accepts Windows line endings", () => {
    expect(parameterEntryCount("Dose: 10\r\n\r\n  \r\nEnergy: 100")).toBe(2);
  });

  it("returns zero when no parameters are planned", () => {
    expect(parameterEntryCount(null)).toBe(0);
    expect(parameterEntryCount("   ")).toBe(0);
  });
});
