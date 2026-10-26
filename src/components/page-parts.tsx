import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Info } from "lucide-react";
import { Card } from "./ui/card";
import { buttonVariants } from "./ui/button";
import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{children}</div>;
}
export function Notice({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs leading-5 text-indigo-900"><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><div>{children}</div></div>;
}
export function EmptyState({ title = "Seu semestre começa aqui", description = "Cadastre sua primeira disciplina para acompanhar notas e frequência.", href = "/disciplinas", action = "Cadastrar disciplina" }: { title?: string; description?: string; href?: string; action?: string }) {
  return <Card className="flex min-h-64 flex-col items-center justify-center text-center"><span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-primary"><BookOpen aria-hidden="true" /></span><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p><Link className={buttonVariants({ className: "mt-5" })} href={href}>{action}<ArrowRight className="size-4" /></Link></Card>;
}
export function Pagination({ page, total, size = 12, path, query = "" }: { page: number; total: number; size?: number; path: string; query?: string }) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages === 1 && page === 1) return null;
  return <nav aria-label="Paginação" className="mt-6 flex items-center justify-between gap-4 text-sm"><div>{total} registros · Página {page} de {pages}</div><div className="flex gap-2">{page > 1 && <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`${path}?page=${page - 1}${query}`}><ArrowLeft className="size-4" />Anterior</Link>}{page < pages && <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`${path}?page=${page + 1}${query}`}>Próxima<ArrowRight className="size-4" /></Link>}</div></nav>;
}
export const colors = { indigo: "bg-indigo-100 text-indigo-700", teal: "bg-teal-100 text-teal-800", amber: "bg-amber-100 text-amber-800", rose: "bg-rose-100 text-rose-800" };
export function SubjectIcon({ code, color }: { code: string; color: string }) {
  return <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${colors[color as keyof typeof colors] ?? colors.indigo}`}>{code.slice(0, 3)}</span>;
}
