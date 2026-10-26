"use server";

import { z } from "@/lib/zod";
import { mutate, UserError, type ActionState } from "@/lib/server/action";
import { transaction } from "@/lib/server/transaction";
import { idSchema, decimalSchema, textSchema, field } from "@/lib/validation";
import { assessmentSchema, gradeRuleSchema } from "./domain";

export async function saveAssessment(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const id = z.string().max(100).parse(field(data, "id"));
    const offeringId = idSchema.parse(field(data, "offeringId"));
    const input = assessmentSchema.parse({
      name: textSchema().parse(field(data, "name")),
      weightBps: decimalSchema(2).parse(field(data, "weight")),
      scoreUnits: field(data, "score").trim() === "" ? null : decimalSchema(4).parse(field(data, "score")),
    });
    await transaction(async (tx) => {
      const offering = await tx.classOffering.findFirst({ where: { id: offeringId, ownerId }, include: { _count: { select: { assessments: true } } } });
      if (!offering) throw new UserError("Disciplina não encontrada.");
      if (input.scoreUnits !== null && input.scoreUnits > offering.gradeMaxUnits) throw new UserError("A nota deve estar dentro da escala configurada.");
      if (!id && offering._count.assessments >= 50) throw new UserError("O MVP permite até 50 avaliações por disciplina.");
      if (id) await tx.assessment.update({ where: { id, ownerId, offeringId }, data: input });
      else await tx.assessment.create({ data: { ownerId, offeringId, ...input } });
    });
  }, "Avaliação salva.");
}

export async function deleteAssessment(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const id = idSchema.parse(field(data, "id"));
    await transaction(async (tx) => { await tx.assessment.delete({ where: { id, ownerId } }); });
  }, "Avaliação removida.");
}

export async function saveGradeRule(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const offeringId = idSchema.parse(field(data, "offeringId"));
    const rule = gradeRuleSchema.parse({
      version: 1, kind: "WEIGHTED",
      maxUnits: decimalSchema(4).parse(field(data, "max")),
      thresholdUnits: decimalSchema(4).parse(field(data, "threshold")),
      decimals: Number(field(data, "decimals")), rounding: field(data, "rounding"),
    });
    await transaction(async (tx) => {
      const invalid = await tx.assessment.count({ where: { ownerId, offeringId, scoreUnits: { gt: rule.maxUnits } } });
      if (invalid) throw new UserError("A nova escala é menor que uma nota já registrada. Ajuste as notas primeiro.");
      await tx.classOffering.update({ where: { id_ownerId: { id: offeringId, ownerId } }, data: { gradeMaxUnits: rule.maxUnits, gradeThresholdUnits: rule.thresholdUnits, gradeDecimals: rule.decimals, gradeRounding: rule.rounding } });
    });
  }, "Regra de notas salva.");
}
