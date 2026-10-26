import "server-only";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { demoEnabled, isLocalHost, verifyDemoToken, DEMO_USER_ID } from "@/lib/security";
import { getDb } from "./db";
import { UserError } from "@/lib/errors";

export const SESSION_COOKIE = "campushub_demo";

export function isDemoAvailable() {
  return demoEnabled(process.env.NODE_ENV, process.env.DEMO_MODE, process.env.DEMO_SESSION_SECRET);
}

export async function assertDemoRequest() {
  if (!isDemoAvailable() || !isLocalHost((await headers()).get("host"))) notFound();
}

export async function assertMutationOrigin() {
  await assertDemoRequest();
  const requestHeaders = await headers();
  if (requestHeaders.get("origin") !== `http://${requestHeaders.get("host")}`) {
    throw new UserError("Origem da solicitação inválida. Reabra o aplicativo local.");
  }
}

export async function requireUser() {
  await assertDemoRequest();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !verifyDemoToken(token, process.env.DEMO_SESSION_SECRET ?? "")) redirect("/entrar");
  const user = await getDb().user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!user) redirect("/entrar?seed=missing");
  return user;
}
