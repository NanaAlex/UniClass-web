"use client";

import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import type { ChaveHorario, EstruturaTurno, InteresseDisciplina } from "@/types";
import { ResumoResposta } from "./ResumoResposta";
import estilos from "./ResumoResposta.module.css";

type ModalConfirmarEnvioProps = {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
  enviando: boolean;
  estruturas: EstruturaTurno[];
  disponibilidade: ChaveHorario[];
  interesses: InteresseDisciplina[];
};

export function ModalConfirmarEnvio({ aberto, aoFechar, aoConfirmar, enviando, ...resumo }: ModalConfirmarEnvioProps) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Enviar resposta?"
      descricao="Confira o resumo antes de enviar."
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={enviando}>
            Voltar e revisar
          </Botao>
          <Botao onClick={aoConfirmar} carregando={enviando}>
            Enviar resposta
          </Botao>
        </>
      }
    >
      <div className={estilos.confirmacao}>
        <ResumoResposta {...resumo} />
        <Aviso
          tipo="info"
          embutido
          titulo="Depois de enviar, a resposta fica bloqueada"
          descricao="Para alterar, será preciso solicitar a reabertura à coordenação."
        />
      </div>
    </Modal>
  );
}
