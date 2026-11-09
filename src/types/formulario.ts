import type { DiaSemana, EstruturaTurno, Turno } from "./academico";
import type { ChaveBloco } from "./horario";

/** rascunho: em criação · aberto: recebendo respostas · encerrado: manual ou por data. */
export type StatusFormulario = "rascunho" | "aberto" | "encerrado";

export type Formulario = {
  id: string;
  nome: string; // "Disponibilidade 2027.1"
  periodoLetivo: string; // "2027.1"
  /** Edição do formulário: uma alteração estrutural encerra a edição e exige outra (RN-38). */
  edicao: number;
  status: StatusFormulario;
  inicio: string; // ISO 8601
  fim: string; // ISO 8601
  /** K e blocos de cada turno que o professor verá (RN-09, RN-10). */
  aulasPorBloco: number;
  estruturas: EstruturaTurno[];
  disciplinaIds: string[];
};

/** Nota de 1 (menor prioridade) a 5 (maior). Nota 1 continua permitindo a alocação (RN-18). */
export type NivelInteresse = 1 | 2 | 3 | 4 | 5;

export type InteresseDisciplina = {
  disciplinaId: string;
  nivel: NivelInteresse;
};

/** Um dia de um turno, ex.: "manha:seg". */
export type ChavePeriodo = `${Turno}:${DiaSemana}`;

export type RespostaFormulario = {
  id: string;
  formularioId: string;
  professorId: string;
  enviadaEm: string; // ISO 8601
  /** Blocos selecionados um a um; os demais ficam proibidos (RN-16). */
  disponibilidade: ChaveBloco[];
  /** Disciplinas selecionadas, cada uma com nota obrigatória (RN-15, RN-22). */
  interesses: InteresseDisciplina[];
  /** Uma nota por dia/turno com ao menos um bloco selecionado (RN-17). */
  prioridadesPeriodo: Partial<Record<ChavePeriodo, NivelInteresse>>;
  /** Reaberta após o admin aceitar uma solicitação. */
  edicaoLiberada: boolean;
};
