import { Etiqueta } from "@/components/ui/Etiqueta";
import { situacaoDaSolicitacao } from "@/lib/solicitacao";
import type { Solicitacao } from "@/types";

type EtiquetaStatusSolicitacaoProps = {
  solicitacao: Pick<Solicitacao, "tipo" | "status" | "lidaEm">;
};

/** Formulário: pendente/aprovada/rejeitada · Horário: não lida/lida (RF 3.4). */
export function EtiquetaStatusSolicitacao({ solicitacao }: EtiquetaStatusSolicitacaoProps) {
  const { rotulo, variante } = situacaoDaSolicitacao(solicitacao);
  return (
    <Etiqueta variante={variante} ponto>
      {rotulo}
    </Etiqueta>
  );
}
