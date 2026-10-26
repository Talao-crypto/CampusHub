import { ActionForm } from "./action-form";
import { Field } from "./fields";
import { saveAbsence } from "@/modules/attendance/actions";
import { dateInput, today } from "@/lib/format";

export function AbsenceForm({ offeringId, unit, record }: { offeringId: string; unit: "HOUR" | "SESSION"; record?: { id: string; units: number; date: Date; note: string | null } }) {
  return <ActionForm action={saveAbsence} label={record ? "Salvar falta" : "Registrar falta"} compact>
    <input type="hidden" name="offeringId" value={offeringId} /><input type="hidden" name="id" value={record?.id ?? ""} />
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Data da falta" name="date" type="date" required defaultValue={dateInput(record?.date ?? today())} min="2000-01-01" max="2100-12-31" /><Field label={`Quantidade de ${unit === "SESSION" ? "aulas" : "horas"}`} name="units" required inputMode={unit === "SESSION" ? "numeric" : "decimal"} defaultValue={record ? record.units / 100 : 1} maxLength={12} /><Field label="Observação (opcional)" name="note" defaultValue={record?.note ?? ""} maxLength={200} /></div>
  </ActionForm>;
}
