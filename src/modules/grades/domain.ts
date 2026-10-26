import { z } from "@/lib/zod";
import { roundedRatio } from "@/lib/fixed";

export const gradeRuleSchema = z.object({
  version: z.literal(1),
  kind: z.literal("WEIGHTED"),
  maxUnits: z.number().int().min(1).max(1_000_000),
  thresholdUnits: z.number().int().min(0).max(1_000_000),
  decimals: z.number().int().min(0).max(4),
  rounding: z.enum(["HALF_UP", "TRUNCATE"]),
}).strict().refine((rule) => rule.thresholdUnits <= rule.maxUnits, {
  message: "A média mínima deve estar dentro da escala.", path: ["thresholdUnits"],
});
export type GradeRule = z.infer<typeof gradeRuleSchema>;
export const assessmentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  weightBps: z.number().int().min(1).max(10_000),
  scoreUnits: z.number().int().min(0).max(1_000_000).nullable(),
}).strict();
export type AssessmentInput = z.infer<typeof assessmentSchema>;

/** Fixed-point scores /10000 and weights /10000. Approval uses the unrounded average. */
export function calculateGrades(input: GradeRule, items: readonly AssessmentInput[]) {
  const rule = gradeRuleSchema.parse(input);
  const assessments = z.array(assessmentSchema).max(50).parse(items);
  if (assessments.some((item) => item.scoreUnits !== null && item.scoreUnits > rule.maxUnits)) {
    throw new Error("Uma nota está acima da escala configurada.");
  }
  const weightBps = assessments.reduce((sum, item) => sum + item.weightBps, 0);
  const errors: string[] = [];
  if (assessments.length === 0) errors.push("Adicione pelo menos uma avaliação.");
  if (weightBps !== 10_000) errors.push(`Os pesos devem somar 100% (atualmente ${weightBps / 100}%).`);
  if (errors.length) return { valid: false as const, errors, weightBps };

  const entered = assessments.filter((item) => item.scoreUnits !== null);
  const enteredWeight = entered.reduce((sum, item) => sum + item.weightBps, 0);
  const weighted = entered.reduce((sum, item) => sum + BigInt(item.scoreUnits ?? 0) * BigInt(item.weightBps), 0n);
  const missingWeight = 10_000 - enteredWeight;
  const complete = missingWeight === 0;
  const needed = BigInt(rule.thresholdUnits) * 10_000n - weighted;
  // Ceiling in the supported input quantum (0.0001), including when multiple scores are missing.
  const requiredUnits = missingWeight === 0 || needed <= 0n ? 0n : (needed + BigInt(missingWeight) - 1n) / BigInt(missingWeight);
  const future = complete ? "COMPLETE" : needed <= 0n ? "SECURED" : requiredUnits > BigInt(rule.maxUnits) ? "IMPOSSIBLE" : "REQUIRED";
  return {
    valid: true as const,
    errors: [],
    weightBps,
    complete,
    enteredWeightBps: enteredWeight,
    currentAverage: enteredWeight === 0 ? null : roundedRatio(weighted, BigInt(enteredWeight) * 10_000n, rule.decimals, rule.rounding),
    contribution: roundedRatio(weighted, 100_000_000n, rule.decimals, rule.rounding),
    finalAverage: complete ? roundedRatio(weighted, 100_000_000n, rule.decimals, rule.rounding) : null,
    approved: complete ? needed <= 0n : null,
    future,
    requiredGrade: future === "REQUIRED" ? Number(requiredUnits) / 10_000 : future === "SECURED" ? 0 : null,
  };
}
