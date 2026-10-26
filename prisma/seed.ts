import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_USER_ID, demoEnabled } from "../src/lib/security";

const url = process.env.DATABASE_URL;
function isLocalDatabase(value: string | undefined) {
  try {
    if (!value) return false;
    const parsed = new URL(value);
    return ["postgres:", "postgresql:"].includes(parsed.protocol) && ["127.0.0.1", "localhost"].includes(parsed.hostname);
  } catch { return false; }
}
if (!demoEnabled(process.env.NODE_ENV ?? "development", process.env.DEMO_MODE, process.env.DEMO_SESSION_SECRET) || !isLocalDatabase(url)) {
  throw new Error("Seed requires DEMO_MODE=true, a 32+ character secret, non-production NODE_ENV and a loopback PostgreSQL URL.");
}
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  await db.$transaction(async (tx) => {
    const institution = await tx.institution.upsert({ where: { slug: "puc-campinas" }, create: { id: "puc-campinas", slug: "puc-campinas", name: "PUC-Campinas" }, update: {} });
    await tx.user.upsert({ where: { id: DEMO_USER_ID }, create: { id: DEMO_USER_ID, name: "João Demo" }, update: {} });
    const term = await tx.academicTerm.upsert({ where: { ownerId_institutionId_label: { ownerId: DEMO_USER_ID, institutionId: institution.id, label: "2026.2 (exemplo)" } }, create: { id: "demo-term-2026-2", ownerId: DEMO_USER_ID, institutionId: institution.id, label: "2026.2 (exemplo)" }, update: {} });
    const subjects = [
      { key: "calculus", code: "EX-CAL1", name: "Cálculo I", color: "indigo", totalUnits: 8000, attendanceUnit: "SESSION" as const, absences: 400, assessments: [{ name: "Prova 1", weightBps: 4000, scoreUnits: 75000 }, { name: "Prova 2", weightBps: 4000, scoreUnits: null }, { name: "Lista de exercícios", weightBps: 2000, scoreUnits: 90000 }] },
      { key: "algorithms", code: "EX-ALG", name: "Algoritmos e Programação", color: "teal", totalUnits: 6000, attendanceUnit: "HOUR" as const, absences: 1250, assessments: [{ name: "Projeto prático", weightBps: 6000, scoreUnits: 85000 }, { name: "Avaliação individual", weightBps: 4000, scoreUnits: 70000 }] },
      { key: "architecture", code: "EX-AC", name: "Arquitetura de Computadores", color: "amber", totalUnits: 4000, attendanceUnit: "SESSION" as const, absences: 200, assessments: [{ name: "Prova teórica", weightBps: 5000, scoreUnits: null }, { name: "Laboratório", weightBps: 5000, scoreUnits: 80000 }] },
    ];
    for (const subject of subjects) {
      const definition = await tx.subjectDefinition.upsert({ where: { ownerId_institutionId_code: { ownerId: DEMO_USER_ID, institutionId: institution.id, code: subject.code } }, create: { id: `demo-subject-${subject.key}`, ownerId: DEMO_USER_ID, institutionId: institution.id, code: subject.code, name: subject.name }, update: {} });
      const offering = await tx.classOffering.upsert({ where: { id: `demo-offering-${subject.key}` }, create: { id: `demo-offering-${subject.key}`, ownerId: DEMO_USER_ID, subjectId: definition.id, termId: term.id, color: subject.color, totalUnits: subject.totalUnits, attendanceUnit: subject.attendanceUnit, minAttendanceBps: 7500 }, update: {} });
      await tx.absence.upsert({ where: { id: `demo-absence-${subject.key}` }, create: { id: `demo-absence-${subject.key}`, ownerId: DEMO_USER_ID, offeringId: offering.id, date: new Date("2026-10-01T00:00:00Z"), units: subject.absences, note: "Exemplo fictício para demonstração" }, update: {} });
      for (const [index, assessment] of subject.assessments.entries()) {
        await tx.assessment.upsert({ where: { id: `demo-assessment-${subject.key}-${index}` }, create: { id: `demo-assessment-${subject.key}-${index}`, ownerId: DEMO_USER_ID, offeringId: offering.id, ...assessment }, update: {} });
      }
    }
    const now = new Date();
    const baseDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tasks = [{ title: "Entregar lista de derivadas", key: "calculus", days: 2 }, { title: "Revisar projeto de programação", key: "algorithms", days: 4 }, { title: "Preparar relatório do laboratório", key: "architecture", days: 7 }];
    for (const task of tasks) {
      await tx.task.upsert({ where: { id: `demo-task-${task.key}` }, create: { id: `demo-task-${task.key}`, ownerId: DEMO_USER_ID, offeringId: `demo-offering-${task.key}`, title: task.title, dueDate: new Date(baseDay.valueOf() + task.days * 86_400_000) }, update: {} });
    }
  });
  console.info("Development examples ready. All academic policies and records are fictional.");
}
main().catch(() => { console.error("Seed failed. Check migrations, local database connection and demo configuration."); process.exitCode = 1; }).finally(() => db.$disconnect());
