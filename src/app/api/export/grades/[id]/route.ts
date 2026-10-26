import { requireUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { findOffering, gradeRule, gradeItems } from "@/modules/academic/queries";
import { calculateGrades } from "@/modules/grades/domain";
import { createGradeWorkbook } from "@/modules/grades/workbook";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await context.params;
  const offering = id.length <= 100 ? await findOffering(user.id, id) : null;
  if (!offering) return Response.json({ error: "Disciplina não encontrada." }, { status: 404 });
  try { rateLimit(`xlsx:${user.id}`, 10); }
  catch { return Response.json({ error: "Aguarde um minuto para exportar novamente." }, { status: 429 }); }
  const rule = gradeRule(offering);
  const items = gradeItems(offering);
  const result = calculateGrades(rule, items);
  if (!result.valid) return Response.json({ error: result.errors.join(" ") }, { status: 422 });
  try {
    const workbook = await createGradeWorkbook({ name: offering.subject.name, code: offering.subject.code, term: offering.term.label }, rule, items);
    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(new Uint8Array(buffer), { headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="campushub-notas.xlsx"',
      "Cache-Control": "private, no-store",
    } });
  } catch {
    return Response.json({ error: "Não foi possível gerar a planilha. Tente novamente." }, { status: 500 });
  }
}
