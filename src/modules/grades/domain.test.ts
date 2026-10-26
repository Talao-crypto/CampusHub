import { describe, expect, it } from "vitest";
import { calculateGrades, gradeRuleSchema, type GradeRule } from "./domain";

const rule: GradeRule = { version: 1, kind: "WEIGHTED", maxUnits: 100000, thresholdUnits: 60000, decimals: 2, rounding: "HALF_UP" };
const first = { name: "Prova 1", weightBps: 4000, scoreUnits: 80000 };
const final = { name: "Prova 2", weightBps: 6000, scoreUnits: 60000 };
describe("weighted grade rules v1", () => {
  it("calculates weighted averages and approval", () => {
    expect(calculateGrades(rule, [first, final])).toMatchObject({ valid: true, complete: true, finalAverage: 6.8, approved: true, future: "COMPLETE" });
  });
  it("distinguishes zero from a missing score and rounds required grades upward", () => {
    expect(calculateGrades(rule, [first, { ...final, scoreUnits: null }])).toMatchObject({ currentAverage: 8, contribution: 3.2, finalAverage: null, requiredGrade: 4.6667, future: "REQUIRED", approved: null });
    expect(calculateGrades(rule, [{ ...first, scoreUnits: 0 }, final])).toMatchObject({ complete: true, finalAverage: 3.6, approved: false });
  });
  it("supports multiple missing assessments with a common required score", () => {
    expect(calculateGrades(rule, [{ name: "A", weightBps: 2500, scoreUnits: 80000 }, { name: "B", weightBps: 2500, scoreUnits: null }, { name: "C", weightBps: 5000, scoreUnits: null }])).toMatchObject({ requiredGrade: 5.3334 });
  });
  it("handles no scores, already secured and impossible goals", () => {
    expect(calculateGrades(rule, [{ ...first, scoreUnits: null }, { ...final, scoreUnits: null }])).toMatchObject({ currentAverage: null, requiredGrade: 6 });
    expect(calculateGrades(rule, [{ ...first, weightBps: 8000, scoreUnits: 100000 }, { ...final, weightBps: 2000, scoreUnits: null }])).toMatchObject({ future: "SECURED", requiredGrade: 0 });
    expect(calculateGrades(rule, [{ ...first, weightBps: 8000, scoreUnits: 0 }, { ...final, weightBps: 2000, scoreUnits: null }])).toMatchObject({ future: "IMPOSSIBLE", requiredGrade: null });
  });
  it("does not approve based on presentation rounding", () => {
    expect(calculateGrades(rule, [{ name: "Final", weightBps: 10000, scoreUnits: 59999 }])).toMatchObject({ finalAverage: 6, approved: false });
    expect(calculateGrades(rule, [{ name: "Final", weightBps: 10000, scoreUnits: 60050 }])).toMatchObject({ finalAverage: 6.01 });
    expect(calculateGrades({ ...rule, rounding: "TRUNCATE" }, [{ name: "Final", weightBps: 10000, scoreUnits: 60050 }])).toMatchObject({ finalAverage: 6 });
  });
  it("supports a different scale and exact approval boundary", () => {
    expect(calculateGrades({ ...rule, maxUnits: 1000000, thresholdUnits: 700000 }, [{ name: "Final", weightBps: 10000, scoreUnits: 700000 }])).toMatchObject({ finalAverage: 70, approved: true });
  });
  it("reports incomplete or excessive weight totals", () => {
    expect(calculateGrades(rule, []).valid).toBe(false);
    expect(calculateGrades(rule, [first])).toMatchObject({ valid: false, weightBps: 4000 });
    expect(calculateGrades(rule, [first, final, final]).valid).toBe(false);
  });
  it("rejects invalid rules, scores, unsupported formula input and nonpositive weights", () => {
    expect(gradeRuleSchema.safeParse({ ...rule, formula: "alert(1)" }).success).toBe(false);
    expect(() => calculateGrades({ ...rule, thresholdUnits: 100001 }, [first, final])).toThrow();
    expect(() => calculateGrades(rule, [{ ...first, scoreUnits: 100001 }, final])).toThrow();
    expect(() => calculateGrades(rule, [{ ...first, weightBps: 0 }])).toThrow();
    expect(() => calculateGrades(rule, [{ ...first, scoreUnits: Number.NaN }])).toThrow();
  });
});
