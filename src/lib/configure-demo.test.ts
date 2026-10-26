import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, copyFile, readFile, writeFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execute = promisify(execFile);

async function fixture(run: (directory: string, script: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "campushub-config-"));
  try {
    await mkdir(join(directory, "scripts"));
    const script = join(directory, "scripts", "configure-demo.mjs");
    await copyFile(new URL("../../scripts/configure-demo.mjs", import.meta.url), script);
    await copyFile(new URL("../../.env.example", import.meta.url), join(directory, ".env.example"));
    await run(directory, script);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

describe("local demo configuration", () => {
  it("replaces placeholders with coherent private credentials without printing secrets", async () => {
    await fixture(async (directory, script) => {
      const result = await execute(process.execPath, [script], { env: { ...process.env, NODE_ENV: "development" } });
      const path = join(directory, ".env");
      const content = await readFile(path, "utf8");
      const values = Object.fromEntries(content.split("\n").filter((line) => line && !line.startsWith("#")).map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }));
      expect(values.POSTGRES_PASSWORD).toMatch(/^[a-f0-9]{48}$/);
      expect(values.DEMO_SESSION_SECRET).toMatch(/^[a-f0-9]{64}$/);
      expect(values.DEMO_MODE).toBe("true");
      const url = new URL(values.DATABASE_URL ?? "");
      expect(url.username).toBe(values.POSTGRES_USER);
      expect(url.password).toBe(values.POSTGRES_PASSWORD);
      expect(url.pathname).toBe(`/${values.POSTGRES_DB}`);
      expect(url.hostname).toBe("127.0.0.1");
      expect(content).not.toMatch(/SEU_USUARIO|SUA_SENHA|SEU_BANCO/);
      expect((await stat(path)).mode & 0o777).toBe(0o600);
      expect(result.stdout + result.stderr).not.toContain(values.POSTGRES_PASSWORD);
      expect(result.stdout + result.stderr).not.toContain(values.DEMO_SESSION_SECRET);
    });
  });

  it("preserves an existing environment file", async () => {
    await fixture(async (directory, script) => {
      const path = join(directory, ".env");
      await writeFile(path, "KEEP_EXISTING_CONFIGURATION=true\n");
      await expect(execute(process.execPath, [script], { env: { ...process.env, NODE_ENV: "development" } })).rejects.toMatchObject({ code: 1 });
      expect(await readFile(path, "utf8")).toBe("KEEP_EXISTING_CONFIGURATION=true\n");
    });
  });

  it("refuses production without creating an environment file", async () => {
    await fixture(async (directory, script) => {
      await expect(execute(process.execPath, [script], { env: { ...process.env, NODE_ENV: "production" } })).rejects.toMatchObject({ code: 1 });
      await expect(stat(join(directory, ".env"))).rejects.toMatchObject({ code: "ENOENT" });
    });
  });
});
