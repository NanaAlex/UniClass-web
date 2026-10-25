import type { DiaSemana, EstruturaTurno, Turno } from "./academico";
import type { ChaveHorario } from "./horario";

/** rascunho: em criação · aberto: recebendo respostas · encerrado: manual ou por data (RF 2.7, RF 2.8). */
export type StatusFormulario = "rascunho" | "aberto" | "encerrado";

export type Formulario = {
  id: string;
  nome: string; // "Disponibilidade 2027.1"
  periodoLetivo: string; // "2027.1"
  status: StatusFormulario;
  inicio: string; // ISO 8601
  fim: string; // ISO 8601
  /** Dias, turnos e blocos que o professor verá no formulário (RF 2.3). */
  estruturas: EstruturaTurno[];
  /** Apenas disciplinas cadastradas para os semestres do formulário (RF 2.5). */
  disciplinaIds: string[];
};

/** Interesse em lecionar, de 1 (baixo) a 5 (alto) — RF 2.6. */
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
  enviadaEm: string; // ISO 8601 — RF 2.10
  disponibilidade: ChaveHorario[]; // RF 2.2
  interesses: InteresseDisciplina[]; // RF 2.4, RF 2.6
  /** Preferência por período (1 baixa a 5 alta), apenas nos períodos com disponibilidade. */
  prioridadesPeriodo: Partial<Record<ChavePeriodo, NivelInteresse>>;
  /** Reaberta após o admin aceitar uma solicitação (RF 2.18). */
  edicaoLiberada: boolean;
};
