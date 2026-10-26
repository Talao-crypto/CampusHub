import ExcelJS from "exceljs";
import { calculateGrades, type GradeRule, type AssessmentInput } from "./domain";

export async function createGradeWorkbook(subject: { name: string; code: string; term: string }, rule: GradeRule, assessments: readonly AssessmentInput[]) {
  const result = calculateGrades(rule, assessments);
  if (!result.valid) throw new Error(result.errors.join(" "));
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CampusHub — projeto independente";
  workbook.calcProperties.fullCalcOnLoad = true;
  const sheet = workbook.addWorksheet("Simulador", { views: [{ state: "frozen", ySplit: 7 }] });
  sheet.columns = [{ width: 38 }, { width: 18 }, { width: 23 }, { width: 23 }, { width: 3 }, { width: 16 }, { width: 3 }, { width: 20 }];
  sheet.mergeCells("A1:H1");
  sheet.getCell("A1").value = "CampusHub | Simulador de notas";
  sheet.getCell("A1").font = { size: 20, bold: true, color: { argb: "FF3730A3" } };
  sheet.mergeCells("A2:H2");
  sheet.getCell("A2").value = "Estimativa pessoal. Edite somente as células azuis. Não é um registro oficial.";
  sheet.mergeCells("A3:H3");
  sheet.getCell("A3").value = `${subject.code} · ${subject.name} · ${subject.term}`;
  sheet.getCell("A5").value = "Nota máxima";
  sheet.getCell("B5").value = rule.maxUnits / 10_000;
  sheet.getCell("C5").value = "Média mínima";
  sheet.getCell("D5").value = rule.thresholdUnits / 10_000;
  sheet.getCell("F5").value = rule.decimals;
  sheet.getCell("H5").value = rule.rounding === "HALF_UP" ? "Arredondar" : "Truncar";
  sheet.getRow(7).values = ["Avaliação", "Peso", "Nota (editável)", "Contribuição bruta"];
  sheet.getRow(7).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(7).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3730A3" } };
  assessments.forEach((item, index) => {
    const row = index + 8;
    sheet.getCell(`A${row}`).value = item.name; // Always a string; never interpret user text as a formula.
    sheet.getCell(`B${row}`).value = item.weightBps / 10_000;
    sheet.getCell(`B${row}`).numFmt = "0.00%";
    const score = sheet.getCell(`C${row}`);
    score.value = item.scoreUnits === null ? null : item.scoreUnits / 10_000;
    score.numFmt = "0.0000";
    score.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
    score.protection = { locked: false };
    score.dataValidation = { type: "custom", formulae: [`OR(C${row}="",AND(ISNUMBER(C${row}),C${row}>=0,C${row}<=$B$5,ABS(C${row}*10000-ROUND(C${row}*10000,0))<0.0000001))`], allowBlank: true, showErrorMessage: true, errorTitle: "Nota inválida", error: "Use uma nota dentro da escala, com até 4 casas decimais.", errorStyle: "stop" };
    sheet.getCell(`D${row}`).value = { formula: `IF(ISNUMBER(C${row}),ROUND(C${row}*10000,0)*ROUND(B${row}*10000,0)/100000000,0)`, result: (item.scoreUnits ?? 0) * item.weightBps / 100_000_000 };
    sheet.getCell(`D${row}`).numFmt = "0.0000";
  });
  const end = assessments.length + 7;
  const scores = `C8:C${end}`;
  const weights = `B8:B${end}`;
  // Integer normalization mirrors the domain engine and avoids approval drift from decimal weights.
  const weighted = `SUMPRODUCT(ROUND(${scores}*10000,0),ROUND(${weights}*10000,0))`;
  const enteredWeight = `ROUND(SUMIF(${scores},"<>",${weights})*10000,0)`;
  const missing = `(10000-${enteredWeight})`;
  const needed = `(ROUND($D$5*10000,0)*10000-${weighted})`;
  const rounding = rule.rounding === "HALF_UP" ? "ROUND" : "TRUNC";
  const firstSummary = end + 2;
  const summaries: [string, string, number | string][] = [
    ["Soma dos pesos", `SUM(${weights})`, 1],
    ["Média das notas preenchidas", `IF(${enteredWeight}=0,"",${rounding}(${weighted}/(${enteredWeight}*10000),$F$5))`, result.currentAverage ?? ""],
    ["Média final", `IF(COUNT(${scores})=${assessments.length},${rounding}(${weighted}/100000000,$F$5),"")`, result.finalAverage ?? ""],
    ["Resultado (média bruta)", `IF(COUNT(${scores})<${assessments.length},"Em andamento",IF(${needed}<=0,"Meta atingida","Abaixo da meta"))`, result.complete ? result.approved ? "Meta atingida" : "Abaixo da meta" : "Em andamento"],
    ["Nota comum necessária nas restantes", `IF(${missing}=0,"Concluído",IF(${needed}<=0,0,IF(ROUNDUP(${needed}/${missing},0)>ROUND($B$5*10000,0),"Impossível",ROUNDUP(${needed}/${missing},0)/10000)))`, result.future === "COMPLETE" ? "Concluído" : result.future === "IMPOSSIBLE" ? "Impossível" : result.requiredGrade ?? 0],
  ];
  summaries.forEach(([label, formula, cached], index) => {
    const row = firstSummary + index;
    sheet.getCell(`A${row}`).value = label;
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`C${row}`).value = { formula, result: cached };
    sheet.getCell(`C${row}`).numFmt = index === 0 ? "0.00%" : index === 4 ? "0.0000" : `0${rule.decimals ? "." + "0".repeat(rule.decimals) : ""}`;
  });
  const noteRow = firstSummary + 7;
  sheet.mergeCells(`A${noteRow}:H${noteRow}`);
  sheet.getCell(`A${noteRow}`).value = "Aprovação compara a média sem arredondamento. A nota necessária é arredondada para cima em 0,0001 e supõe a mesma nota nas avaliações restantes.";
  sheet.getCell(`A${noteRow}`).alignment = { wrapText: true };
  sheet.getRow(noteRow).height = 40;
  sheet.eachRow((row) => { row.alignment = { ...row.alignment, vertical: "middle" }; });
  // Protection is an editing aid, not a security boundary. Inputs remain editable.
  await sheet.protect("", { selectLockedCells: true, selectUnlockedCells: true });
  return workbook;
}
