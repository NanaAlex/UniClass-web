import type { ReactNode } from "react";
import { LinkVoltar } from "./LinkVoltar";
import estilos from "./CabecalhoPagina.module.css";

type CabecalhoPaginaProps = {
  titulo: string;
  subtitulo?: string;
  /** Contexto acima do título, ex.: "Horários · 1º A". */
  sobretitulo?: string;
  /** Link de retorno acima de tudo, para telas de detalhe. */
  voltar?: { href: string; rotulo: string };
  /** Linha abaixo do título com etiquetas e dados (versão, datas). */
  meta?: ReactNode;
  /** Botões à direita. Uma ação primária no máximo. */
  acoes?: ReactNode;
};

export function CabecalhoPagina({ titulo, subtitulo, sobretitulo, voltar, meta, acoes }: CabecalhoPaginaProps) {
  return (
    <header className={estilos.cabecalho}>
      {voltar && <LinkVoltar href={voltar.href} rotulo={voltar.rotulo} />}
      <div className={estilos.linha}>
        <div className={estilos.textos}>
          {sobretitulo && <p className={estilos.sobretitulo}>{sobretitulo}</p>}
          <h1 className={estilos.titulo}>{titulo}</h1>
          {subtitulo && <p className={estilos.subtitulo}>{subtitulo}</p>}
          {meta && <div className={estilos.meta}>{meta}</div>}
        </div>
        {acoes && <div className={estilos.acoes}>{acoes}</div>}
      </div>
    </header>
  );
}
