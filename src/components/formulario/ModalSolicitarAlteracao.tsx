"use client";

import { useState, type FormEvent } from "react";
import { AreaTexto } from "@/components/ui/AreaTexto";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import { LIMITES_DESCRICAO } from "@/lib/solicitacao";

type ModalSolicitarAlteracaoProps = {
  aberto: boolean;
  aoFechar: () => void;
  /** Rejeita a promessa em caso de falha; o modal continua aberto com o texto. */
  aoEnviar: (descricao: string) => Promise<void>;
};

const { minimo: MINIMO, maximo: MAXIMO } = LIMITES_DESCRICAO;
const ID_FORM = "form-solicitar-alteracao";

/** RF 2.15: pedido para reabrir a resposta do formulário, com a justificativa do professor. */
export function ModalSolicitarAlteracao({ aberto, aoFechar, aoEnviar }: ModalSolicitarAlteracaoProps) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  function fechar() {
    if (enviando) return;
    setErro(undefined);
    aoFechar();
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const descricao = texto.trim();
    if (descricao.length < MINIMO) {
      setErro(`Explique o motivo com pelo menos ${MINIMO} caracteres.`);
      return;
    }
    setEnviando(true);
    try {
      await aoEnviar(descricao);
      setTexto("");
      setErro(undefined);
      aoFechar();
    } catch {
      setErro("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      aoFechar={fechar}
      titulo="Solicitar alteração do formulário"
      descricao="A coordenação vai analisar o pedido. Se aprovar, você poderá editar e reenviar sua resposta."
      rodape={
        <>
          <Botao variante="secundario" onClick={fechar} disabled={enviando}>
            Cancelar
          </Botao>
          <Botao type="submit" form={ID_FORM} carregando={enviando}>
            Enviar solicitação
          </Botao>
        </>
      }
    >
      <form id={ID_FORM} onSubmit={enviar} noValidate>
        <AreaTexto
          rotulo="O que você precisa alterar?"
          placeholder="Ex.: Passei a ter disponibilidade às quintas à noite e gostaria de incluir esse período."
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setErro(undefined);
          }}
          maxLength={MAXIMO}
          mostrarContador
          erro={erro}
          dica={`Mínimo de ${MINIMO} caracteres.`}
          required
          autoFocus
        />
      </form>
    </Modal>
  );
}
