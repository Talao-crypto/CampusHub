import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const foreignUserId = `e2e-foreign-${randomUUID()}`;
let foreignOfferingId = "";
const createdCodes: string[] = [];

async function login(page: Page) {
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Entrar na demonstração" }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test.beforeAll(async () => {
  const institution = await db.institution.findUniqueOrThrow({ where: { slug: "puc-campinas" } });
  await db.user.create({ data: { id: foreignUserId, name: "Foreign E2E owner" } });
  const subject = await db.subjectDefinition.create({ data: { ownerId: foreignUserId, institutionId: institution.id, code: "PRIVATE", name: "Foreign private record" } });
  const term = await db.academicTerm.create({ data: { ownerId: foreignUserId, institutionId: institution.id, label: "Private term" } });
  const offering = await db.classOffering.create({ data: { ownerId: foreignUserId, subjectId: subject.id, termId: term.id, totalUnits: 8000 } });
  foreignOfferingId = offering.id;
});

test.afterAll(async () => {
  // Remove only test-owned rows. No demo examples or pre-existing records are deleted.
  for (const code of createdCodes) {
    const definitions = await db.subjectDefinition.findMany({ where: { ownerId: "demo-student", code }, select: { id: true } });
    for (const definition of definitions) {
      const offers = await db.classOffering.findMany({ where: { ownerId: "demo-student", subjectId: definition.id }, select: { id: true } });
      await db.task.deleteMany({ where: { ownerId: "demo-student", offeringId: { in: offers.map((item) => item.id) } } });
      await db.subjectDefinition.delete({ where: { id: definition.id } });
    }
  }
  await db.user.deleteMany({ where: { id: foreignUserId } });
  await db.$disconnect();
});

test("private pages require a session; manifest is available", async ({ page, request }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/entrar/);
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).display).toBe("standalone");
});

test("subject, attendance, grades, XLSX and tasks persist on desktop and mobile", async ({ page }) => {
  await login(page);
  const suffix = randomUUID().slice(0, 8).toUpperCase();
  const code = `E2E-${suffix}`;
  const name = `Disciplina ${suffix}`;
  createdCodes.push(code);
  await page.goto("/disciplinas");
  const create = page.locator("form").filter({ has: page.getByRole("button", { name: "Cadastrar disciplina", exact: true }) });
  const summary = page.locator("summary").filter({ hasText: "Nova disciplina" });
  if (await summary.evaluate((element) => !element.parentElement?.hasAttribute("open"))) await summary.click();
  await create.getByLabel("Nome da disciplina").fill(name);
  await create.getByLabel("Código pessoal").fill(code);
  await create.getByLabel("Período letivo").fill(`E2E ${suffix}`);
  await create.getByRole("button", { name: "Cadastrar disciplina", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  const exported = await (await page.request.get("/api/privacy/export")).json();
  const definition = exported.subjects.find((item: { code: string }) => item.code === code);
  const offering = exported.offerings.find((item: { subjectId: string }) => item.subjectId === definition.id);
  await page.goto("/frequencia");
  const attendanceCard = page.locator("section").filter({ has: page.getByRole("heading", { name, exact: true }) });
  await attendanceCard.locator("summary").filter({ hasText: "Registrar falta" }).click();
  await attendanceCard.getByLabel("Quantidade de aulas").fill("2");
  await attendanceCard.getByLabel("Observação (opcional)").fill("Registro E2E");
  await attendanceCard.getByRole("button", { name: "Registrar falta", exact: true }).click();
  await expect(attendanceCard.getByText("2 aulas", { exact: true })).toBeVisible();
  await page.reload();
  await expect(attendanceCard.getByText("97,5%", { exact: true })).toBeVisible();
  await page.goto(`/notas?disciplina=${offering.id}`);
  for (const item of [{ name: "Parcial E2E", weight: "40", score: "8" }, { name: "Final E2E", weight: "60", score: "" }]) {
    const addSummary = page.locator("summary").filter({ hasText: "Adicionar avaliação" });
    if (await addSummary.evaluate((element) => !element.parentElement?.hasAttribute("open"))) await addSummary.click();
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Adicionar avaliação", exact: true }) });
    await form.getByLabel("Avaliação", { exact: true }).fill(item.name);
    await form.getByLabel("Peso (%)", { exact: true }).fill(item.weight);
    await form.getByLabel("Nota (opcional)", { exact: true }).fill(item.score);
    await form.getByRole("button", { name: "Adicionar avaliação", exact: true }).click();
    await expect(page.getByRole("heading", { name: item.name, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/pelo menos 4,6667/)).toBeVisible();
  const xlsx = await page.request.get(`/api/export/grades/${offering.id}`);
  expect(xlsx.ok()).toBe(true);
  expect(xlsx.headers()["content-type"]).toContain("spreadsheetml");
  expect((await xlsx.body()).subarray(0, 2).toString()).toBe("PK");
  await page.goto("/tarefas");
  const taskSummary = page.locator("summary").filter({ hasText: "Nova tarefa" });
  if (await taskSummary.evaluate((element) => !element.parentElement?.hasAttribute("open"))) await taskSummary.click();
  const taskForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Criar tarefa", exact: true }) });
  await taskForm.getByLabel("O que você precisa fazer?").fill(`Trabalho ${suffix}`);
  await taskForm.getByLabel("Disciplina (opcional)").selectOption(offering.id);
  await taskForm.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  const taskCard = page.locator("section").filter({ has: page.getByRole("heading", { name: `Trabalho ${suffix}`, exact: true }) });
  await expect(taskCard).toBeVisible();
  await taskCard.getByRole("button", { name: "Concluir", exact: true }).click();
  await page.reload();
  await expect(taskCard.getByText("Concluída", { exact: true })).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("another owner's IDs cannot be read, exported or used in a mutation", async ({ page }) => {
  await login(page);
  expect((await page.request.get(`/api/export/grades/${foreignOfferingId}`)).status()).toBe(404);
  const exported = await (await page.request.get("/api/privacy/export")).json();
  expect(JSON.stringify(exported)).not.toContain(foreignOfferingId);
  await page.goto("/tarefas");
  const summary = page.locator("summary").filter({ hasText: "Nova tarefa" });
  if (await summary.evaluate((element) => !element.parentElement?.hasAttribute("open"))) await summary.click();
  const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Criar tarefa", exact: true }) });
  await form.getByLabel("O que você precisa fazer?").fill("Must never be persisted");
  await form.locator('select[name="offeringId"]').evaluate((element, foreignId) => {
    const select = element as HTMLSelectElement;
    select.add(new Option("Forged foreign offering", foreignId));
    select.value = foreignId;
  }, foreignOfferingId);
  await form.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  await expect(form.getByRole("status")).toContainText("Disciplina não encontrada.");
  expect(await db.task.count({ where: { ownerId: "demo-student", offeringId: foreignOfferingId } })).toBe(0);
});
