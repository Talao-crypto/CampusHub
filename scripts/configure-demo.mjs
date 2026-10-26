import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

if (process.env.NODE_ENV === "production") throw new Error("Demo setup is development-only.");
const template = await readFile(new URL("../.env.example", import.meta.url), "utf8");
const databasePassword = randomBytes(24).toString("hex");
const content = template
  .replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=postgresql://campushub:${databasePassword}@127.0.0.1:5432/campushub?schema=public`)
  .replace(/^POSTGRES_USER=.*$/m, "POSTGRES_USER=campushub")
  .replace(/^POSTGRES_PASSWORD=.*$/m, `POSTGRES_PASSWORD=${databasePassword}`)
  .replace(/^POSTGRES_DB=.*$/m, "POSTGRES_DB=campushub")
  .replace("DEMO_MODE=false", "DEMO_MODE=true")
  .replace(/^DEMO_SESSION_SECRET=$/m, `DEMO_SESSION_SECRET=${randomBytes(32).toString("hex")}`);
try {
  await writeFile(new URL("../.env", import.meta.url), content, { flag: "wx", mode: 0o600 });
  console.info("Created local .env with a random session secret. Existing files are never overwritten.");
} catch (error) {
  if (error.code === "EEXIST") {
    console.error(".env already exists. Review it manually; no settings were changed.");
    process.exitCode = 1;
  } else throw error;
}
