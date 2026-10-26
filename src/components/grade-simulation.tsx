"use client";

import { useState } from "react";
import { calculateGrades, type GradeRule, type AssessmentInput } from "@/modules/grades/domain";
import { toFixedUnits } from "@/lib/fixed";
import { number } from "@/lib/format";
import { Field } from "./forms/fields";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function GradeSimulation({ rule, assessments }: { rule: GradeRule; assessments: AssessmentInput[] }) {
  const [scores, setScores] = useState(() => assessments.map((item) => item.scoreUnits === null ? "" : String(item.scoreUnits / 10_000)));
  let error = "";
  let result: ReturnType<typeof calculateGrades> | null = null;
  try {
    result = calculateGrades(rule, assessments.map((item, index) => ({ ...item, scoreUnits: scores[index]?.trim() ? toFixedUnits(scores[index] ?? "", 4) : null })));
  } catch { error = `Use notas de 0 a ${number(rule.maxUnits / 10_000, 4)}, com até 4 casas decimais.`; }
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">E se eu tirar…?</h2><p className="mt-1 text-xs text-muted-foreground">Experimente cenários. Estes campos não alteram as notas salvas.</p></div><Button variant="outline" size="sm" onClick={() => setScores(assessments.map((item) => item.scoreUnits === null ? "" : String(item.scoreUnits / 10_000)))}>Restaurar notas salvas</Button></div><div className="grid gap-4 sm:grid-cols-2">{assessments.map((item, index) => <Field key={index} label={`${item.name} · ${number(item.weightBps / 100)}%`} value={scores[index] ?? ""} inputMode="decimal" maxLength={12} placeholder="Sem nota" onChange={(event) => setScores((previous) => previous.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} />)}</div><div aria-live="polite" className="rounded-2xl bg-indigo-50 p-5">{error ? <p className="text-sm text-red-700">{error}</p> : result?.valid ? <><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs text-indigo-800">{result.complete ? "Média final simulada" : "Média das notas preenchidas"}</p><p className="mt-1 text-4xl font-bold text-indigo-950">{result.currentAverage === null ? "—" : number(result.currentAverage, rule.decimals)}<span className="ml-2 text-base font-normal text-indigo-400">/ {number(rule.maxUnits / 10_000, 4)}</span></p></div><Badge tone={result.complete ? result.approved ? "green" : "red" : "indigo"}>{result.complete ? result.approved ? "Meta atingida" : "Abaixo da meta" : `${number(result.enteredWeightBps / 100)}% do peso preenchido`}</Badge></div><p className="mt-4 text-sm leading-6 text-indigo-900">{result.future === "REQUIRED" ? `Você precisa de pelo menos ${number(result.requiredGrade ?? 0, 4)} em cada avaliação restante para atingir a meta de ${number(rule.thresholdUnits / 10_000, 4)}.` : result.future === "IMPOSSIBLE" ? "Mesmo com a nota máxima nas avaliações restantes, este cenário não atinge a meta." : result.future === "SECURED" ? "A contribuição acumulada já atinge a meta, mesmo com zero nas avaliações restantes." : "Todas as notas deste cenário foram preenchidas."}</p></> : <p className="text-sm text-amber-900">{result?.errors.join(" ")}</p>}</div><p className="text-xs leading-5 text-muted-foreground">Quando há mais de uma nota ausente, o cálculo supõe uma nota comum nas avaliações restantes. A nota necessária é arredondada para cima em 0,0001.</p></div>;
}
