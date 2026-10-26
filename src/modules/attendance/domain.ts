import { z } from "@/lib/zod";

export const attendancePolicySchema = z.object({
  unit: z.enum(["SESSION", "HOUR"]),
  totalUnits: z.number().int().min(1).max(1_000_000),
  minimumBps: z.number().int().min(0).max(10_000),
}).strict().refine((policy) => policy.unit === "HOUR" || policy.totalUnits % 100 === 0, {
  message: "A quantidade de aulas deve ser inteira.", path: ["totalUnits"],
});
export type AttendancePolicy = z.infer<typeof attendancePolicySchema>;

/** Units are hundredths; SESSION quantities must be multiples of 100. No official policy is assumed. */
export function calculateAttendance(input: AttendancePolicy, absenceUnits: number) {
  const policy = attendancePolicySchema.parse(input);
  const step = policy.unit === "SESSION" ? 100 : 1;
  if (!Number.isSafeInteger(absenceUnits) || absenceUnits < 0 || absenceUnits > policy.totalUnits || absenceUnits % step !== 0) {
    throw new Error("Faltas incompatíveis com a carga prevista ou com a unidade selecionada.");
  }
  const allowedUnits = Math.floor(policy.totalUnits * (10_000 - policy.minimumBps) / (10_000 * step)) * step;
  const remainingUnits = Math.max(0, allowedUnits - absenceUnits);
  const status = absenceUnits > allowedUnits ? "EXCEEDED"
    : remainingUnits <= allowedUnits * 0.2 ? "ATTENTION" : "OK";
  return {
    scheduled: policy.totalUnits / 100,
    absences: absenceUnits / 100,
    allowed: allowedUnits / 100,
    remaining: remainingUnits / 100,
    percentage: Math.round((policy.totalUnits - absenceUnits) * 10_000 / policy.totalUnits) / 100,
    status,
  } as const;
}
