export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab";

export type Turno = "manha" | "tarde" | "noite";

/**
 * Dias letivos e quantidade de blocos ordinais do turno (RN-10, RN-35). O bloco i reúne as aulas
 * ((i−1)·K+1) até i·K, onde K é a quantidade global de aulas por bloco. Não há horário de relógio.
 */
export type EstruturaTurno = {
  turno: Turno;
  dias: DiaSemana[];
  blocos: number;
};

export type Semestre = {
  id: string;
  numero: number; // 1 a 8
  turmaIds: string[];
};

/** RN-04, RN-05: identificador único no semestre e turno obrigatório. */
export type Turma = {
  id: string;
  nome: string; // "A", "B"...
  semestre: number;
  turno: Turno;
};

/**
 * RN-06, RN-07: carga semanal em aulas (múltipla de K) e vínculo com o semestre; a demanda vale para
 * cada turma ativa do semestre. Uma turma–disciplina tem um único responsável (RN-19).
 */
export type Disciplina = {
  id: string;
  nome: string;
  semestre: number;
  aulasPorSemana: number;
  /** 1–8: força a cor na grade; sem valor, a cor é derivada do id. */
  cor?: number;
};

/** Tudo o que o administrador cadastra na aba Dados (RN-01). */
export type DadosAcademicos = {
  /** K: quantidade global de aulas por bloco, igual em todos os turnos e dias (RN-09). */
  aulasPorBloco: number;
  estruturas: EstruturaTurno[];
  semestres: Semestre[];
  turmas: Turma[];
  disciplinas: Disciplina[];
};
