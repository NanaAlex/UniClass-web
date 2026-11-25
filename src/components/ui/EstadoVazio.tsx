import type { ReactNode } from "react";
import estilos from "./EstadoVazio.module.css";

type EstadoVazioProps = {
  titulo: string;
  descricao?: ReactNode;
  icone?: ReactNode;
  acao?: ReactNode;
  /** Borda tracejada sobre a superfície: vazio solto na página, fora de um Cartao. */
  contorno?: boolean;
};

export function EstadoVazio({ titulo, descricao, icone, acao, contorno = false }: EstadoVazioProps) {
  return (
    <div className={contorno ? `${estilos.estado} ${estilos.contorno}` : estilos.estado}>
      <div className={estilos.icone} aria-hidden="true">
        {icone ?? (
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7.5 12 4l8 3.5M4 7.5V16.5L12 20m-8-12.5L12 11m8-3.5V16.5L12 20m8-12.5L12 11m0 0v9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <h3 className={estilos.titulo}>{titulo}</h3>
      {descricao && <p className={estilos.descricao}>{descricao}</p>}
      {acao && <div className={estilos.acao}>{acao}</div>}
    </div>
  );
}
