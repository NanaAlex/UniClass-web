import type { ReactNode } from "react";
import { EstruturaPagina } from "@/components/layout/EstruturaPagina";
import { hrefConfiguracoes, itensMenuProfessor } from "@/lib/navegacao";
import { obterUsuarioLogado } from "@/services/usuarios";

export default async function LayoutProfessor({ children }: { children: ReactNode }) {
  const usuario = await obterUsuarioLogado("professor");

  return (
    <EstruturaPagina itensMenu={itensMenuProfessor} usuario={usuario} hrefConfiguracoes={hrefConfiguracoes.professor}>
      {children}
    </EstruturaPagina>
  );
}
