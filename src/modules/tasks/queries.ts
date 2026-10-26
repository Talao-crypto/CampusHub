import "server-only";
import { getDb } from "@/lib/server/db";

export async function listTasks(ownerId: string, page = 1, status?: "TODO" | "DONE") {
  const where = { ownerId, ...(status ? { status } : {}) };
  const [tasks, total] = await Promise.all([
    getDb().task.findMany({ where, include: { offering: { include: { subject: true } } }, orderBy: [{ status: "asc" }, { dueDate: "asc" }, { id: "asc" }], take: 20, skip: (page - 1) * 20 }),
    getDb().task.count({ where }),
  ]);
  return { tasks, total };
}
