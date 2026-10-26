"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="conteudo" className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-bold">Não foi possível carregar os dados</h1><p className="my-4 text-muted-foreground">Verifique a conexão com o PostgreSQL e tente novamente. Seus dados já salvos continuam no banco.</p><Button onClick={reset}>Tentar novamente</Button></main>;
}
