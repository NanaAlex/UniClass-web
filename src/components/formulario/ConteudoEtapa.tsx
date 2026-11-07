"use client";

import type { ReactNode } from "react";
import { GradeDisponibilidade } from "@/components/compartilhados/GradeDisponibilidade";
import type { ChaveHorario, Disciplina, Formulario, InteresseDisciplina, RespostaFormulario } from "@/types";
import { ListaInteresseDisciplinas } from "./ListaInteresseDisciplinas";
import { TabelaPrioridadePeriodo } from "./TabelaPrioridadePeriodo";
import estilos from "./AssistenteFormulario.module.css";

type Etapa = {
  titulo: string;
  descricao: string;
  /** Mensagem de erro que impede avançar, ou undefined quando a etapa está completa. */
  validar?: (dados: { disponibilidade: ChaveHorario[]; interesses: InteresseDisciplina[] }) => string | undefined;
};

/** Mesmo fluxo do protótipo: o que o professor pode/quer lecionar e, depois, as prioridades. */
export const etapas: Etapa[] = [
  {
    titulo: "Disponibilidade e matérias",
    descricao: "Marque os dias e horários em que você pode dar aula e escolha as matérias que gostaria de lecionar.",
    validar: ({ disponibilidade, interesses }) => {
      if (disponibilidade.length === 0) return "Marque pelo menos um horário disponível para continuar.";
      if (interesses.length === 0) return "Selecione pelo menos uma matéria para continuar.";
      return undefined;
    },
  },
  {
    titulo: "Prioridades",
    descricao: "Indique sua preferência por período e o seu interesse em cada matéria escolhida. 1 é a menor e 5 a maior.",
  },
];

type ConteudoEtapaProps = {
  etapa: number;
  formulario: Formulario;
  disciplinas: Disciplina[];
  disponibilidade: ChaveHorario[];
  aoMudarDisponibilidade: (valor: ChaveHorario[]) => void;
  prioridades: RespostaFormulario["prioridadesPeriodo"];
  aoMudarPrioridades: (valor: RespostaFormulario["prioridadesPeriodo"]) => void;
  interesses: InteresseDisciplina[];
  aoMudarInteresses: (valor: InteresseDisciplina[]) => void;
};

function Subsecao({ id, titulo, descricao, children }: { id: string; titulo: string; descricao: string; children: ReactNode }) {
  return (
    <section className={estilos.subsecao} aria-labelledby={id}>
      <header>
        <h3 id={id} className={estilos.tituloSubsecao}>
          {titulo}
        </h3>
        <p className={estilos.descricaoSubsecao}>{descricao}</p>
      </header>
      {children}
    </section>
  );
}

export function ConteudoEtapa({
  etapa,
  formulario,
  disciplinas,
  disponibilidade,
  aoMudarDisponibilidade,
  prioridades,
  aoMudarPrioridades,
  interesses,
  aoMudarInteresses,
}: ConteudoEtapaProps) {
  if (etapa === 0) {
    return (
      <>
        <Subsecao id="sub-disponibilidade" titulo="Dias e horários disponíveis" descricao="Escolha o turno e marque cada aula em que você pode lecionar.">
          <GradeDisponibilidade estruturas={formulario.estruturas} valor={disponibilidade} aoMudar={aoMudarDisponibilidade} />
        </Subsecao>
        <Subsecao id="sub-materias" titulo="Matérias que gostaria de lecionar" descricao="Filtre por semestre ou busque pelo nome.">
          <ListaInteresseDisciplinas disciplinas={disciplinas} valor={interesses} aoMudar={aoMudarInteresses} />
        </Subsecao>
      </>
    );
  }

  return (
    <>
      <Subsecao
        id="sub-periodos"
        titulo="Prioridade por período"
        descricao="Só aparecem os períodos em que você marcou disponibilidade."
      >
        <TabelaPrioridadePeriodo
          estruturas={formulario.estruturas}
          disponibilidade={disponibilidade}
          valor={prioridades}
          aoMudar={aoMudarPrioridades}
        />
      </Subsecao>
      <Subsecao id="sub-interesse" titulo="Prioridade por matéria" descricao="Quanto você gostaria de lecionar cada matéria escolhida.">
        <ListaInteresseDisciplinas disciplinas={disciplinas} valor={interesses} aoMudar={aoMudarInteresses} modo="prioridade" />
      </Subsecao>
    </>
  );
}
