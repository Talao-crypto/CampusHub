import { describe, expect, it } from "vitest";
import { calculateAttendance, type AttendancePolicy } from "./domain";

const policy: AttendancePolicy = { unit: "SESSION", totalUnits: 8000, minimumBps: 7500 };
describe("attendance estimates", () => {
  it("calculates scheduled load, absences, allowance and percentage", () => {
    expect(calculateAttendance(policy, 400)).toEqual({ scheduled: 80, absences: 4, allowed: 20, remaining: 16, percentage: 95, status: "OK" });
  });
  it("flags approaching, exact and exceeded limits", () => {
    expect(calculateAttendance(policy, 1600).status).toBe("ATTENTION");
    expect(calculateAttendance(policy, 2000)).toMatchObject({ remaining: 0, status: "ATTENTION" });
    expect(calculateAttendance(policy, 2100)).toMatchObject({ remaining: 0, status: "EXCEEDED" });
  });
  it("floors fractional session allowances and preserves fractional hours", () => {
    const base = { totalUnits: 700, minimumBps: 7500 };
    expect(calculateAttendance({ ...base, unit: "SESSION" }, 100).allowed).toBe(1);
    expect(calculateAttendance({ ...base, unit: "HOUR" }, 125)).toMatchObject({ allowed: 1.75, remaining: 0.5, percentage: 82.14 });
  });
  it("supports zero and full required attendance", () => {
    expect(calculateAttendance({ ...policy, minimumBps: 0 }, 8000).status).toBe("ATTENTION");
    expect(calculateAttendance({ ...policy, minimumBps: 10000 }, 0)).toMatchObject({ allowed: 0, remaining: 0, status: "ATTENTION" });
    expect(calculateAttendance({ ...policy, minimumBps: 10000 }, 100).status).toBe("EXCEEDED");
  });
  it.each([-100, 1.5, 50, 8100, Number.NaN])("rejects invalid absence quantities: %s", (units) => expect(() => calculateAttendance(policy, units)).toThrow());
  it("rejects empty loads, invalid percentages and fractional session totals", () => {
    expect(() => calculateAttendance({ ...policy, totalUnits: 0 }, 0)).toThrow();
    expect(() => calculateAttendance({ ...policy, minimumBps: 10001 }, 0)).toThrow();
    expect(() => calculateAttendance({ ...policy, totalUnits: 750 }, 0)).toThrow();
  });
});
