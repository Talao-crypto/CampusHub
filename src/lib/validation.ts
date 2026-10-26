import { z } from "@/lib/zod";
import { toFixedUnits } from "./fixed";

export const idSchema = z.string().min(1, "Registro obrigatório.").max(100, "Identificador inválido.");
export const textSchema = (max = 100) => z.string().trim().min(1, "Preencha este campo.").max(max, `Use no máximo ${max} caracteres.`);
export const decimalSchema = (decimals: number) => z.string().transform((value, context) => {
  try { return toFixedUnits(value, decimals); }
  catch (error) { context.addIssue({ code: "custom", message: error instanceof Error ? error.message : "Número inválido." }); return z.NEVER; }
});
export const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.").refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value && value >= "2000-01-01" && value <= "2100-12-31";
}, "Data inválida. Use uma data entre 2000 e 2100.");
export function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}
