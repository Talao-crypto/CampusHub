"use client";
import { Input, Select } from "@/components/ui/input";
import { useId, type ComponentProps, type ReactNode } from "react";

export function Field({ label, hint, ...props }: ComponentProps<typeof Input> & { label: string; hint?: string }) {
  const generated = useId();
  const id = props.id ?? generated;
  return <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700" htmlFor={id}>{label}</label><Input {...props} id={id} aria-describedby={hint ? `${id}-hint` : undefined} />{hint && <p id={`${id}-hint`} className="text-xs leading-5 text-muted-foreground">{hint}</p>}</div>;
}
export function SelectField({ label, children, ...props }: ComponentProps<typeof Select> & { label: string; children: ReactNode }) {
  const generated = useId();
  const id = props.id ?? generated;
  return <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700" htmlFor={id}>{label}</label><Select {...props} id={id}>{children}</Select></div>;
}
