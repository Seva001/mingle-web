import { describe, expect, it } from "vitest";
import { COMPATIBILITY_WEIGHTS } from "@/lib/compatibility/weights";

describe("initial compatibility weights (hypotheses, brief §6)", () => {
  it("sum to 100%", () => {
    const total = Object.values(COMPATIBILITY_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
  });
});
