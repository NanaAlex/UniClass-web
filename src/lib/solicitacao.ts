import type { VarianteEtiqueta } from "@/components/ui/Etiqueta";
import type { Solicitacao } from "@/types";

/** Tamanho da descrição de qualquer solicitação (formulário ou horário). */
export const LIMITES_DESCRICAO = { minimo: 20, maximo: 500 };

type Situacao ={ rotulo: string; variante: VarianteEtiqueta };

const situacoesFormulario: Record<Solicitacao["status"], Situacao> = {
  pendente: { rotulo: "Pendente", variante: "aviso" },
  aprovada: { rotulo: "Aprovada", variante: "sucesso" },
  rejeitada: { rotulo: "Rejeitada", variante: "perigo" },
};

/** Horário não tem aceite (RF 3.4): a situação exibida é lida/não lida. */
export function situacaoDaSolicitacao(solicitacao: Pick<Solicitacao, "tipo" | "status" | "lidaEm">): Situacao {
  if (solicitacao.tipo === "horario") {
    return solicitacao.lidaEm ? { rotulo: "Lida", variante: "info" } : { rotulo: "Não lida", variante: "aviso" };
  }
  return situacoesFormulario[solicitacao.status];
}

/** Ainda depende de uma ação do administrador. */
export function aguardandoAdministrador(solicitacao: Solicitacao) {
  return solicitacao.tipo === "horario" ? !solicitacao.lidaEm : solicitacao.status === "pendente";
}
