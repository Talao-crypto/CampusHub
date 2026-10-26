import { ActionForm } from "./action-form";
import { Field } from "./fields";
import { saveAssessment, saveGradeRule } from "@/modules/grades/actions";
import type { GradeRule } from "@/modules/grades/domain";
import { SelectField } from "./fields";

export function AssessmentForm({ offeringId, item }: { offeringId: string; item?: { id: string; name: string; weightBps: number; scoreUnits: number | null } }) {
  return <ActionForm action={saveAssessment} label={item ? "Salvar avaliação" : "Adicionar avaliação"} compact><input type="hidden" name="offeringId" value={offeringId} /><input type="hidden" name="id" value={item?.id ?? ""} /><div className="grid gap-3 sm:grid-cols-3"><Field label="Avaliação" name="name" placeholder="Ex.: Prova 1" required maxLength={100} defaultValue={item?.name} /><Field label="Peso (%)" name="weight" required inputMode="decimal" maxLength={8} defaultValue={item ? item.weightBps / 100 : ""} /><Field label="Nota (opcional)" name="score" inputMode="decimal" maxLength={12} placeholder="Ainda não recebi" defaultValue={item?.scoreUnits === null || !item ? "" : item.scoreUnits / 10_000} /></div></ActionForm>;
}
export function GradeRuleForm({ offeringId, rule }: { offeringId: string; rule: GradeRule }) {
  return <ActionForm action={saveGradeRule} label="Salvar regra" compact><input type="hidden" name="offeringId" value={offeringId} /><div className="grid gap-3 sm:grid-cols-2"><Field label="Nota máxima da escala" name="max" inputMode="decimal" defaultValue={rule.maxUnits / 10_000} required maxLength={12} /><Field label="Média mínima desejada" name="threshold" inputMode="decimal" defaultValue={rule.thresholdUnits / 10_000} required maxLength={12} /><SelectField label="Casas decimais exibidas" name="decimals" defaultValue={String(rule.decimals)}>{[0, 1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}</SelectField><SelectField label="Exibição da média" name="rounding" defaultValue={rule.rounding}><option value="HALF_UP">Arredondar (metade para cima)</option><option value="TRUNCATE">Truncar</option></SelectField></div><p className="text-xs leading-5 text-muted-foreground">A meta usa a média sem arredondamento. O arredondamento acima afeta a apresentação, sem alterar o critério de aprovação.</p></ActionForm>;
}
