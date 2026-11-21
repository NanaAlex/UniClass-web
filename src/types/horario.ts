import type { DiaSemana, Turno } from "./academico";

/** Bloco ordinal "manha:seg:1" (turno, dia, índice) — RN-10, RN-35. */
export type ChaveBloco = `${Turno}:${DiaSemana}:${number}`;

export type Coordenada = {
  dia: DiaSemana;
  turno: Turno;
  indice: number;
};

/**
 * Posição da grade: o bloco inteiro, com suas K aulas consecutivas (RN-11, RN-57, ET-11).
 * Vaga: disciplina e professor nulos. Não existe entidade de aula isolada.
 */
export type BlocoGrade = Coordenada & {
  /** Números das K aulas do bloco no turno, ex.: [3, 4]. */
  aulas: number[];
  turmaId: string | null;
  disciplinaId: string | null;
  professorId: string | null;
  /** Travas que incidem sobre a posição. */
  travas: string[];
};

export type GradeTurma = {
  turmaId: string;
  semestre: number;
  turno: Turno;
  posicoes: BlocoGrade[];
};

/** Projeção da mesma grade canônica por professor: todas as coordenadas, ocupadas ou vagas (RN-69). */
export type GradeProfessor = {
  professorId: string;
  posicoes: BlocoGrade[];
};

/** Seis estados finais (RN-27). EM_PROCESSAMENTO é só estado de interface (ET-12). */
export type StatusFinal =
  | "OTIMA_COMPROVADA"
  | "VALIDA_NAO_OTIMA"
  | "INVIAVEL_COMPROVADA"
  | "INCONCLUSIVA"
  | "ENTRADA_INVALIDA"
  | "ERRO_EXECUCAO";

export type StatusExecucao = StatusFinal | "EM_PROCESSAMENTO";

export type NaturezaEvidencia = "comprovada" | "hipotese_preliminar" | "falha_tecnica";

/** Diagnóstico de uma execução (RN-60, ET-12, CA-166). */
export type Diagnostico = {
  codigo: string;
  categoria: string;
  severidade: "erro" | "aviso" | "info";
  etapa: string;
  mensagem: string;
  natureza: NaturezaEvidencia;
  entidades: Record<string, unknown>;
};

/** Nível da hierarquia de otimização com o estado da prova (RN-32, CA-73). */
export type ProvaNivel = {
  nivel: 1 | 2 | 3 | 4;
  objetivo: string;
  comprovado: boolean;
  estado: string;
};

export type Justificativa = {
  titulo: string;
  texto: string;
  niveisComprovados: number[];
  niveisNaoComprovados: number[];
};

/**
 * Indicadores da tela de geração (RN-59, ET-12). Sem grade completa validada, as métricas de
 * grade e penalidade ficam nulas: aparecem como indisponíveis, nunca como êxito (CA-158).
 */
export type PainelGeracao = {
  totalTurmas: number | null;
  turmasComGradeValidada: number | null;
  professoresComAulas: number | null;
  participantes: number | null;
  professoresAtivos: number | null;
  respostasEnviadas: number | null;
  pendentes: number | null;
  geracaoAntecipadaConfirmada: boolean;
  custoTotal: number | null;
  parcelas: { diaTurno: number; disciplina: number } | null;
  piorMedia: string | null;
  amplitude: string | null;
  duracaoSegundos: number | null;
  tempoPrimeiraGradeSegundos: number | null;
  limiteSegundos: number | null;
  motivoTermino: string | null;
  provas: ProvaNivel[] | null;
  justificativa: Justificativa | null;
  diagnosticos: Diagnostico[];
  publicavel: boolean;
};

export type TipoTrava = "ocupacao" | "vaga_turma" | "vaga_professor" | "fixacao_disciplina_professor";

/** Restrição rígida para a próxima geração, válida só no período letivo (RN-41 a RN-45, RN-50). */
export type Trava = {
  id: string;
  tipo: TipoTrava;
  turmaId?: string;
  professorId?: string;
  semestre?: number;
  disciplinaId?: string;
  coordenada?: Coordenada;
  /** Execução usada como grade-base da edição (RN-40, RN-49). */
  origemExecucaoId: string;
  /** Ação que gerou a trava. */
  acao: AcaoEdicao["acao"];
  criadaEm: string;
};

/** Ações fixas de edição (RN-01, ET-08). Não há ação de desbloqueio (seção 8). */
export type AcaoEdicao =
  | { acao: "bloquear_grade_turma"; turmaId: string }
  | { acao: "bloquear_grade_professor"; professorId: string }
  | { acao: "bloquear_bloco_turma"; turmaId: string; coordenada: Coordenada }
  | { acao: "bloquear_bloco_professor"; professorId: string; coordenada: Coordenada }
  | { acao: "fixar_disciplina_professor_semestre"; semestre: number; disciplinaId: string; professorId: string }
  | { acao: "trocar_posicoes"; origem: Coordenada & { turmaId: string }; destino: Coordenada & { turmaId: string } };

/** Uma geração do horário (ET-01): snapshot, status, painel e a grade canônica validada. */
export type Execucao = {
  id: string;
  periodoLetivo: string;
  status: StatusExecucao;
  iniciadaEm: string;
  concluidaEm: string | null;
  publicadaEm: string | null;
  /** Grade-base das travas aplicadas nesta geração (RN-40, CA-189). */
  gradeBaseId: string | null;
  /** Gerada pela simulação do front, sem o motor Prolog. */
  simulada: boolean;
  aulasPorBloco: number;
  painel: PainelGeracao;
  /** Só existe quando a grade completa foi validada (RN-28). */
  grade: { porTurma: GradeTurma[]; porProfessor: GradeProfessor[] } | null;
  travasAplicadas: Trava[];
};

/** O que o professor vê na aba Horário: a grade publicada (vigente), por blocos. */
export type HorarioProfessor = {
  posicoes: BlocoGrade[];
  publicadoEm: string | null;
  aulasPorBloco: number;
};
