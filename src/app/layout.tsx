import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CampusHub | Seu semestre, em dia", template: "%s | CampusHub" },
  description: "Organize suas disciplinas, frequência, notas e tarefas. Projeto independente, sem vínculo institucional.",
  applicationName: "CampusHub",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "CampusHub", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#4f46e5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body><a href="#conteudo" className="fixed left-4 top-2 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-3 text-white focus:translate-y-0">Pular para o conteúdo</a>{children}</body></html>;
}
