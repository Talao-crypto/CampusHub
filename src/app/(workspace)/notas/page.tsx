import { notFound } from "next/navigation";
import { Download, Calculator } from "lucide-react";
import { requireUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { findOffering, gradeRule, gradeItems } from "@/modules/academic/queries";
import { calculateGrades } from "@/modules/grades/domain";
import { deleteAssessment } from "@/modules/grades/actions";
import { PageHeading, Notice, EmptyState } from "@/components/page-parts";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectField } from "@/components/forms/fields";
import { AssessmentForm, GradeRuleForm } from "@/components/forms/assessment-form";
import { ActionForm } from "@/components/forms/action-form";
import { GradeSimulation } from "@/components/grade-simulation";
import { number } from "@/lib/format";

export default async function Grades({ searchParams }: { searchParams: Promise<{ disciplina?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const options = await getDb().classOffering.findMany({ where: { ownerId: user.id }, include: { subject: true, term: true }, take: 100, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  const id = params.disciplina ?? options[0]?.id;
  const offering = id && id.length <= 100 ? await findOffering(user.id, id) : null;
  if (id && !offering) notFound();
  if (!offering) return <><PageHeading eyebrow="Desempenho" title="Simulador de notas" description="Monte sua regra e transforme incerteza em planejamento." /><EmptyState /></>;
  const rule = gradeRule(offering);
  const items = gradeItems(offering);
  const result = calculateGrades(rule, items);
  return <><PageHeading eyebrow="Desempenho" title="Simulador de notas" description="Registre suas avaliações, teste cenários e acompanhe sua meta.">{result.valid && <a href={`/api/export/grades/${offering.id}`} className={buttonVariants({ variant: "outline" })}><Download className="size-4" />Exportar Excel</a>}</PageHeading><Card className="mb-5"><form method="get" className="flex flex-wrap items-end gap-3"><div className="min-w-0 flex-1"><SelectField label="Disciplina e período" name="disciplina" defaultValue={offering.id}>{options.map((item) => <option key={item.id} value={item.id}>{item.subject.name} · {item.term.label}</option>)}</SelectField></div><Button type="submit" variant="outline">Abrir disciplina</Button></form></Card><Notice>Use as regras informadas no plano de ensino e confira os dados oficiais. Este simulador usa média ponderada, escala iniciada em zero e meta configurável; recuperação e exame não são calculados nesta versão.</Notice><div className="mt-6 grid items-start gap-5 xl:grid-cols-[1.15fr_1fr]"><div className="space-y-5"><Card><div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-semibold">Avaliações salvas</h2><Badge tone={result.valid ? "green" : "amber"}>Pesos: {number(result.weightBps / 100)}%</Badge></div>{!result.valid && <p role="status" className="mb-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{result.errors.join(" ")} Ajuste os pesos para habilitar a simulação e a exportação.</p>}<div className="space-y-4">{offering.assessments.map((item) => <div key={item.id} className="rounded-xl border border-border p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="break-words text-sm font-semibold">{item.name}</h3><ActionForm action={deleteAssessment} label="Remover avaliação" variant="ghost" compact className="flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={item.id} /></ActionForm></div><AssessmentForm offeringId={offering.id} item={item} /></div>)}</div><details className="mt-5 border-t border-border pt-4" open={!items.length}><summary className="text-sm font-semibold text-primary">Adicionar avaliação</summary><div className="mt-4"><AssessmentForm offeringId={offering.id} /></div></details></Card><Card><details><summary className="text-sm font-semibold">Configurar regra de notas</summary><div className="mt-5"><GradeRuleForm offeringId={offering.id} rule={rule} /></div></details><p className="mt-3 text-xs text-muted-foreground">Escala: 0 a {number(rule.maxUnits / 10_000, 4)} · Meta: {number(rule.thresholdUnits / 10_000, 4)} · {rule.decimals} casas na exibição</p></Card></div><Card className="xl:sticky xl:top-24">{result.valid ? <GradeSimulation key={JSON.stringify([offering.id, rule, items])} rule={rule} assessments={items} /> : <div className="py-10 text-center"><Calculator className="mx-auto mb-4 size-10 text-indigo-300" /><h2 className="font-semibold">Prepare seu cenário</h2><p className="mt-2 text-sm text-muted-foreground">Cadastre avaliações com pesos que somem 100% para começar a simular.</p></div>}</Card></div></>;
}
