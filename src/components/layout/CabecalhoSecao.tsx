import type { ReactNode } from "react";
import estilos from "./CabecalhoSecao.module.css";

type CabecalhoSecaoProps = {
  titulo: string;
  /** id do h2, para a seção usar aria-labelledby. */
  id?: string;
  descricao?: ReactNode;
  /** Ações ou filtros à direita (quebram para baixo em telas estreitas). */
  acoes?: ReactNode;
};

/** Título de seção (h2, 20/600) com descrição opcional e ações à direita. */
export function CabecalhoSecao({ titulo, id, descricao, acoes }: CabecalhoSecaoProps) {
  return (
    <div className={estilos.cabecalho}>
      <div className={estilos.textos}>
        <h2 id={id} className={estilos.titulo}>
          {titulo}
        </h2>
        {descricao && <p className={estilos.descricao}>{descricao}</p>}
      </div>
      {acoes && <div className={estilos.acoes}>{acoes}</div>}
    </div>
  );
}
