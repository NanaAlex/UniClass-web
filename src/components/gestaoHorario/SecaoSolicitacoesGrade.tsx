"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { ListaSolicitacoes } from "@/components/solicitacoes/ListaSolicitacoes";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { aguardandoAdministrador } from "@/lib/solicitacao";
import type { Solicitacao } from "@/types";
import estilos from "./GradeTurma.module.css";

type SecaoSolicitacoesGradeProps = {
  solicitacoes: Solicitacao[];
  aoMarcarLida: (solicitacao: Solicitacao) => Promise<void>;
};

/** RF 3.4: pedidos dos professores sobre aulas desta turma. Não há aceite: só "marcar como lida". */
export function SecaoSolicitacoesGrade({ solicitacoes, aoMarcarLida }: SecaoSolicitacoesGradeProps) {
  const { mostrarAviso } = useAvisos();
  const [idProcessando, setIdProcessando] = useState<string>();
  const ordenadas = [...solicitacoes].sort((a, b) => Number(aguardandoAdministrador(b)) - Number(aguardandoAdministrador(a)));

  async function marcar(solicitacao: Solicitacao) {
    setIdProcessando(solicitacao.id);
    try {
      await aoMarcarLida(solicitacao);
      mostrarAviso({ tipo: "sucesso", titulo: "Pedido marcado como lido", descricao: "O professor vê que a coordenação leu o pedido." });
    } catch {
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível marcar como lido", descricao: "Tente novamente em instantes." });
    } finally {
      setIdProcessando(undefined);
    }
  }

  return (
    <section className={estilos.secao} aria-labelledby="titulo-solicitacoes-turma">
      <CabecalhoSecao
        id="titulo-solicitacoes-turma"
        titulo="Solicitações de alteração"
        descricao="Pedidos dos professores sobre aulas desta turma. As não lidas aparecem marcadas na grade."
      />
      <ListaSolicitacoes
        solicitacoes={ordenadas}
        perfil="administrador"
        idProcessando={idProcessando}
        aoMarcarComoLida={marcar}
        mensagemVazia="Nenhum professor pediu alteração nas aulas desta turma."
      />
    </section>
  );
}
