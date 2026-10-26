import Link from "next/link";
import { BookOpen, ArrowUpRight, Plus } from "lucide-react";
import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { listOfferings, pageNumber } from "@/modules/academic/queries";
import { deleteOffering } from "@/modules/academic/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading, Pagination, SubjectIcon } from "@/components/page-parts";
import { OfferingForm } from "@/components/forms/offering-form";
import { ActionForm } from "@/components/forms/action-form";
import { number } from "@/lib/format";

export default async function Subjects({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireUser();
  const page = pageNumber((await searchParams).page);
  const [offerings, total] = await Promise.all([listOfferings(user.id, page), getDb().classOffering.count({ where: { ownerId: user.id } })]);
  return <><PageHeading eyebrow="Acadêmico" title="Minhas disciplinas" description="Cada disciplina tem seu período, sua carga e suas próprias regras de avaliação."><Badge tone="indigo">{total} cadastradas</Badge></PageHeading>
    <Card className="mb-6"><details open={total === 0}><summary className="text-sm font-semibold"><Plus className="mr-2 inline size-4" aria-hidden="true" />Nova disciplina</summary><div className="mt-5"><OfferingForm /></div></details></Card>
    {total === 0 && <p className="mb-6 text-sm text-muted-foreground">Você ainda não cadastrou disciplinas. Use o formulário acima para começar.</p>}
    <div className="grid items-start gap-5 xl:grid-cols-2">{offerings.map((offering) => <Card key={offering.id}><div className="flex items-start gap-3"><SubjectIcon code={offering.subject.code} color={offering.color} /><div className="min-w-0 flex-1"><p className="text-[11px] font-medium text-muted-foreground">{offering.subject.code} · {offering.term.label}</p><h2 className="mt-1 break-words text-lg font-semibold">{offering.subject.name}</h2></div><BookOpen className="mt-1 size-4 shrink-0 text-slate-400" aria-hidden="true" /></div><div className="my-5 flex flex-wrap gap-2"><Badge>{number(offering.totalUnits / 100)} {offering.attendanceUnit === "SESSION" ? "aulas" : "horas"}</Badge><Badge>Meta: {number(offering.minAttendanceBps / 100)}% de frequência</Badge><Badge>{offering.assessments.length} avaliações</Badge></div><Link href={`/notas?disciplina=${offering.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Acompanhar notas<ArrowUpRight className="size-3" /></Link><details className="mt-5 border-t border-border pt-4"><summary className="text-xs font-semibold text-slate-600">Editar disciplina e frequência</summary><div className="mt-4"><OfferingForm offering={offering} /></div></details><details className="mt-4"><summary className="text-xs font-medium text-red-700">Excluir disciplina</summary><ActionForm action={deleteOffering} label="Excluir disciplina" variant="destructive" compact className="mt-3 space-y-3"><input type="hidden" name="id" value={offering.id} /><label className="flex items-start gap-2 text-xs leading-5"><input className="mt-1" type="checkbox" name="confirm" required />Confirmo a exclusão da oferta, suas notas e faltas. As tarefas serão mantidas sem vínculo.</label></ActionForm></details></Card>)}</div><Pagination page={page} total={total} path="/disciplinas" /></>;
}
