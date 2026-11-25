import type { ReactNode } from "react";
import { EstruturaPagina } from "@/components/layout/EstruturaPagina";
import { hrefConfiguracoes, itensMenuAdministrador } from "@/lib/navegacao";
import { aguardandoAdministrador } from "@/lib/solicitacao";
import { listarSolicitacoes } from "@/services/solicitacoes";
import { obterUsuarioLogado } from "@/services/usuarios";

export default async function LayoutAdministrador({ children }: { children: ReactNode }) {
  const [usuario, solicitacoes] = await Promise.all([obterUsuarioLogado("administrador"), listarSolicitacoes()]);

  // Pendências aparecem no item Professores, onde o admin trata as solicitações (RF 4.4)
  const pendentes = solicitacoes.filter(aguardandoAdministrador).length;
  const itens = itensMenuAdministrador.map((item) =>
    item.href === "/admin/professores" ? { ...item, contador: pendentes } : item,
  );

  return (
    <EstruturaPagina itensMenu={itens} usuario={usuario} hrefConfiguracoes={hrefConfiguracoes.administrador}>
      {children}
    </EstruturaPagina>
  );
}
