import type { Aula, DiaSemana, Grade, ProfessorResumo } from "@/types";
import { escalonarTurma, registrarOcupacao, type Ocupacao } from "@/lib/escalonador";
import { disciplinas, estruturasTurno, turmas } from "./academico";
import { professores } from "./usuarios";

function resumo(id: string): ProfessorResumo {
  const { nome, fotoUrl } = professores.find((p) => p.id === id)!;
  return { id, nome, fotoUrl };
}

// Linha compacta: [dia, posição, disciplina, professor (vazio = sem professor), bloqueada]
type LinhaAula = [DiaSemana, number, string, string, boolean?];

function montarAulas(turmaId: string, linhas: LinhaAula[]): Aula[] {
  const turma = turmas.find((t) => t.id === turmaId)!;
  return linhas.map(([dia, posicao, disciplinaId, professorId, bloqueada = false]) => ({
    id: `${turmaId}-${dia}-${posicao}`,
    dia,
    turno: turma.turno,
    posicao,
    disciplina: disciplinas.find((d) => d.id === disciplinaId)!,
    turma,
    professor: professorId ? resumo(professorId) : undefined,
    bloqueada,
  }));
}

/** Quem o escalonador simulado aloca em cada disciplina. Sem entrada = sem professor interessado (RF 4.2). */
export const professorPorDisciplina: Record<string, string> = {
  alg: "p2", ed: "p2", poo: "p2",
  mat: "p1", est: "p1",
  web1: "p3", web2: "p3", ihc: "p3",
  ing1: "p4", ing2: "p4",
  fsi: "p5", es1: "p5", es2: "p5", qs: "p5",
  red: "p6", so: "p6", nuv: "p6",
  bd1: "p7", bd2: "p7", dados: "p7",
  arq: "p8", seg: "p8",
  mob: "p10", ia: "p10",
  gp: "p5", emp: "p9", tg: "p10",
  etica: "p9",
};

export const professorDaDisciplina = (disciplinaId: string) =>
  professorPorDisciplina[disciplinaId] ? resumo(professorPorDisciplina[disciplinaId]) : undefined;

/**
 * Aba Horários do administrador: as versões mais recentes de cada turma formam o horário atual.
 * 1º A (v3) e as demais turmas = prévia da geração de 22/10; 2º A = definitiva e bloqueada, por isso
 * foi mantida. Versões antigas ficam no histórico (RF 3.19). Para ver "nenhum horário gerado",
 * esvazie `grades` (a aba do professor também fica sem horário).
 *
 * Aba Horário do professor (João, p2): por padrão ele vê só a grade definitiva do 2º A.
 * `visivelParaProfessores: true` na g-t1a-v3 = prévia liberada (etiqueta "Prévia" + aulas do 1º A);
 * `status: "previa"` + `visivelParaProfessores: false` na g-t2a-v2 (com a g-t1a oculta) = horário indisponível (RF 3.13).
 */
