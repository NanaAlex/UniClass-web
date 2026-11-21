"use client";

import { useRef, useState } from "react";
import { Abas } from "@/components/ui/Abas";
import { Botao } from "@/components/ui/Botao";
import { chaveBloco, rotulosTurno } from "@/lib/horario";
import type { ChaveBloco, EstruturaTurno, Turno } from "@/types";
import { TabelaDisponibilidade } from "./TabelaDisponibilidade";
import estilos from "./GradeDisponibilidade.module.css";

type GradeDisponibilidadeProps = {
  /** Uma estrutura por turno (dias letivos e quantidade de blocos), da edição do formulário. */
  estruturas: EstruturaTurno[];
  /** K: aulas por bloco, igual em todos os turnos (RN-09). */
  aulasPorBloco: number;
  /** Blocos marcados como disponíveis. */
  valor: ChaveBloco[];
  aoMudar: (valor: ChaveBloco[]) => void;
  turnoInicial?: Turno;
  /** Formulário encerrado ou já enviado (RF 2.12, RF 2.18). */
  desabilitada?: boolean;
};

function chavesDoTurno(estrutura: EstruturaTurno) {
  return estrutura.dias.flatMap((dia) => Array.from({ length: estrutura.blocos }, (_, i) => chaveBloco(estrutura.turno, dia, i + 1)));
}

export function GradeDisponibilidade({ estruturas, aulasPorBloco, valor, aoMudar, turnoInicial, desabilitada = false }: GradeDisponibilidadeProps) {
  const [turno, setTurno] = useState<Turno>(turnoInicial ?? estruturas[0]?.turno ?? "manha");
  const estrutura = estruturas.find((e) => e.turno === turno) ?? estruturas[0];

  // Mantém o valor mais recente entre eventos do arrasto, antes do pai re-renderizar
  const valorAtual = useRef(valor);
  valorAtual.current = valor;

  const marcados = new Set(valor);

  function definir(chaves: ChaveBloco[], marcar: boolean) {
    const proximo = new Set(valorAtual.current);
    chaves.forEach((chave) => (marcar ? proximo.add(chave) : proximo.delete(chave)));
    valorAtual.current = Array.from(proximo);
    aoMudar(valorAtual.current);
  }

  if (!estrutura) return null;

  const todasDoTurno = chavesDoTurno(estrutura);
  const totalMarcado = todasDoTurno.filter((chave) => marcados.has(chave)).length;

  return (
    <div className={estilos.container}>
      <div className={estilos.barra}>
        <Abas
          abas={estruturas.map((e) => ({
            valor: e.turno,
            rotulo: rotulosTurno[e.turno],
            contador: chavesDoTurno(e).filter((chave) => marcados.has(chave)).length,
          }))}
          valor={turno}
          aoMudar={(novo) => setTurno(novo as Turno)}
          rotuloAcessivel="Turno"
          variante="pilula"
        />
        <div className={estilos.acoes}>
          <span className={estilos.resumo} aria-live="polite">
            {totalMarcado} de {todasDoTurno.length} blocos disponíveis
          </span>
          <Botao variante="fantasma" tamanho="p" disabled={desabilitada || totalMarcado === todasDoTurno.length} onClick={() => definir(todasDoTurno, true)}>
            Marcar todos
          </Botao>
          <Botao variante="fantasma" tamanho="p" disabled={desabilitada || totalMarcado === 0} onClick={() => definir(todasDoTurno, false)}>
            Limpar
          </Botao>
        </div>
      </div>

      <div role="tabpanel" aria-label={`Disponibilidade — ${rotulosTurno[turno]}`}>
        <TabelaDisponibilidade estrutura={estrutura} aulasPorBloco={aulasPorBloco} marcados={marcados} definir={definir} desabilitada={desabilitada} />
      </div>

      <p className={estilos.ajuda}>
        Cada bloco reúne {aulasPorBloco} aulas seguidas e é atribuído inteiro. Blocos não marcados ficam proibidos para você. Clique e
        arraste para marcar vários; clique no dia ou no bloco para marcar a coluna ou a linha inteira.
      </p>
    </div>
  );
}
