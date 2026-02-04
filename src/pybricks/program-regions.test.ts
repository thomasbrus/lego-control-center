import { expect, it, describe } from "vitest";
import { PybricksProgramRegionId, requireProgramRegion } from "./program-regions";

describe("requireProgramRegion", () => {
  it("returns code for the given region", () => {
    const code = requireProgramRegion(PybricksProgramRegionId.LightCommands);
    expect(code).toContain("hub.light.on");
  });

  it("throws error for missing region", () => {
    expect(() => {
      requireProgramRegion("non-existent-region" as PybricksProgramRegionId);
    }).toThrowError("Program region not found: non-existent-region");
  });
});
