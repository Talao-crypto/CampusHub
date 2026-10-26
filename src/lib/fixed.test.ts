import { describe, expect, it } from "vitest";
import { toFixedUnits, roundedRatio } from "./fixed";
import { daySchema } from "./validation";

describe("fixed point inputs", () => {
  it("accepts pt-BR and exact decimal quantities", () => {
    expect(toFixedUnits("0,10", 2)).toBe(10);
    expect(toFixedUnits("9.9999", 4)).toBe(99999);
    expect(toFixedUnits(" 1 ", 2)).toBe(100);
  });
  it.each(["NaN", "Infinity", "-1", "1e2", "1.000", "", "1,2,3", "9007199254740991"])("rejects unsupported input %s", (value) => expect(() => toFixedUnits(value, 2)).toThrow());
  it("rounds half up and truncates without floating-point drift", () => {
    expect(roundedRatio(6005n, 1000n, 2, "HALF_UP")).toBe(6.01);
    expect(roundedRatio(6005n, 1000n, 2, "TRUNCATE")).toBe(6);
    expect(roundedRatio(1n, 3n, 4, "HALF_UP")).toBe(0.3333);
  });
  it("rejects normalized invalid dates and accepts leap days", () => {
    expect(daySchema.safeParse("2026-02-30").success).toBe(false);
    expect(daySchema.safeParse("2024-02-29").success).toBe(true);
    expect(daySchema.safeParse("1999-12-31").success).toBe(false);
  });
});
