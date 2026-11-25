"use client";

import { useState } from "react";
import { Botao } from "./Botao";
import { Modal } from "./Modal";

export type PedidoConfirmacao = {
  titulo: string;
  descricao: string;
  rotuloAcao: string;
  /** perigo: exclusões e desativações · primario: ações reversíveis */
  variante?: "perigo" | "primario";
  /** Se devolver uma Promise, o botão fica em carregamento e o modal só fecha quando ela termina. */
  aoConfirmar: () => void | Promise<void>;
};

type ModalConfirmacaoProps = {
  pedido: PedidoConfirmacao | null;
  aoFechar: () => void;
};

/** Confirmação antes de ações destrutivas ou difíceis de desfazer (docs/design.md). */
export function ModalConfirmacao({ pedido, aoFechar }: ModalConfirmacaoProps) {
  const [confirmando, setConfirmando] = useState(false);

  async function confirmar() {
    if (!pedido) return;
    setConfirmando(true);
    try {
      await pedido.aoConfirmar();
      aoFechar();
    } catch {
      // Quem pediu a confirmação mostra o erro; o modal continua aberto para tentar de novo
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <Modal
      aberto={pedido !== null}
      aoFechar={confirmando ? () => {} : aoFechar}
      tamanho="p"
      titulo={pedido?.titulo ?? ""}
      descricao={pedido?.descricao}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={confirmando}>
            Cancelar
          </Botao>
          <Botao variante={pedido?.variante ?? "perigo"} onClick={confirmar} carregando={confirmando}>
            {pedido?.rotuloAcao ?? "Confirmar"}
          </Botao>
        </>
      }
    />
  );
}
