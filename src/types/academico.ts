export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab";

export type Turno = "manha" | "tarde" | "noite";

/** Uma aula dentro de um bloco. `posicao` é contínua no turno (1, 2, 3...). */
export type HorarioAula = {
  posicao: number;
  inicio?: string; // "07:30"
  fim?: string; // "08:20"
};

/** Aulas seguidas; entre um bloco e o próximo existe um intervalo (RF 7.2, RF 7.3). */
export type BlocoAula = {
  aulas: HorarioAula[];
};

/** Dias e blocos de um turno, definidos pelo administrador (RF 7.1–7.3). */
export type EstruturaTurno = {
  turno: Turno;
  dias: DiaSemana[];
  blocos: BlocoAula[];
};

export type Semestre = {
  id: string;
  numero: number; // 1 a 8
  turmaIds: string[];
};

export type Turma = {
  id: string;
  nome: string; // "A", "B"...
  semestre: number;
  turno: Turno;
};

/** RF 7.6: nome, aulas por semana, semestre, quantidade de professores e turno. */
export type Disciplina = {
  id: string;
  nome: string;
  semestre: number;
  aulasPorSemana: number;
  quantidadeProfessores: number;
  turno: Turno;
  /** 1–8: força a cor na grade; sem valor, a cor é derivada do id. */
  cor?: number;
};

/** Tudo o que o administrador cadastra na aba Dados (RF 7). */
export type DadosAcademicos = {
  estruturas: EstruturaTurno[];
  semestres: Semestre[];
  turmas: Turma[];
  disciplinas: Disciplina[];
};
