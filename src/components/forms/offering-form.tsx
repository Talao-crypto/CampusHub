import { ActionForm } from "./action-form";
import { Field, SelectField } from "./fields";
import { saveOffering } from "@/modules/academic/actions";
import type { Offering } from "@/modules/academic/queries";

export function OfferingForm({ offering }: { offering?: Offering }) {
  const date = new Date();
  return <ActionForm action={saveOffering} label={offering ? "Salvar disciplina" : "Cadastrar disciplina"}>
    <input type="hidden" name="id" value={offering?.id ?? ""} />
    <div className="grid gap-4 sm:grid-cols-2">
      <Field name="name" label="Nome da disciplina" defaultValue={offering?.subject.name} placeholder="Ex.: Cálculo I" required maxLength={100} />
      <Field name="code" label="Código pessoal" defaultValue={offering?.subject.code} placeholder="Ex.: CALC-01" required maxLength={24} hint="Identificador escolhido por você; não precisa ser oficial." />
      <Field name="term" label="Período letivo" defaultValue={offering?.term.label ?? `${date.getFullYear()}.${date.getMonth() < 6 ? 1 : 2}`} placeholder="Ex.: 2026.2" required maxLength={30} />
      <SelectField label="Cor de identificação" name="color" defaultValue={offering?.color ?? "indigo"}><option value="indigo">Índigo</option><option value="teal">Verde</option><option value="amber">Âmbar</option><option value="rose">Rosa</option></SelectField>
      <SelectField label="Unidade de frequência" name="unit" defaultValue={offering?.attendanceUnit ?? "SESSION"}><option value="SESSION">Aulas (quantidade inteira)</option><option value="HOUR">Horas (permite frações)</option></SelectField>
      <Field name="total" label="Carga total prevista (na unidade acima)" defaultValue={offering ? offering.totalUnits / 100 : 80} required inputMode="decimal" maxLength={12} />
      <Field name="minimum" label="Frequência mínima desejada (%)" defaultValue={offering ? offering.minAttendanceBps / 100 : 75} required inputMode="decimal" maxLength={8} hint="Exemplo configurável; não representa uma regra oficial." />
    </div>
    <p className="text-xs leading-5 text-muted-foreground">O mesmo código reutiliza a definição da disciplina entre períodos. Alterar o nome atualiza essa definição nos seus períodos anteriores.</p>
  </ActionForm>;
}
