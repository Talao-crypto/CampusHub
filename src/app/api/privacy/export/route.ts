import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/rate-limit";

export async function GET() {
  const user = await requireUser();
  try { rateLimit(`privacy:${user.id}`, 5); }
  catch { return Response.json({ error: "Aguarde um minuto para exportar novamente." }, { status: 429 }); }
  try {
    const db = getDb();
    const [subjects, terms, offerings, tasks] = await db.$transaction([
      db.subjectDefinition.findMany({ where: { ownerId: user.id } }),
      db.academicTerm.findMany({ where: { ownerId: user.id } }),
      db.classOffering.findMany({ where: { ownerId: user.id }, include: { absences: true, assessments: true } }),
      db.task.findMany({ where: { ownerId: user.id } }),
    ], { isolationLevel: "RepeatableRead" });
    return Response.json({ version: 1, exportedAt: new Date().toISOString(), units: { attendance: "integer / 100", grades: "integer / 10000", percentages: "integer / 100" }, user, subjects, terms, offerings, tasks }, { headers: { "Content-Disposition": 'attachment; filename="campushub-dados.json"', "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível exportar seus dados. Tente novamente." }, { status: 500 });
  }
}
