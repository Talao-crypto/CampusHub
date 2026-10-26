import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "@/lib/zod";
import { UserError } from "@/lib/errors";
import { requireUser, assertMutationOrigin } from "./auth";
import { rateLimit } from "./rate-limit";

export type ActionState = { status: "idle" | "success" | "error"; message: string };
export const initialState: ActionState = { status: "idle", message: "" };
export { UserError };

export function safeError(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Confira os campos informados.";
  if (error instanceof UserError) return error.message;
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "INTERNAL";
  if (code === "P2002") return "Já existe uma disciplina com esse código neste período.";
  if (code === "P2025") return "Registro não encontrado ou sem permissão de acesso.";
  if (code === "P2034") return "Os dados foram alterados em outra janela. Tente novamente.";
  console.error("CampusHub operation failed", { code });
  return "Não foi possível salvar. Confira a conexão com o banco e tente novamente.";
}

export async function mutate(operation: (ownerId: string) => Promise<void>, message = "Alterações salvas."): Promise<ActionState> {
  // Framework redirects / 404s must propagate outside the error boundary.
  const user = await requireUser();
  try {
    await assertMutationOrigin();
    rateLimit(`write:${user.id}`);
    await operation(user.id);
  } catch (error) {
    return { status: "error", message: safeError(error) };
  }
  revalidatePath("/", "layout");
  return { status: "success", message };
}
