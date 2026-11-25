"use client";

import { useRef, type KeyboardEvent } from "react";
import estilos from "./Abas.module.css";

export type ItemAba = {
  valor: string;
  rotulo: string;
  contador?: number;
  desabilitada?: boolean;
};

type AbasProps = {
  abas: ItemAba[];
  valor: string;
  aoMudar: (valor: string) => void;
  rotuloAcessivel: string;
  variante?: "sublinhado" | "pilula";
};

export function Abas({ abas, valor, aoMudar, rotuloAcessivel, variante = "sublinhado" }: AbasProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function navegar(evento: KeyboardEvent<HTMLDivElement>) {
    const habilitadas = abas.map((aba, i) => (aba.desabilitada ? -1 : i)).filter((i) => i >= 0);
    const posicao = habilitadas.indexOf(abas.findIndex((aba) => aba.valor === valor));
    let proxima: number | undefined;

    if (evento.key === "ArrowRight") proxima = habilitadas[(posicao + 1) % habilitadas.length];
    if (evento.key === "ArrowLeft") proxima = habilitadas[(posicao - 1 + habilitadas.length) % habilitadas.length];
    if (evento.key === "Home") proxima = habilitadas[0];
    if (evento.key === "End") proxima = habilitadas[habilitadas.length - 1];
    if (proxima === undefined) return;

    evento.preventDefault();
    aoMudar(abas[proxima].valor);
    refs.current[proxima]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={rotuloAcessivel}
      className={`${estilos.lista} ${estilos[variante]}`}
      onKeyDown={navegar}
    >
      {abas.map((aba, i) => {
        const ativa = aba.valor === valor;
        return (
          <button
            key={aba.valor}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={ativa}
            tabIndex={ativa ? 0 : -1}
            disabled={aba.desabilitada}
            className={estilos.aba}
            onClick={() => aoMudar(aba.valor)}
          >
            {aba.rotulo}
            {aba.contador !== undefined && <span className={estilos.contador}>{aba.contador}</span>}
          </button>
        );
      })}
    </div>
  );
}
