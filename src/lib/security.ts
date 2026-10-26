import { createHmac, timingSafeEqual } from "node:crypto";

export const DEMO_USER_ID = "demo-student";
const SESSION_SECONDS = 8 * 60 * 60;

export function demoEnabled(environment: string | undefined, flag: string | undefined, secret: string | undefined) {
  return environment === "development" && flag === "true" && (secret?.length ?? 0) >= 32;
}

export function isLocalHost(host: string | null) {
  return host === "127.0.0.1:3000" || host === "localhost:3000";
}

export function createDemoToken(secret: string, now = Date.now()) {
  if (secret.length < 32) throw new Error("Demo session secret is too short.");
  const payload = Buffer.from(JSON.stringify({ sub: DEMO_USER_ID, exp: Math.floor(now / 1000) + SESSION_SECONDS })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

export function verifyDemoToken(token: string, secret: string, now = Date.now()): boolean {
  if (secret.length < 32 || token.length > 512) return false;
  const parts = token.split(".");
  const [payload, signature] = parts;
  if (parts.length !== 2 || !payload || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof parsed !== "object" || parsed === null || !("sub" in parsed) || !("exp" in parsed)) return false;
    const current = Math.floor(now / 1000);
    return parsed.sub === DEMO_USER_ID && typeof parsed.exp === "number" && Number.isInteger(parsed.exp) && parsed.exp > current && parsed.exp <= current + SESSION_SECONDS;
  } catch { return false; }
}
