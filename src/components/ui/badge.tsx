import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "indigo" }) {
  return <span className={cn("inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium", { "bg-slate-100 text-slate-700": tone === "neutral", "bg-emerald-50 text-emerald-800": tone === "green", "bg-amber-50 text-amber-800": tone === "amber", "bg-red-50 text-red-800": tone === "red", "bg-indigo-50 text-indigo-700": tone === "indigo" })}>{children}</span>;
}
