"use server";

import { z } from "@/lib/zod";
import { mutate, UserError, type ActionState } from "@/lib/server/action";
import { transaction } from "@/lib/server/transaction";
import { idSchema, textSchema, daySchema, field } from "@/lib/validation";

export async function saveTask(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const input = z.object({ id: z.string().max(100), title: textSchema(160), dueDate: daySchema, offeringId: z.string().max(100), status: z.enum(["TODO", "DONE"]) }).parse({ id: field(data, "id"), title: field(data, "title"), dueDate: field(data, "dueDate"), offeringId: field(data, "offeringId"), status: field(data, "status") });
    await transaction(async (tx) => {
      if (input.offeringId && !await tx.classOffering.findFirst({ where: { id: input.offeringId, ownerId }, select: { id: true } })) throw new UserError("Disciplina não encontrada.");
      if (!input.id && await tx.task.count({ where: { ownerId } }) >= 1000) throw new UserError("O MVP permite até 1.000 tarefas por estudante.");
      const values = { title: input.title, dueDate: new Date(`${input.dueDate}T00:00:00.000Z`), offeringId: input.offeringId || null, status: input.status };
      if (input.id) await tx.task.update({ where: { id: input.id, ownerId }, data: values });
      else await tx.task.create({ data: { ownerId, ...values } });
    });
  }, "Tarefa salva.");
}

export async function toggleTask(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const id = idSchema.parse(field(data, "id"));
    const status = z.enum(["TODO", "DONE"]).parse(field(data, "status"));
    await transaction(async (tx) => { await tx.task.update({ where: { id, ownerId }, data: { status } }); });
  }, "Status atualizado.");
}

export async function deleteTask(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    const id = idSchema.parse(field(data, "id"));
    await transaction(async (tx) => { await tx.task.delete({ where: { id, ownerId } }); });
  }, "Tarefa excluída.");
}
