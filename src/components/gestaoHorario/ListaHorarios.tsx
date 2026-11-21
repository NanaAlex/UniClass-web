"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { Abas } from "@/components/ui/Abas";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { filtrarTurmas, filtrosVazios, professoresNaGrade, type FiltrosHorario as Filtros } from "@/lib/gestaoHorario";
import type { Execucao, ProfessorResumo, Trava, Turma } from "@/types";
import { CartaoTurmaHorario } from "./CartaoTurmaHorario";
import { FiltrosHorario } from "./FiltrosHorario";
import { ListaProfessoresHorario } from "./ListaProfessoresHorario";
import estilos from "./GestaoHorario.module.css";

type ListaHorariosProps = {
  execucao: Execucao;
  turmas: Turma[];
  professores: ProfessorResumo[];
  travas: Trava[];
};

type Visao = "turmas" | "professores";

/** A grade validada da execução por turma (com filtros) ou por professor. */
export function ListaHorarios({ execucao, turmas, professores, travas }: ListaHorariosProps) {
  const [visao, setVisao] = useState<Visao>("turmas");
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios);
  const grades = execucao.grade?.porTurma ?? [];
  const filtradas = filtrarTurmas(grades, turmas, travas, filtros);
  const naGrade = professoresNaGrade(execucao, professores, turmas);

  return (
    <section className={estilos.secaoLista} aria-labelledby="titulo-grade-execucao">
      <CabecalhoSecao
        id="titulo-grade-execucao"
        titulo="Grade desta execução"
        descricao="Abra uma turma ou um professor para ver os blocos, travar posições e trocar blocos dentro da mesma turma."
        acoes={
          <Abas
            rotuloAcessivel="Ver grade por"
            variante="pilula"
            valor={visao}
            aoMudar={(valor) => setVisao(valor as Visao)}
            abas={[
              { valor: "turmas", rotulo: "Turmas", contador: grades.length },
              { valor: "professores", rotulo: "Professores", contador: naGrade.length },
            ]}
          />
        }
      />

      {visao === "professores" ? (
        <ListaProfessoresHorario execucaoId={execucao.id} professores={naGrade} />
      ) : (
        <>
          <FiltrosHorario turmas={turmas.filter((t) => grades.some((g) => g.turmaId === t.id))} filtros={filtros} aoMudar={setFiltros} />
          {filtradas.length === 0 ? (
            <EstadoVazio
              contorno
              titulo="Nenhuma turma encontrada"
              descricao="Nenhuma turma corresponde aos filtros escolhidos."
              acao={
                <Botao variante="secundario" onClick={() => setFiltros(filtrosVazios)}>
                  Limpar filtros
                </Botao>
              }
            />
          ) : (
            <ul className={estilos.grade} aria-label="Turmas">
              {filtradas.map(({ grade, turma, travadas }) => (
                <CartaoTurmaHorario
                  key={grade.turmaId}
                  execucaoId={execucao.id}
                  grade={grade}
                  turma={turma}
                  aulasPorBloco={execucao.aulasPorBloco}
                  travadas={travadas}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
