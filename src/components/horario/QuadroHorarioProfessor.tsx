"use client";

import type { ReactNode } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { formatarData } from "@/lib/formatacao";
import { posicoesPorTurno, type Nomes } from "@/lib/gestaoHorario";
import { rotulosTurno } from "@/lib/horario";
import type { BlocoGrade, Coordenada, EstruturaTurno } from "@/types";
import { GradeHorario } from "./GradeHorario";
import estilos from "./QuadroHorarioProfessor.module.css";

type QuadroHorarioProfessorProps = {
  nomeProfessor: string;
  posicoes: BlocoGrade[];
  aulasPorBloco: number;
  estruturas: EstruturaTurno[];
  nomes: Nomes;
  /** Etiqueta da situação (ex.: "Publicado"). */
  situacao: { rotulo: string; variante: "sucesso" | "aviso" | "info" | "neutra" };
  publicadoEm?: string | null;
  /** Pedido de alteração: a grade vira seleção de bloco. Sem `aoIniciarSelecao`, só leitura (admin). */
  selecionando?: boolean;
  selecionado?: Coordenada | null;
  aoIniciarSelecao?: () => void;
  aoCancelar?: () => void;
  aoSelecionar?: (bloco: BlocoGrade) => void;
  /** Formulário do pedido, exibido abaixo da grade durante a seleção. */
  children?: ReactNode;
};

/**
 * Horário do professor por blocos: todas as coordenadas de todos os turnos, com turma e disciplina
 * nas ocupadas e "Vago" nas demais (RN-69, CA-190). O pedido cita o bloco inteiro (RN-58).
 */
export function QuadroHorarioProfessor({
  nomeProfessor,
  posicoes,
  aulasPorBloco,
  estruturas,
  nomes,
  situacao,
  publicadoEm,
  selecionando = false,
  selecionado,
  aoIniciarSelecao,
  aoCancelar,
  aoSelecionar,
  children,
}: QuadroHorarioProfessorProps) {
  const ocupados = posicoes.filter((b) => b.disciplinaId).length;

  return (
    <section className={estilos.quadro} aria-labelledby="titulo-horario">
      <header className={estilos.cabecalho}>
        <div className={estilos.textos}>
          <h2 id="titulo-horario" className={estilos.titulo}>
            Horário de {nomeProfessor}
          </h2>
          <p className={estilos.meta}>
            <Etiqueta variante={situacao.variante} ponto>
              {situacao.rotulo}
            </Etiqueta>
            <span>
              {ocupados * aulasPorBloco} aulas por semana · {ocupados === 1 ? "1 bloco" : `${ocupados} blocos`} de {aulasPorBloco} aulas
            </span>
            {publicadoEm && (
              <span>
                Publicado em <time dateTime={publicadoEm}>{formatarData(publicadoEm)}</time>
              </span>
            )}
          </p>
        </div>
        {selecionando ? (
          <Botao variante="secundario" onClick={aoCancelar}>
            Cancelar solicitação
          </Botao>
        ) : (
          aoIniciarSelecao && (
            <Botao variante="secundario" onClick={aoIniciarSelecao}>
              Solicitar alteração
            </Botao>
          )
        )}
      </header>

      {selecionando && (
        <Aviso
          tipo="info"
          embutido
          titulo="Selecione o bloco que deseja alterar"
          descricao="Clique num bloco da grade e, em seguida, descreva o que precisa mudar. O pedido vale para o bloco inteiro."
        />
      )}

      <div className={estilos.turnos}>
        {posicoesPorTurno(posicoes).map(({ turno, posicoes: doTurno }) => {
          const estrutura = estruturas.find((e) => e.turno === turno);
          if (!estrutura) return null;
          return (
            <section key={turno} aria-labelledby={`horario-${turno}`}>
              <h3 id={`horario-${turno}`} className={estilos.tituloTurno}>
                {rotulosTurno[turno]}
              </h3>
              <GradeHorario
                estrutura={estrutura}
                aulasPorBloco={aulasPorBloco}
                posicoes={doTurno}
                nomes={nomes}
                modo={selecionando ? "selecionar" : "visualizar"}
                infoSecundaria="turma"
                selecionada={selecionado}
                aoEscolher={selecionando ? aoSelecionar : undefined}
                rotuloAcessivel={`Horário de ${nomeProfessor}, ${rotulosTurno[turno].toLowerCase()}`}
              />
            </section>
          );
        })}
      </div>

      {selecionando && <div className={estilos.pedido}>{children}</div>}
    </section>
  );
}
