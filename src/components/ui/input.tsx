import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const inputClass = "flex h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
export function Input({ className, ...props }: ComponentProps<"input">) { return <input className={cn(inputClass, className)} {...props} />; }
export function Select({ className, ...props }: ComponentProps<"select">) { return <select className={cn(inputClass, className)} {...props} />; }
