"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/server/action";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

const initialState: ActionState = { status: "idle", message: "" };
type Action = (state: ActionState, data: FormData) => Promise<ActionState>;

function Submit({ label, variant, compact }: { label: string; variant?: "default" | "outline" | "destructive" | "ghost"; compact?: boolean }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} size={compact ? "sm" : "default"} disabled={pending}>{pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}{pending ? "Salvando…" : label}</Button>;
}

export function ActionForm({ action, children, label = "Salvar", variant, compact, className = "space-y-4" }: { action: Action; children?: ReactNode; label?: string; variant?: "default" | "outline" | "destructive" | "ghost"; compact?: boolean; className?: string }) {
  const [state, formAction] = useActionState(action, initialState);
  return <form action={formAction} className={className}>{children}<Submit label={label} variant={variant} compact={compact} /><p role="status" aria-live="polite" className={`text-xs empty:hidden ${state.status === "error" ? "text-red-700" : "text-emerald-800"}`}>{state.message}</p></form>;
}
