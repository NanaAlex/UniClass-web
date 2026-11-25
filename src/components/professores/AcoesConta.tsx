"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { nomeExibido } from "@/lib/professores";
import { alterarStatusConta, reenviarConvite } from "@/services/professores";
import type { ProfessorComSituacao } from "@/types";

type AcoesContaProps = {
  professor: ProfessorComSituacao;
  aoAtualizar: (professor: ProfessorComSituacao) => void;
};

/** RF 8.10, RF 1.8: desativar e reativar a conta · RF 5.9: reenviar o convite. */
export function AcoesConta({ professor, aoAtualizar }: AcoesContaProps) {
  const { mostrarAviso } = useAvisos();
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null);
  const [reenviando, setReenviando] = useState(false);
  const nome = nomeExibido(professor);

  function pedirAlteracao(ativar: boolean) {
    setPedido({
      titulo: ativar ? `Reativar a conta de ${nome}?` : `Desativar a conta de ${nome}?`,
      descricao: ativar
        ? "O professor volta a entrar no Staggy e a participar do formulário e da geração do horário."
        : "O professor não consegue mais entrar no Staggy e deixa de ser considerado na geração do horário. Você pode reativar a conta depois.",
      rotuloAcao: ativar ? "Reativar conta" : "Desativar conta",
      variante: ativar ? "primario" : "perigo",
      aoConfirmar: async () => {
        try {
          aoAtualizar(await alterarStatusConta(professor.id, ativar));
          mostrarAviso({ tipo: "sucesso", titulo: ativar ? "Conta reativada" : "Conta desativada", descricao: nome });
        } catch (erro) {
          mostrarAviso({ tipo: "perigo", titulo: "Não foi possível alterar a conta", descricao: "Tente novamente." });
          throw erro;
        }
      },
    });
  }

  async function reenviar() {
    setReenviando(true);
    try {
      await reenviarConvite(professor.id);
      mostrarAviso({ tipo: "sucesso", titulo: "Convite reenviado", descricao: professor.email });
    } catch {
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível reenviar o convite", descricao: "Tente novamente." });
    } finally {
      setReenviando(false);
    }
  }

  return (
    <>
      {professor.statusConta === "convidado" && (
        <Botao variante="secundario" carregando={reenviando} onClick={reenviar}>
          Reenviar convite
        </Botao>
      )}
      {professor.statusConta === "ativa" && (
        <Botao variante="secundario" onClick={() => pedirAlteracao(false)}>
          Desativar conta
        </Botao>
      )}
      {professor.statusConta === "desativada" && (
        <Botao variante="secundario" onClick={() => pedirAlteracao(true)}>
          Reativar conta
        </Botao>
      )}
      <ModalConfirmacao pedido={pedido} aoFechar={() => setPedido(null)} />
    </>
  );
}
