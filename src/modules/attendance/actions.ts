"use server";

import { z } from "@/lib/zod";
import { mutate, UserError, type ActionState } from "@/lib/server/action";
import { transaction } from "@/lib/server/transaction";
import { idSchema, daySchema, decimalSchema, field } from "@/lib/validation";
import { calculateAttendance } from "./domain";

const absenceSchema = z.object({
  id: z.string().max(100), offeringId: idSchema, date: daySchema,
  units: decimalSchema(2).pipe(z.number().int().min(1, "A quantidade deve ser maior que zero.").max(1_000_000)),
  note: z.string().trim().max(200, "Use até 200 caracteres na observação."),
});

export async function saveAbsence(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const input = absenceSchema.parse({ id: field(data, "id"), offeringId: field(data, "offeringId"), date: field(data, "date"), units: field(data, "units"), note: field(data, "note") });
    await transaction(async (tx) => {
      const offering = await tx.classOffering.findFirst({ where: { id: input.offeringId, ownerId }, include: { absences: true } });
      if (!offering) throw new UserError("Disciplina não encontrada.");
      if (input.id && !offering.absences.some((item) => item.id === input.id)) throw new UserError("Falta não encontrada.");
      if (!input.id && offering.absences.length >= 250) throw new UserError("O MVP permite até 250 registros de falta por disciplina.");
      const total = offering.absences.filter((item) => item.id !== input.id).reduce((sum, item) => sum + item.units, 0) + input.units;
      try { calculateAttendance({ unit: offering.attendanceUnit, totalUnits: offering.totalUnits, minimumBps: offering.minAttendanceBps }, total); }
      catch { throw new UserError("As faltas devem respeitar a carga prevista e a unidade de contagem (aulas inteiras ou horas com até duas casas)."); }
      const values = { date: new Date(`${input.date}T00:00:00.000Z`), units: input.units, note: input.note || null };
      if (input.id) await tx.absence.update({ where: { id: input.id, ownerId, offeringId: input.offeringId }, data: values });
      else await tx.absence.create({ data: { ownerId, offeringId: input.offeringId, ...values } });
    });
  }, "Registro de falta salvo.");
}

export async function deleteAbsence(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const id = idSchema.parse(field(data, "id"));
    await transaction(async (tx) => { await tx.absence.delete({ where: { id, ownerId } }); });
  }, "Falta removida.");
}
