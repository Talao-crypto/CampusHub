import { ActionForm } from "./action-form";
import { Field, SelectField } from "./fields";
import { saveTask } from "@/modules/tasks/actions";
import { dateInput, today } from "@/lib/format";

export type OfferingOption = { id: string; subject: { name: string }; term: { label: string } };
export function TaskForm({ offerings, task }: { offerings: OfferingOption[]; task?: { id: string; title: string; dueDate: Date; status: "TODO" | "DONE"; offeringId: string | null } }) {
  return <ActionForm action={saveTask} label={task ? "Salvar tarefa" : "Criar tarefa"}><input type="hidden" name="id" value={task?.id ?? ""} /><div className="grid gap-4 sm:grid-cols-2"><Field name="title" label="O que você precisa fazer?" placeholder="Ex.: Entregar lista de exercícios" defaultValue={task?.title} maxLength={160} required /><Field name="dueDate" label="Prazo" type="date" defaultValue={dateInput(task?.dueDate ?? today())} required min="2000-01-01" max="2100-12-31" /><SelectField name="offeringId" label="Disciplina (opcional)" defaultValue={task?.offeringId ?? ""}><option value="">Sem disciplina</option>{offerings.map((item) => <option key={item.id} value={item.id}>{item.subject.name} · {item.term.label}</option>)}</SelectField><SelectField name="status" label="Status" defaultValue={task?.status ?? "TODO"}><option value="TODO">Pendente</option><option value="DONE">Concluída</option></SelectField></div></ActionForm>;
}
