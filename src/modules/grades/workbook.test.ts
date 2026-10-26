import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { createGradeWorkbook } from "./workbook";
import { type GradeRule } from "./domain";

const rule: GradeRule = { version: 1, kind: "WEIGHTED", maxUnits: 100000, thresholdUnits: 60000, decimals: 2, rounding: "HALF_UP" };
describe("XLSX export contract", () => {
  it("roundtrips a real workbook with editable inputs, formulas and verified cached results", async () => {
    const workbook = await createGradeWorkbook({ name: "=HYPERLINK(\"https://example.invalid\")", code: "A", term: "2026.2" }, rule, [{ name: "=1+1", weightBps: 4000, scoreUnits: 80000 }, { name: "Final", weightBps: 6000, scoreUnits: null }]);
    const buffer = await workbook.xlsx.writeBuffer();
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(buffer);
    const sheet = loaded.getWorksheet("Simulador")!;
    expect(sheet.getCell("A8").value).toBe("=1+1");
    expect(sheet.getCell("C8").value).toBe(8);
    expect(sheet.getCell("C8").protection.locked).toBe(false);
    expect(sheet.getCell("C9").value).toBeNull();
    expect(sheet.getCell("D8").formula).toContain("ROUND(C8*10000,0)");
    expect(sheet.getCell("C12").result).toBe(8);
    expect(sheet.getCell("C13").result ?? "").toBe("");
    expect(sheet.getCell("C15").result).toBe(4.6667);
    expect(sheet.getCell("C15").formula).toContain("ROUNDUP");
    expect(sheet.getCell("C13").formula).toContain("COUNT(C8:C9)=2");
    expect(sheet.getCell("C8").dataValidation.type).toBe("custom");
    expect(sheet.getCell("C8").dataValidation.formulae?.[0]).toContain("ISNUMBER(C8)");
  });
  it("exports completed averages, raw approval and truncate semantics", async () => {
    const workbook = await createGradeWorkbook({ name: "Teste", code: "T", term: "2026" }, { ...rule, rounding: "TRUNCATE" }, [{ name: "Final", weightBps: 10000, scoreUnits: 59999 }]);
    const sheet = workbook.getWorksheet("Simulador")!;
    expect(sheet.getCell("C12").result).toBe(5.99);
    expect(sheet.getCell("C12").formula).toContain("TRUNC");
    expect(sheet.getCell("C13").result).toBe("Abaixo da meta");
  });
  it("refuses inconsistent schemes", async () => {
    await expect(createGradeWorkbook({ name: "Teste", code: "T", term: "2026" }, rule, [])).rejects.toThrow();
  });
});
