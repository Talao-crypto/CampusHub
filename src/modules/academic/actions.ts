"use server";

import { z } from "@/lib/zod";
import { mutate, UserError, type ActionState } from "@/lib/server/action";
import { transaction } from "@/lib/server/transaction";
import { idSchema, textSchema, decimalSchema, field } from "@/lib/validation";
import { attendancePolicySchema, calculateAttendance } from "@/modules/attendance/domain";

const schema = z.object({
  id: z.string().max(100),
  code: textSchema(24).transform((value) => value.toUpperCase()),
  name: textSchema(),
  term: textSchema(30),
  color: z.enum(["indigo", "teal", "amber", "rose"]),
  unit: z.enum(["SESSION", "HOUR"]),
  totalUnits: decimalSchema(2),
  minimumBps: decimalSchema(2),
});

export async function saveOffering(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const input = schema.parse({ id: field(data, "id"), code: field(data, "code"), name: field(data, "name"), term: field(data, "term"), color: field(data, "color"), unit: field(data, "unit"), totalUnits: field(data, "total"), minimumBps: field(data, "minimum") });
    const policy = attendancePolicySchema.parse({ unit: input.unit, totalUnits: input.totalUnits, minimumBps: input.minimumBps });
    await transaction(async (tx) => {
      const existing = input.id ? await tx.classOffering.findFirst({ where: { id: input.id, ownerId }, include: { absences: true } }) : null;
      if (input.id && !existing) throw new UserError("Disciplina não encontrada.");
      if (!existing && await tx.classOffering.count({ where: { ownerId } }) >= 100) throw new UserError("O MVP permite até 100 disciplinas por estudante.");
      if (existing && existing.absences.length && existing.attendanceUnit !== input.unit) throw new UserError("Remova as faltas antes de alterar a unidade de contagem.");
      try { calculateAttendance(policy, existing?.absences.reduce((sum, item) => sum + item.units, 0) ?? 0); }
      catch { throw new UserError("A carga prevista não pode ser menor que as faltas registradas."); }
      const institution = await tx.institution.findUnique({ where: { slug: "puc-campinas" } });
      if (!institution) throw new UserError("Execute npm run db:seed antes de cadastrar disciplinas.");
      const subject = await tx.subjectDefinition.upsert({
        where: { ownerId_institutionId_code: { ownerId, institutionId: institution.id, code: input.code } },
        create: { ownerId, institutionId: institution.id, code: input.code, name: input.name },
        update: { name: input.name },
      });
      const term = await tx.academicTerm.upsert({
        where: { ownerId_institutionId_label: { ownerId, institutionId: institution.id, label: input.term } },
        create: { ownerId, institutionId: institution.id, label: input.term }, update: {},
      });
      const values = { subjectId: subject.id, termId: term.id, color: input.color, attendanceUnit: policy.unit, totalUnits: policy.totalUnits, minAttendanceBps: policy.minimumBps };
      if (existing) await tx.classOffering.update({ where: { id_ownerId: { id: existing.id, ownerId } }, data: values });
      else await tx.classOffering.create({ data: { ownerId, ...values } });
    });
  }, "Disciplina salva.");
}

export async function deleteOffering(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const id = idSchema.parse(field(data, "id"));
    if (field(data, "confirm") !== "on") throw new UserError("Confirme a exclusão da disciplina.");
    await transaction(async (tx) => {
      await tx.task.updateMany({ where: { ownerId, offeringId: id }, data: { offeringId: null } });
      await tx.classOffering.delete({ where: { id_ownerId: { id, ownerId } } });
    });
  }, "Disciplina excluída. As tarefas foram mantidas sem vínculo.");
}
