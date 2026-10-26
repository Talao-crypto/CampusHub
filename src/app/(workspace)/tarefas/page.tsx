import Link from "next/link";
import { CalendarDays, Plus, CheckCheck } from "lucide-react";
import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { pageNumber } from "@/modules/academic/queries";
import { listTasks } from "@/modules/tasks/queries";
import { toggleTask, deleteTask } from "@/modules/tasks/actions";
import { PageHeading, Pagination } from "@/components/page-parts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { TaskForm } from "@/components/forms/task-form";
import { ActionForm } from "@/components/forms/action-form";
import { dateLabel, today } from "@/lib/format";

export default async function Tasks({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const page = pageNumber(params.page);
  const status = params.status === "TODO" || params.status === "DONE" ? params.status : undefined;
  const [{ tasks, total }, offerings] = await Promise.all([listTasks(user.id, page, status), getDb().classOffering.findMany({ where: { ownerId: user.id }, include: { subject: true, term: true }, take: 100, orderBy: { createdAt: "desc" } })]);
  const day = today();
  return <><PageHeading eyebrow="Organização" title="Um passo de cada vez" description="Tarefas, trabalhos e avaliações: deixe os próximos passos à vista." /><Card className="mb-6"><details open={tasks.length === 0 && !status}><summary className="text-sm font-semibold"><Plus className="mr-2 inline size-4" />Nova tarefa</summary><div className="mt-5"><TaskForm offerings={offerings} /></div></details></Card><nav aria-label="Filtrar tarefas" className="mb-5 flex flex-wrap gap-2">{[{ label: "Todas", value: undefined }, { label: "Pendentes", value: "TODO" }, { label: "Concluídas", value: "DONE" }].map((filter) => <Link key={filter.label} href={`/tarefas${filter.value ? `?status=${filter.value}` : ""}`} aria-current={status === filter.value ? "page" : undefined} className={buttonVariants({ variant: status === filter.value ? "default" : "outline", size: "sm" })}>{filter.label}</Link>)}</nav><div className="space-y-4">{tasks.map((task) => {
    const overdue = task.status === "TODO" && task.dueDate < day;
    return <Card key={task.id}><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap gap-2"><Badge tone={task.status === "DONE" ? "green" : overdue ? "red" : "amber"}>{task.status === "DONE" ? "Concluída" : overdue ? "Atrasada" : "Pendente"}</Badge>{task.offering && <Badge>{task.offering.subject.name}</Badge>}</div><h2 className={`break-words text-base font-semibold ${task.status === "DONE" ? "text-muted-foreground line-through" : ""}`}>{task.title}</h2><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />{dateLabel(task.dueDate)} · {task.dueDate.getUTCFullYear()}</p></div><ActionForm action={toggleTask} label={task.status === "DONE" ? "Reabrir" : "Concluir"} variant="outline" compact className="space-y-2"><input type="hidden" name="id" value={task.id} /><input type="hidden" name="status" value={task.status === "DONE" ? "TODO" : "DONE"} /></ActionForm></div><details className="mt-4 border-t border-border pt-3"><summary className="text-xs font-semibold text-primary">Editar tarefa</summary><div className="mt-4"><TaskForm offerings={offerings} task={task} /><div className="mt-4"><ActionForm action={deleteTask} label="Excluir tarefa" variant="destructive" compact><input type="hidden" name="id" value={task.id} /></ActionForm></div></div></details></Card>;
  })}</div>{!tasks.length && <Card className="py-12 text-center"><CheckCheck className="mx-auto mb-4 size-10 text-teal-500" /><h2 className="font-semibold">Tudo tranquilo por aqui</h2><p className="mt-2 text-sm text-muted-foreground">Nenhuma tarefa neste filtro. Cadastre seus próximos passos no formulário acima.</p></Card>}<Pagination page={page} total={total} size={20} path="/tarefas" query={status ? `&status=${status}` : ""} /></>;
}
