"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { IconeCheck } from "@/components/ui/Icones";
import { aulasDoBloco, chaveBloco, rotulosDia } from "@/lib/horario";
import type { ChaveBloco, DiaSemana, EstruturaTurno } from "@/types";
import estilos from "./GradeDisponibilidade.module.css";

type TabelaDisponibilidadeProps = {
  estrutura: EstruturaTurno;
  /** K: cada bloco reúne K aulas consecutivas (RN-09, RN-10). */
  aulasPorBloco: number;
  marcados: Set<ChaveBloco>;
  definir: (chaves: ChaveBloco[], marcar: boolean) => void;
  desabilitada: boolean;
};

const rotuloAulas = (K: number, indice: number) => {
  const aulas = aulasDoBloco(K, indice);
  return aulas.length === 1 ? `aula ${aulas[0]}` : `aulas ${aulas[0]}–${aulas[aulas.length - 1]}`;
};

/** Seleção bloco a bloco: o bloco inteiro é a unidade; os não marcados ficam proibidos (RN-16). */
export function TabelaDisponibilidade({ estrutura, aulasPorBloco: K, marcados, definir, desabilitada }: TabelaDisponibilidadeProps) {
  const { turno, dias, blocos } = estrutura;
  const indices = Array.from({ length: blocos }, (_, i) => i + 1);
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

  function alternarGrupo(chaves: ChaveBloco[]) {
    definir(chaves, !chaves.every((chave) => marcados.has(chave)));
  }

  function iniciarArrasto(evento: PointerEvent<HTMLButtonElement>, chave: ChaveBloco) {
    if (evento.button !== 0) return;
    // No toque o navegador captura o ponteiro; liberar permite que outras células recebam pointerenter
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    const marcar = !marcados.has(chave);
    arrasto.current = { marcar };
    definir([chave], marcar);
  }

  const colunaDe = (dia: DiaSemana) => indices.map((indice) => chaveBloco(turno, dia, indice));

  return (
    <div className={estilos.rolagem}>
      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th scope="col" className={estilos.canto}>
              <span className="apenas-leitor">Bloco</span>
            </th>
            {dias.map((dia) => (
              <th key={dia} scope="col">
                <button
                  type="button"
                  className={estilos.cabecalho}
                  disabled={desabilitada}
                  onClick={() => alternarGrupo(colunaDe(dia))}
                  aria-label={`Alternar todos os blocos de ${rotulosDia[dia].longo.toLowerCase()}`}
                >
                  {rotulosDia[dia].longo}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {indices.map((indice) => {
            const linha = dias.map((dia) => chaveBloco(turno, dia, indice));
            return (
              <tr key={indice}>
                <th scope="row">
                  <button
                    type="button"
                    className={`${estilos.cabecalho} ${estilos.cabecalhoLinha}`}
                    disabled={desabilitada}
                    onClick={() => alternarGrupo(linha)}
                    aria-label={`Alternar o Bloco ${indice} em todos os dias`}
                  >
                    <span>Bloco {indice}</span>
                    <span className={estilos.hora}>{rotuloAulas(K, indice)}</span>
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
                        aria-label={`${rotulosDia[dia].longo}, Bloco ${indice} (${rotuloAulas(K, indice)})`}
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
        </tbody>
      </table>
    </div>
  );
}
