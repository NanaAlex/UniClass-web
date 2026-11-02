"use client";

import { useState } from "react";
import { ListaSolicitacoes } from "@/components/solicitacoes/ListaSolicitacoes";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { aguardandoAdministrador } from "@/lib/solicitacao";
import { marcarComoLida, responderSolicitacao } from "@/services/solicitacoes";
import type { Solicitacao } from "@/types";
import { ModalAnalisarSolicitacao } from "./ModalAnalisarSolicitacao";

type AbaSolicitacoesProfessorProps = {
  solicitacoes: Solicitacao[];
  aoAtualizar: (solicitacao: Solicitacao) => void;
  aoVerFormulario: () => void;
};

const mensagensSucesso = {
  lida: { titulo: "Pedido marcado como lido", descricao: "O professor vê que a coordenação leu o pedido." },
  aprovada: { titulo: "Formulário reaberto", descricao: "O professor já pode alterar a resposta." },
  rejeitada: { titulo: "Pedido recusado", descricao: "O professor vê a recusa junto com sua resposta, se houver." },
};

/** RF 8.9: pedidos do professor, os que aguardam a coordenação primeiro. */
export function AbaSolicitacoesProfessor({ solicitacoes, aoAtualizar, aoVerFormulario }: AbaSolicitacoesProfessorProps) {
  const { mostrarAviso } = useAvisos();
  const [aberta, setAberta] = useState<Solicitacao | null>(null);
  const ordenadas = [...solicitacoes].sort((a, b) => Number(aguardandoAdministrador(b)) - Number(aguardandoAdministrador(a)));

  async function decidir(solicitacao: Solicitacao, decisao: keyof typeof mensagensSucesso, resposta: string) {
    const atualizada =
      decisao === "lida" ? await marcarComoLida(solicitacao.id, resposta) : await responderSolicitacao(solicitacao.id, decisao, resposta);
    aoAtualizar(atualizada);
    setAberta(null);
    mostrarAviso({ tipo: "sucesso", ...mensagensSucesso[decisao] });
  }

  return (
    <>
      <ListaSolicitacoes
        solicitacoes={ordenadas}
        perfil="administrador"
        mostrarProfessor={false}
        aoAbrir={setAberta}
        mensagemVazia="Este professor ainda não pediu alterações de horário ou de formulário."
      />
      <ModalAnalisarSolicitacao
        solicitacao={aberta}
        aoFechar={() => setAberta(null)}
        aoDecidir={decidir}
        aoVerFormulario={() => {
          setAberta(null);
          aoVerFormulario();
        }}
      />
    </>
  );
}