export const grades: Grade[] = [
  {
    id: "g-t1a-v3",
    turmaId: "t1a",
    turno: "manha",
    versao: 3,
    status: "previa",
    visivelParaProfessores: false,
    bloqueada: false,
    geradaEm: "2026-10-22T13:40:00Z",
    aulas: montarAulas("t1a", [
      ["seg", 1, "mat", "p1", true], ["seg", 2, "mat", "p1", true], ["seg", 3, "alg", "p2"], ["seg", 4, "alg", "p2"],
      ["ter", 1, "ing1", "p4"], ["ter", 2, "ing1", "p4"], ["ter", 3, "fsi", "p5"], ["ter", 4, "fsi", "p5"],
      ["qua", 1, "arq", "p8", true], ["qua", 2, "arq", "p8", true], ["qua", 3, "alg", "p2"], ["qua", 4, "alg", "p2"],
      ["qui", 1, "com", ""], ["qui", 2, "com", ""], ["qui", 3, "arq", "p8"], ["qui", 4, "arq", "p8"],
      ["sex", 1, "mat", "p1"], ["sex", 2, "mat", "p1"],
    ]),
    conflitos: [
      {
        id: "c1",
        tipo: "sem_professor",
        descricao: "Comunicação e Expressão (1º A) ficou sem professor: Juliana Martins Ferreira ainda não respondeu o formulário.",
        disciplinaId: "com",
      },
    ],
  },
  {
    id: "g-t2a-v2",
    turmaId: "t2a",
    turno: "manha",
    versao: 2,
    status: "definitiva",
    visivelParaProfessores: true,
    bloqueada: true, // oficializada e bloqueada: a geração de 22/10 manteve esta grade
    geradaEm: "2026-10-12T17:15:00Z",
    aulas: montarAulas("t2a", [
      ["seg", 1, "bd1", "p7"], ["seg", 2, "bd1", "p7"], ["seg", 3, "est", "p1"], ["seg", 4, "est", "p1"],
      ["ter", 1, "web1", "p3", true], ["ter", 2, "web1", "p3", true], ["ter", 3, "ed", "p2"], ["ter", 4, "ed", "p2"],
      ["qua", 1, "es1", "p5"], ["qua", 2, "es1", "p5"], ["qua", 3, "bd1", "p7"], ["qua", 4, "bd1", "p7"],
      ["qui", 1, "ed", "p2"], ["qui", 2, "ed", "p2"], ["qui", 3, "web1", "p3"], ["qui", 4, "web1", "p3"],
      ["sex", 1, "es1", "p5"], ["sex", 2, "es1", "p5"],
    ]),
    conflitos: [
      {
        id: "c2",
        tipo: "indisponibilidade",
        descricao: "Estrutura de Dados não pôde ser alocada na sexta: João Pereira Lima marcou “Não posso” no período.",
        disciplinaId: "ed",
        professorId: "p2",
      },
    ],
  },
];

/** Gera uma grade com o escalonador simulado (demais turmas e versões antigas). */
function gerarGrade(turmaId: string, versao: number, ocupacao: Ocupacao, extras: Partial<Grade>): Grade {
  const turma = turmas.find((t) => t.id === turmaId)!;
  const { aulas, conflitos } = escalonarTurma({
    turma,
    estrutura: estruturasTurno.find((e) => e.turno === turma.turno)!,
    disciplinas: disciplinas.filter((d) => d.semestre === turma.semestre),
    professorDe: professorDaDisciplina,
    ocupacao,
    versao,
  });
  return {
    id: `g-${turmaId}-v${versao}`,
    turmaId,
    turno: turma.turno,
    versao,
    status: "previa",
    visivelParaProfessores: false,
    bloqueada: false,
    geradaEm: "2026-10-22T13:40:00Z",
    aulas,
    conflitos,
    ...extras,
  };
}

const ocupacaoAtual: Ocupacao = new Set();
grades.forEach((grade) => registrarOcupacao(ocupacaoAtual, grade.aulas));

grades.push(
  gerarGrade("t1b", 1, ocupacaoAtual, {}),
  gerarGrade("t2b", 1, ocupacaoAtual, {}),
  gerarGrade("t3a", 1, ocupacaoAtual, { editadaEm: "2026-10-23T10:05:00Z" }),
  gerarGrade("t4a", 1, ocupacaoAtual, {}),
  gerarGrade("t5a", 1, ocupacaoAtual, { bloqueada: true }),
  gerarGrade("t6a", 1, ocupacaoAtual, {}),
  // Histórico (RF 3.19): versões anteriores, substituídas pelas atuais
  gerarGrade("t1a", 1, new Set(), { geradaEm: "2026-09-30T14:00:00Z" }),
  gerarGrade("t1a", 2, new Set(), { geradaEm: "2026-10-12T17:15:00Z" }),
  gerarGrade("t2a", 1, new Set(), { geradaEm: "2026-09-30T14:00:00Z" }),
);
