"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { BotaoIcone } from "./BotaoIcone";
import { IconeFechar } from "./Icones";
import estilos from "./Modal.module.css";

type ModalProps = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  rodape?: ReactNode;
  tamanho?: "p" | "m" | "g";
  children?: ReactNode;
};

export function Modal({ aberto, aoFechar, titulo, descricao, rodape, tamanho = "m", children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  // Clique no fundo (fora da caixa) fecha o modal
  function aoClicar(evento: MouseEvent<HTMLDialogElement>) {
    if (evento.target === ref.current) aoFechar();
  }

  return (
    <dialog
      ref={ref}
      className={`${estilos.modal} ${estilos[tamanho]}`}
      aria-labelledby={idTitulo}
      onCancel={(evento) => {
        evento.preventDefault();
        aoFechar();
      }}
      onClick={aoClicar}
    >
      <div className={estilos.caixa}>
        <header className={estilos.cabecalho}>
          <div>
            <h2 id={idTitulo} className={estilos.titulo}>
              {titulo}
            </h2>
            {descricao && <p className={estilos.descricao}>{descricao}</p>}
          </div>
          <BotaoIcone rotulo="Fechar" icone={<IconeFechar />} onClick={aoFechar} />
        </header>
        {children && <div className={estilos.corpo}>{children}</div>}
        {rodape && <footer className={estilos.rodape}>{rodape}</footer>}
      </div>
    </dialog>
  );
}
