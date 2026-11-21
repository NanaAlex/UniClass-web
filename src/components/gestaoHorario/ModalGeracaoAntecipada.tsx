"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import type { ProfessorResumo } from "@/types";
import estilos from "./GestaoHorario.module.css";

type ModalGeracaoAntecipadaProps = {
  pendentes: ProfessorResumo[] | null;
  aoFechar: () => void;
  aoConfirmar: () => Promise<void>;
};

/**
 * RN-37, CA-83: há professores ativos sem resposta enviada. Eles ficam fora da geração (não recebem
 * aulas) e a confirmação fica registrada na execução.
 */
export function ModalGeracaoAntecipada({ pendentes, aoFechar, aoConfirmar }: ModalGeracaoAntecipadaProps) {
  const [confirmando, setConfirmando] = useState(false);
  const total = pendentes?.length ?? 0;

  async function confirmar() {
    setConfirmando(true);
    try {
      await aoConfirmar();
    } catch {
      // O aviso de erro já foi mostrado; o modal continua aberto para tentar de novo
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <Modal
      aberto={pendentes !== null}
      aoFechar={aoFechar}
      titulo="Gerar antes de todos responderem?"
      descricao={`${total === 1 ? "1 professor ativo ainda não enviou" : `${total} professores ativos ainda não enviaram`} a resposta da edição vigente do formulário. Sem resposta, o professor não participa desta geração e não recebe aulas.`}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={confirmando}>
            Aguardar respostas
          </Botao>
          <Botao onClick={confirmar} carregando={confirmando}>
            Confirmar geração antecipada
          </Botao>
        </>
      }
    >
      <ul className={estilos.listaPendentes} aria-label="Professores sem resposta enviada">
        {pendentes?.map((p) => (
          <li key={p.id}>{p.nome}</li>
        ))}
      </ul>
    </Modal>
  );
}
