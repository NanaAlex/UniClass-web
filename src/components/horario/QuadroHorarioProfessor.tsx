"use client";

import { useState, type ReactNode } from "react";
import { Abas } from "@/components/ui/Abas";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { formatarData } from "@/lib/formatacao";
import { rotulosTurno, turnosDasAulas } from "@/lib/horario";
import type { Aula, EstruturaTurno, HorarioProfessor, Turno } from "@/types";
import { GradeHorario } from "./GradeHorario";
import estilos from "./QuadroHorarioProfessor.module.css";

type QuadroHorarioProfessorProps = {
  nomeProfessor: string;
  horario: HorarioProfessor;
  estruturas: EstruturaTurno[];
  /** Modo de pedido de alteração: a grade vira seleção de aula. Sem `aoIniciarSelecao`, a grade é só leitura (admin). */
  selecionando?: boolean;
  aulaSelecionada?: Aula | null;
  aoIniciarSelecao?: () => void;
  aoCancelar?: () => void;
  aoSelecionar?: (aula: Aula) => void;
  /** Formulário do pedido, exibido abaixo da grade durante a seleção. */
  children?: ReactNode;
};

/** RF 3.12, RF 3.16: grade com as aulas do professor e a entrada do pedido de alteração (RF 3.4). */
export function QuadroHorarioProfessor({
  nomeProfessor,
  horario,
  estruturas,
  selecionando = false,
  aulaSelecionada,
  aoIniciarSelecao,
  aoCancelar,
  aoSelecionar,
  children,
}: QuadroHorarioProfessorProps) {
  const turnos = turnosDasAulas(horario.aulas);
  const [turnoEscolhido, setTurnoEscolhido] = useState<Turno>(turnos[0]);
  const turno = turnos.includes(turnoEscolhido) ? turnoEscolhido : turnos[0];
  const estrutura = estruturas.find((e) => e.turno === turno);
  const aulasDoTurno = horario.aulas.filter((a) => a.turno === turno);

  return (
    <section className={estilos.quadro} aria-labelledby="titulo-horario">
      <header className={estilos.cabecalho}>
        <div className={estilos.textos}>
          <h2 id="titulo-horario" className={estilos.titulo}>
            Horário de {nomeProfessor}
          </h2>
          <p className={estilos.meta}>
            <Etiqueta variante={horario.previa ? "aviso" : "sucesso"} ponto>
              {horario.previa ? "Prévia" : "Definitivo"}
            </Etiqueta>
            {horario.atualizadoEm && (
              <span>
                Atualizado em <time dateTime={horario.atualizadoEm}>{formatarData(horario.atualizadoEm)}</time>
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

      {horario.previa && !selecionando && (
        <Aviso
          tipo="info"
          embutido
          titulo="Este horário ainda é uma prévia"
          descricao="A coordenação pode ajustá-lo até defini-lo como definitivo."
        />
      )}

      {selecionando && (
        <Aviso
          tipo="info"
          embutido
          titulo="Selecione a aula que deseja alterar"
          descricao="Clique em uma aula da grade e, em seguida, descreva o que precisa mudar."
        />
      )}

      {turnos.length > 1 && (
        <Abas
          variante="pilula"
          rotuloAcessivel="Turno"
          valor={turno}
          aoMudar={(valor) => setTurnoEscolhido(valor as Turno)}
          abas={turnos.map((t) => ({
            valor: t,
            rotulo: rotulosTurno[t],
            contador: horario.aulas.filter((a) => a.turno === t).length,
          }))}
        />
      )}

      {estrutura && (
        <GradeHorario
          estrutura={estrutura}
          aulas={aulasDoTurno}
          modo={selecionando ? "selecionar" : "visualizar"}
          infoSecundaria="turma"
          idAulaSelecionada={aulaSelecionada?.id}
          aoSelecionar={aoSelecionar}
          rotuloAcessivel={`Horário de ${nomeProfessor}, turno da ${rotulosTurno[turno].toLowerCase()}`}
        />
      )}

      {selecionando && <div className={estilos.pedido}>{children}</div>}
    </section>
  );
}
