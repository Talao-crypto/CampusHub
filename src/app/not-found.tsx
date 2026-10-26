import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
export default function NotFound() {
  return <main id="conteudo" className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6"><p className="text-sm font-semibold text-primary">CampusHub</p><h1 className="mt-4 text-3xl font-bold">Esta página não está disponível</h1><p className="my-5 text-sm leading-6 text-muted-foreground">Confira o endereço. O acesso demo funciona somente no ambiente local de desenvolvimento e precisa ser habilitado na configuração.</p><Link href="/entrar" className={buttonVariants({ className: "self-start" })}>Voltar ao início</Link></main>;
}
