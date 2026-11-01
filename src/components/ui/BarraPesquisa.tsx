"use client";

import type { FormEvent } from "react";
import { BotaoIcone } from "./BotaoIcone";
import { IconeFechar, IconeLupa } from "./Icones";
import estilos from "./BarraPesquisa.module.css";

type BarraPesquisaProps = {
  valor: string;
  aoMudar: (valor: string) => void;
  aoPesquisar?: (valor: string) => void;
  placeholder?: string;
  rotuloAcessivel?: string;
  carregando?: boolean;
  desabilitada?: boolean;
};

export function BarraPesquisa({
  valor,
  aoMudar,
  aoPesquisar,
  placeholder = "Pesquisar",
  rotuloAcessivel = "Pesquisar",
  carregando = false,
  desabilitada = false,
}: BarraPesquisaProps) {
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    aoPesquisar?.(valor);
  }

  return (
    <form role="search" className={estilos.barra} onSubmit={enviar}>
      <span className={estilos.lupa} aria-hidden="true">
        {carregando ? <span className={estilos.spinner} /> : <IconeLupa />}
      </span>
      <input
        type="search"
        className={estilos.campo}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        placeholder={placeholder}
        aria-label={rotuloAcessivel}
        disabled={desabilitada}
      />
      {valor && !desabilitada && (
        <BotaoIcone rotulo="Limpar pesquisa" icone={<IconeFechar />} tamanho="p" className={estilos.limpar} onClick={() => aoMudar("")} />
      )}
    </form>
  );
}
