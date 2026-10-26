"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertDemoRequest, assertMutationOrigin, SESSION_COOKIE } from "@/lib/server/auth";
import { createDemoToken, DEMO_USER_ID } from "@/lib/security";
import { rateLimit } from "@/lib/server/rate-limit";
import { getDb } from "@/lib/server/db";
import { safeError, type ActionState } from "@/lib/server/action";

async function enterDemo(): Promise<void> {
  await assertMutationOrigin();
  rateLimit("demo-login", 20);
  const user = await getDb().user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!user) redirect("/entrar?seed=missing");
  (await cookies()).set(SESSION_COOKIE, createDemoToken(process.env.DEMO_SESSION_SECRET ?? ""), {
    httpOnly: true, sameSite: "strict", secure: false, path: "/", maxAge: 8 * 60 * 60,
  });
  redirect("/dashboard");
}

export async function enterDemoAction(_: ActionState): Promise<ActionState> {
  await assertDemoRequest();
  // Redirect errors must be rethrown; Next.js handles them as control flow.
  try { await enterDemo(); }
  catch (error) {
    if (typeof error === "object" && error !== null && "digest" in error) throw error;
    return { status: "error", message: safeError(error) };
  }
  return { status: "success", message: "Sessão iniciada." };
}

export async function signOut(): Promise<void> {
  await assertMutationOrigin();
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/entrar");
}
