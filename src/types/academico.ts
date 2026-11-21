export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab";

export type Turno = "manha" | "tarde" | "noite";

/** Início da primeira aula (HH:MM) e duração de cada aula do bloco, em minutos. */
export type HorarioBloco = { horaInicio: string; duracaoAula: number };

/**
 * Dias letivos e quantidade de blocos ordinais do turno (RN-10, RN-35). O bloco i reúne as aulas
 * ((i−1)·K+1) até i·K, onde K é a quantidade global de aulas por bloco. O bloco é identificado só pelo
 * índice; o horário de relógio não entra no modelo de geração.
 */
export type EstruturaTurno = {
  turno: Turno;
  dias: DiaSemana[];
  /** Dias com resposta de formulário ou aula alocada: não podem ser removidos (vem do back). */
  diasEmUso?: DiaSemana[];
  blocos: number;
  /**
   * Horário de relógio de cada bloco (posição i−1 = bloco i; null = ainda sem horário). Só para o
   * cadastro: o back exige início e duração das aulas para gravar os blocos (PUT /admin/dados).
   */
  horarios?: (HorarioBloco | null)[];
  /**
   * Índices (1..B) dos blocos com resposta de formulário ou aula alocada: não podem sair nem mudar de
   * horário (vem do back: emUso de cada bloco, cuja ordem é o índice).
   */
  blocosEmUso?: number[];
};

export type Semestre = {
  id: string;
  numero: number; // 1 a 8
  /** Tem formulário, geração de horário, turma ou disciplina em uso: o back recusa a exclusão (vem do back). */
  exclusaoBloqueada?: boolean;
  turmaIds: string[];
};

/** RN-04, RN-05: identificador único no semestre e turno obrigatório. */
export type Turma = {
  id: string;
  nome: string; // "A", "B"...
  semestre: number;
  turno: Turno;
  /** Tem horário gerado: não pode ser excluída (vem do back). */
  emUso?: boolean;
};

/**
 * RN-06, RN-07: carga semanal em aulas (múltipla de K) e vínculo com o semestre; a demanda vale para
 * cada turma ativa do semestre. Uma turma–disciplina tem um único responsável (RN-19). A disciplina não
 * tem turno (migration 003): o turno é da turma.
 */
export type Disciplina = {
  id: string;
  nome: string;
  semestre: number;
  aulasPorSemana: number;
  /**
   * Quantidade de professores gravada no back (materia.qtd_professores, obrigatória no contrato da aba
   * Dados). A geração usa um único responsável por turma–disciplina (RN-19).
   */
  quantidadeProfessores?: number;
  /** 1–8: força a cor na grade; sem valor, a cor é derivada do id. */
  cor?: number;
  /** Escolhida em resposta, alocada ou com pendência de geração: não pode ser excluída (vem do back). */
  emUso?: boolean;
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
