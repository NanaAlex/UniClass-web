import type { DiaSemana, Disciplina, Turma, Turno } from "./academico";
import type { ProfessorResumo } from "./usuario";

export type Aula = {
  id: string;
  dia: DiaSemana;
  turno: Turno;
  posicao: number;
  disciplina: Disciplina;
  turma: Turma;
  professor?: ProfessorResumo; // ausente = aula sem professor alocado (RF 4.3)
  /** Bloqueada pelo administrador: mantida na próxima geração (RF 3.14, RF 3.15). */
  bloqueada: boolean;
};

export type TipoConflito = "sem_professor" | "indisponibilidade" | "carga_excedida";

/** Problema encontrado na geração da grade (RF 3.10, RF 4.3, RF 4.5). */
export type Conflito = {
  id: string;
  tipo: TipoConflito;
  descricao: string;
  disciplinaId?: string;
  professorId?: string;
};

/** previa: em análise pelo admin · definitiva: horário oficial (RF 3.18). */
export type StatusGrade = "previa" | "definitiva";

export type Grade = {
  id: string;
  turmaId: string;
  turno: Turno;
  versao: number; // histórico de versões (RF 3.19)
  status: StatusGrade;
  /** Prévia liberada para os professores verem (RF 8.11, RF 8.12). */
  visivelParaProfessores: boolean;
  /** Turma inteira bloqueada: a próxima geração mantém esta grade como está (RF 3.14, RF 3.15). */
  bloqueada: boolean;
  geradaEm: string; // ISO 8601
  /** Última edição manual do administrador (RF 3.3). */
  editadaEm?: string;
  aulas: Aula[];
  conflitos: Conflito[];
};

/** RF 3.17: resultado de uma nova geração. */
export type ResultadoGeracao = {
  grades: Grade[];
  /** Turmas que ganharam uma nova versão (as bloqueadas ficam de fora). */
  turmasAfetadas: string[];
};

/** Identifica um horário da grade: "manha:seg:1". */
export type ChaveHorario = `${Turno}:${DiaSemana}:${number}`;

/** O que o professor vê na aba Horário (RF 3.12, RF 3.16). */
export type HorarioProfessor = {
  aulas: Aula[];
  /** Alguma das grades exibidas ainda é prévia (pode mudar até virar definitiva). */
  previa: boolean;
  /** Data da grade mais recente exibida; null quando não há aulas. */
  atualizadoEm: string | null;
};
