import Link from "next/link";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { formatarDataHora } from "@/lib/formatacao";
import { rotulosStatus } from "@/lib/geracao";
import { hrefExecucao, ordenarExecucoes } from "@/lib/gestaoHorario";
import type { Execucao } from "@/types";
import estilos from "./GestaoHorario.module.css";

type HistoricoExecucoesProps = {
  execucoes: Execucao[];
  selecionadaId: string | null;
  vigenteId: string | null;
};

/** Todas as execuções do período: nenhuma é apagada, e a publicação vigente é a mais recente (RN-29). */
export function HistoricoExecucoes({ execucoes, selecionadaId, vigenteId }: HistoricoExecucoesProps) {
  return (
    <section className={estilos.secaoLista} aria-labelledby="titulo-historico">
      <CabecalhoSecao id="titulo-historico" titulo="Execuções do período" descricao="Cada geração fica registrada com o snapshot, o status e o painel." />
      <ul className={estilos.historicoExecucoes}>
        {ordenarExecucoes(execucoes).map((e) => {
          const status = rotulosStatus[e.status];
          const atual = e.id === selecionadaId;
          return (
            <li key={e.id} aria-current={atual || undefined}>
              <span>{formatarDataHora(e.iniciadaEm)}</span>
              <span className={estilos.etiquetasExecucao}>
                <Etiqueta variante={status.variante}>{status.rotulo}</Etiqueta>
                {e.id === vigenteId && <Etiqueta variante="sucesso">Vigente</Etiqueta>}
                {e.publicadaEm && e.id !== vigenteId && <Etiqueta>Publicada anteriormente</Etiqueta>}
                {e.simulada && <Etiqueta variante="info">Simulação</Etiqueta>}
                {e.painel.custoTotal !== null && <span className={estilos.textoSecundario}>C = {e.painel.custoTotal}</span>}
              </span>
              {atual ? (
                <span className={estilos.textoSecundario}>Em exibição</span>
              ) : (
                <Link href={hrefExecucao(e.id)} className={estilos.linkPendencia} scroll={false}>
                  Ver resultado<span className="apenas-leitor"> da execução de {formatarDataHora(e.iniciadaEm)}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
