"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, CalendarCheck2, Calculator, ListTodo, Settings, Users, Library, MapPin, GraduationCap, Menu, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/disciplinas", label: "Disciplinas", icon: BookOpen },
  { href: "/frequencia", label: "Frequência", icon: CalendarCheck2 },
  { href: "/notas", label: "Simulador de notas", icon: Calculator },
  { href: "/tarefas", label: "Tarefas", icon: ListTodo },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
export function Brand() {
  return <Link href="/dashboard" aria-label="CampusHub, página inicial" className="flex items-center gap-2.5 text-xl font-bold tracking-tight"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white"><GraduationCap className="size-6" aria-hidden="true" /></span>Campus<span className="-ml-2 text-primary">Hub</span></Link>;
}
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return <nav aria-label="Menu principal" className="space-y-1">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={onNavigate} aria-current={path === href ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-muted", path === href ? "bg-indigo-50 text-primary" : "text-slate-600")}><Icon className="size-[18px]" aria-hidden="true" />{label}</Link>)}</nav>;
}
export function Sidebar() {
  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card p-5 lg:flex"><div className="px-2 py-3"><Brand /></div><p className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Meu espaço</p><Navigation /><p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Explore o campus</p><div className="space-y-1">{[{ icon: Users, label: "Comunidade" }, { icon: Library, label: "Biblioteca" }, { icon: MapPin, label: "Mapa do campus" }].map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-3 px-3 py-3 text-xs text-muted-foreground"><Icon className="size-[18px]" aria-hidden="true" /><span>{label}</span><span className="ml-auto whitespace-nowrap rounded bg-slate-100 px-1.5 py-1 text-[9px] font-semibold">Em breve</span></div>)}</div><div className="mt-auto rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"><p className="text-xs font-bold text-indigo-900">Um semestre mais leve.</p><p className="mt-2 text-xs leading-5 text-slate-600">Seu planejamento acadêmico, do seu jeito.</p><Link href="/configuracoes" className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">Sobre o projeto<ArrowUpRight className="size-3" /></Link></div><p className="mt-4 px-1 text-[10px] leading-4 text-muted-foreground">Projeto independente.<br />Sem vínculo com a PUC-Campinas.</p></aside>;
}
export function MobileNavigation() {
  return <details className="group relative lg:hidden"><summary aria-label="Abrir menu de navegação" className="flex size-10 list-none items-center justify-center rounded-lg border border-border"><Menu className="size-5" /></summary><div className="absolute left-0 top-12 z-40 w-72 max-w-[85vw] rounded-2xl border border-border bg-card p-3 shadow-xl"><Navigation onNavigate={() => { const active = document.querySelector("details.group"); active?.removeAttribute("open"); }} /><p className="p-3 text-xs text-muted-foreground">Comunidade, biblioteca e mapa: em breve.</p></div></details>;
}
