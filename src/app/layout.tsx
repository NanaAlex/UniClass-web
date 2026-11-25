import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ProvedorAvisos } from "@/components/ui/ProvedorAvisos";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--fonte-principal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Staggy",
  description: "Geração de grade de horários escolares",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={dmSans.variable}>
      <body>
        {/* No layout raiz, os avisos sobrevivem à troca de área (ex.: login → admin) */}
        <ProvedorAvisos>{children}</ProvedorAvisos>
      </body>
    </html>
  );
}
