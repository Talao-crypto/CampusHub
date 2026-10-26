"use server";

import { mutate, UserError, type ActionState } from "@/lib/server/action";
import { transaction } from "@/lib/server/transaction";
import { field } from "@/lib/validation";

export async function clearAcademicData(_: ActionState, data: FormData): Promise<ActionState> {
  return mutate(async (ownerId) => {
    if (field(data, "confirmation") !== "EXCLUIR") throw new UserError("Digite EXCLUIR para confirmar a remoção dos seus dados acadêmicos.");
    await transaction(async (tx) => {
      await tx.task.deleteMany({ where: { ownerId } });
      await tx.classOffering.deleteMany({ where: { ownerId } });
      await tx.subjectDefinition.deleteMany({ where: { ownerId } });
      await tx.academicTerm.deleteMany({ where: { ownerId } });
    });
  }, "Seus dados acadêmicos foram excluídos. A identidade demo foi mantida.");
}
