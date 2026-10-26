export default function Loading() {
  return <div aria-label="Carregando seus dados" role="status" className="space-y-6 motion-safe:animate-pulse"><div className="h-9 w-64 rounded-xl bg-slate-200" /><div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((n) => <div key={n} className="h-32 rounded-2xl border border-border bg-card" />)}</div><div className="h-72 rounded-2xl border border-border bg-card" /><span className="sr-only">Carregando…</span></div>;
}
