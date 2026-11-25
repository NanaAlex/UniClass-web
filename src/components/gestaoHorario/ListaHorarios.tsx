"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { Abas } from "@/components/ui/Abas";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { filtrarGrades, filtrosVazios, professoresNoHorario, type FiltrosHorario as Filtros } from "@/lib/gestaoHorario";
import type { Grade, Turma } from "@/types";
import { CartaoTurmaHorario } from "./CartaoTurmaHorario";
import { FiltrosHorario } from "./FiltrosHorario";
import { ListaProfessoresHorario } from "./ListaProfessoresHorario";
import estilos from "./GestaoHorario.module.css";

type ListaHorariosProps = {
  atuais: Grade[];
  turmas: Turma[];
  turmasAfetadas: string[];
  idAlternando: string | null;
  aoAlternarBloqueio: (grade: Grade) => void;
};

type Visao = "turmas" | "professores";

/** RF 3.11: o horário atual por turma (com filtros) ou por professor. */
export function ListaHorarios({ atuais, turmas, turmasAfetadas, idAlternando, aoAlternarBloqueio }: ListaHorariosProps) {
  const [visao, setVisao] = useState<Visao>("turmas");
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios);
  const filtradas = filtrarGrades(atuais, turmas, filtros);
  const professores = professoresNoHorario(atuais);

  return (
    <section className={estilos.secaoLista} aria-labelledby="titulo-horario-atual">
      <CabecalhoSecao
        id="titulo-horario-atual"
        titulo="Horário atual"
        acoes={
          <Abas
            rotuloAcessivel="Ver horário por"
            variante="pilula"
            valor={visao}
            aoMudar={(valor) => setVisao(valor as Visao)}
            abas={[
              { valor: "turmas", rotulo: "Turmas", contador: atuais.length },
              { valor: "professores", rotulo: "Professores", contador: professores.length },
            ]}
          />
        }
      />

      {visao === "professores" ? (
        <ListaProfessoresHorario professores={professores} />
      ) : (
        <>
          <FiltrosHorario turmas={turmas} filtros={filtros} aoMudar={setFiltros} />
          {filtradas.length === 0 ? (
            <EstadoVazio
              contorno
              titulo="Nenhuma turma encontrada"
              descricao="Nenhum horário corresponde aos filtros escolhidos."
              acao={
                <Botao variante="secundario" onClick={() => setFiltros(filtrosVazios)}>
                  Limpar filtros
                </Botao>
              }
            />
          ) : (
            <ul className={estilos.grade} aria-label="Turmas">
              {filtradas.map(({ grade, turma }) => (
                <CartaoTurmaHorario
                  key={grade.id}
                  grade={grade}
                  turma={turma}
                  novaVersao={turmasAfetadas.includes(turma.id)}
                  alternando={idAlternando === grade.id}
                  aoAlternarBloqueio={aoAlternarBloqueio}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
