"use client";

import type { ReactNode } from "react";
import { GradeDisponibilidade } from "@/components/compartilhados/GradeDisponibilidade";
import { notasPendentes, type InteresseRascunho } from "@/lib/formulario";
import type { ChaveBloco, Disciplina, Formulario, RespostaFormulario } from "@/types";
import { ListaInteresseDisciplinas } from "./ListaInteresseDisciplinas";
import { TabelaPrioridadePeriodo } from "./TabelaPrioridadePeriodo";
import estilos from "./AssistenteFormulario.module.css";

type Etapa = {
  titulo: string;
  descricao: string;
  /** Mensagem de erro que impede avançar, ou undefined quando a etapa está completa. */
  validar?: (dados: { disponibilidade: ChaveBloco[]; prioridades: RespostaFormulario["prioridadesPeriodo"]; interesses: InteresseRascunho[] }) => string | undefined;
};

/** Mesmo fluxo do protótipo: o que o professor pode/quer lecionar e, depois, as prioridades. */
export const etapas: Etapa[] = [
  {
    titulo: "Disponibilidade e matérias",
    descricao: "Selecione, bloco a bloco, quando você pode dar aula e escolha as matérias que gostaria de lecionar.",
    validar: ({ disponibilidade, interesses }) => {
      if (disponibilidade.length === 0) return "Selecione pelo menos um bloco disponível para continuar.";
      if (interesses.length === 0) return "Selecione pelo menos uma matéria para continuar.";
      return undefined;
    },
  },
  {
    titulo: "Prioridades",
    descricao: "Dê uma nota de 1 a 5 a cada dia/turno em que selecionou blocos e a cada matéria escolhida. 1 é a menor e 5 a maior. Não há nota pré-preenchida.",
    validar: ({ disponibilidade, prioridades, interesses }) => {
      const faltam = notasPendentes(disponibilidade, prioridades, interesses);
      if (faltam.periodos > 0) return `Falta a nota de ${faltam.periodos === 1 ? "1 dia/turno" : `${faltam.periodos} dias/turnos`}.`;
      if (faltam.disciplinas > 0) return `Falta a nota de ${faltam.disciplinas === 1 ? "1 matéria" : `${faltam.disciplinas} matérias`}.`;
      return undefined;
    },
  },
];

type ConteudoEtapaProps = {
  etapa: number;
  formulario: Formulario;
  disciplinas: Disciplina[];
  disponibilidade: ChaveBloco[];
  aoMudarDisponibilidade: (valor: ChaveBloco[]) => void;
  prioridades: RespostaFormulario["prioridadesPeriodo"];
  aoMudarPrioridades: (valor: RespostaFormulario["prioridadesPeriodo"]) => void;
  interesses: InteresseRascunho[];
  aoMudarInteresses: (valor: InteresseRascunho[]) => void;
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
        <Subsecao
          id="sub-disponibilidade"
          titulo="Blocos disponíveis"
          descricao={`Escolha o turno e marque cada bloco (${formulario.aulasPorBloco} aulas seguidas) em que você pode lecionar. Os demais ficam proibidos.`}
        >
          <GradeDisponibilidade estruturas={formulario.estruturas} aulasPorBloco={formulario.aulasPorBloco} valor={disponibilidade} aoMudar={aoMudarDisponibilidade} />
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
        descricao="Uma nota obrigatória para cada dia e turno em que você selecionou pelo menos um bloco."
      >
        <TabelaPrioridadePeriodo
          estruturas={formulario.estruturas}
          disponibilidade={disponibilidade}
          valor={prioridades}
          aoMudar={aoMudarPrioridades}
        />
      </Subsecao>
      <Subsecao id="sub-interesse" titulo="Prioridade por matéria" descricao="Nota obrigatória para cada matéria escolhida: quanto você gostaria de lecioná-la.">
        <ListaInteresseDisciplinas disciplinas={disciplinas} valor={interesses} aoMudar={aoMudarInteresses} modo="prioridade" />
      </Subsecao>
    </>
  );
}
