import { requireUser } from "@/lib/server/auth";
import { Sidebar, MobileNavigation } from "@/components/navigation";
import { signOut } from "@/app/entrar/actions";
import { LogOut, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="min-h-screen"><Sidebar /><div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-8"><div className="flex min-w-0 items-center gap-3"><MobileNavigation /><GraduationCap className="hidden size-5 text-muted-foreground sm:block" aria-hidden="true" /><div><p className="text-xs font-semibold sm:text-sm">Meu planejamento acadêmico</p><p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">PUC-Campinas · dados pessoais</p></div></div><div className="flex shrink-0 items-center gap-3"><span className="hidden rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 sm:inline">DEMO LOCAL</span><span className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700" title={user.name}>JD</span><form action={signOut}><Button variant="ghost" size="icon" aria-label="Sair"><LogOut className="size-4" /></Button></form></div></header><main id="conteudo" className="mx-auto max-w-[1440px] p-4 pb-12 sm:p-8">{children}</main></div></div>;
}
