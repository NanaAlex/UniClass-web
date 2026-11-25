"use client";

import { Fragment, useEffect, useRef, type PointerEvent } from "react";
import { IconeCheck } from "@/components/ui/Icones";
import { chaveHorario, rotuloAula, rotulosDia } from "@/lib/horario";
import type { ChaveHorario, DiaSemana, EstruturaTurno } from "@/types";
import estilos from "./GradeDisponibilidade.module.css";

type TabelaDisponibilidadeProps = {
  estrutura: EstruturaTurno;
  marcados: Set<ChaveHorario>;
  definir: (chaves: ChaveHorario[], marcar: boolean) => void;
  desabilitada: boolean;
};

export function TabelaDisponibilidade({ estrutura, marcados, definir, desabilitada }: TabelaDisponibilidadeProps) {
  const { turno, dias, blocos } = estrutura;
  // Durante o arrasto, todas as células visitadas recebem a mesma ação da primeira
  const arrasto = useRef<{ marcar: boolean } | null>(null);

  useEffect(() => {
    const encerrar = () => (arrasto.current = null);
    window.addEventListener("pointerup", encerrar);
    window.addEventListener("pointercancel", encerrar);
    return () => {
      window.removeEventListener("pointerup", encerrar);
      window.removeEventListener("pointercancel", encerrar);
    };
  }, []);

  const posicoes = blocos.flatMap((bloco) => bloco.aulas.map((aula) => aula.posicao));

  function alternarGrupo(chaves: ChaveHorario[]) {
    definir(chaves, !chaves.every((chave) => marcados.has(chave)));
  }

  function iniciarArrasto(evento: PointerEvent<HTMLButtonElement>, chave: ChaveHorario) {
    if (evento.button !== 0) return;
    // No toque o navegador captura o ponteiro; liberar permite que outras células recebam pointerenter
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    const marcar = !marcados.has(chave);
    arrasto.current = { marcar };
    definir([chave], marcar);
  }

  function colunaDe(dia: DiaSemana) {
    return posicoes.map((posicao) => chaveHorario(turno, dia, posicao));
  }

  return (
    <div className={estilos.rolagem}>
      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th scope="col" className={estilos.canto}>
              <span className="apenas-leitor">Aula</span>
            </th>
            {dias.map((dia) => (
              <th key={dia} scope="col">
                <button
                  type="button"
                  className={estilos.cabecalho}
                  disabled={desabilitada}
                  onClick={() => alternarGrupo(colunaDe(dia))}
                  aria-label={`Alternar toda a ${rotulosDia[dia].longo.toLowerCase()}`}
                >
                  {rotulosDia[dia].longo}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {blocos.map((bloco, indiceBloco) => (
            <Fragment key={indiceBloco}>
              {indiceBloco > 0 && (
                <tr className={estilos.intervalo}>
                  <td colSpan={dias.length + 1}>Intervalo</td>
                </tr>
              )}
              {bloco.aulas.map((aula) => {
                const linha = dias.map((dia) => chaveHorario(turno, dia, aula.posicao));
                return (
                  <tr key={aula.posicao}>
                    <th scope="row">
                      <button
                        type="button"
                        className={`${estilos.cabecalho} ${estilos.cabecalhoLinha}`}
                        disabled={desabilitada}
                        onClick={() => alternarGrupo(linha)}
                        aria-label={`Alternar a ${rotuloAula(aula.posicao)} em todos os dias`}
                      >
                        <span>{rotuloAula(aula.posicao)}</span>
                        {aula.inicio && <span className={estilos.hora}>{aula.inicio}–{aula.fim}</span>}
                      </button>
                    </th>
                    {dias.map((dia, i) => {
                      const chave = linha[i];
                      const disponivel = marcados.has(chave);
                      return (
                        <td key={dia}>
                          <button
                            type="button"
                            className={estilos.horario}
                            aria-pressed={disponivel}
                            aria-label={`${rotulosDia[dia].longo}, ${rotuloAula(aula.posicao)}${aula.inicio ? ` (${aula.inicio}–${aula.fim})` : ""}`}
                            disabled={desabilitada}
                            onPointerDown={(evento) => iniciarArrasto(evento, chave)}
                            onPointerEnter={() => arrasto.current && definir([chave], arrasto.current.marcar)}
                            // Teclado (detail 0): o ponteiro já tratou os cliques do mouse e do toque
                            onClick={(evento) => evento.detail === 0 && definir([chave], !disponivel)}
                          >
                            {disponivel && <IconeCheck aria-hidden="true" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
