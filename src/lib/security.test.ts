import { describe, expect, it } from "vitest";
import { createDemoToken, verifyDemoToken, demoEnabled, isLocalHost } from "./security";

const secret = "test-only-secret-at-least-thirty-two-characters";
const now = Date.UTC(2026, 9, 21);
describe("development session boundary", () => {
  it("cannot enable demo in production, test or by default", () => {
    expect(demoEnabled("production", "true", secret)).toBe(false);
    expect(demoEnabled("test", "true", secret)).toBe(false);
    expect(demoEnabled("development", undefined, secret)).toBe(false);
    expect(demoEnabled("development", "true", "short")).toBe(false);
    expect(demoEnabled("development", "true", secret)).toBe(true);
  });
  it("restricts the local host and port", () => {
    expect(isLocalHost("127.0.0.1:3000")).toBe(true);
    for (const host of [null, "localhost.example.com:3000", "example.com", "localhost:3001"]) expect(isLocalHost(host)).toBe(false);
  });
  it("accepts a signed unexpired session and rejects tampering and expiration", () => {
    const token = createDemoToken(secret, now);
    expect(verifyDemoToken(token, secret, now)).toBe(true);
    expect(verifyDemoToken(token + "x", secret, now)).toBe(false);
    expect(verifyDemoToken(token, secret + "other", now)).toBe(false);
    expect(verifyDemoToken(token, secret, now + 8 * 3600_000)).toBe(false);
    expect(verifyDemoToken("not.a.token", secret, now)).toBe(false);
    expect(verifyDemoToken(token, "", now)).toBe(false);
  });
});
