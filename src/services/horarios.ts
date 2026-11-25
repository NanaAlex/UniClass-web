import { disciplinas, estruturasTurno, turmas } from "@/mocks/academico";
import { formularioAtual } from "@/mocks/formularios";
import { grades, professorDaDisciplina } from "@/mocks/grades";
import { escalonarTurma, registrarOcupacao, type Ocupacao } from "@/lib/escalonador";
import { situacaoDaGestao } from "@/lib/gestaoFormulario";
import { maisRecentes } from "@/lib/gestaoHorario";
import type { Aula, Grade, HorarioProfessor, ResultadoGeracao, Turno } from "@/types";
import { ErroNaoEncontrado, esperar, responder } from "./simulacao";

/** RF 3.11: grade mais recente de uma turma no turno (null = prévia indisponível, RF 3.13). */
export function obterGradeDaTurma(turmaId: string, turno: Turno): Promise<Grade | null> {
  const daTurma = grades.filter((g) => g.turmaId === turmaId && g.turno === turno);
  const maisRecente = daTurma.sort((a, b) => b.versao - a.versao)[0] ?? null;
  return responder(maisRecente);
}

/** Todas as grades, com o histórico de versões (RF 3.11, RF 3.19). */
export function listarGrades(): Promise<Grade[]> {
  return responder(grades);
}

export function obterGrade(id: string): Promise<Grade> {
  const grade = grades.find((g) => g.id === id);
  if (!grade) return Promise.reject(new ErroNaoEncontrado("Grade", id));
  return responder(grade);
}

/**
 * RF 3.12, RF 3.16: aulas do professor em todas as turmas.
 * Para o professor, prévias só aparecem se o admin liberou a visualização (RF 8.11).
 * O administrador vê a grade mais recente de cada turma, liberada ou não (RF 8.8).
 */
export function obterHorarioDoProfessor(
  professorId: string,
  visao: "professor" | "administrador" = "professor",
): Promise<HorarioProfessor> {
  const doProfessor = (aula: Aula) => aula.professor?.id === professorId;
  const liberadas = visao === "administrador" ? grades : grades.filter((g) => g.status === "definitiva" || g.visivelParaProfessores);
  const visiveis = maisRecentes(liberadas).filter((g) => g.aulas.some(doProfessor));
  return responder({
    aulas: visiveis.flatMap((g) => g.aulas).filter(doProfessor),
    previa: visiveis.some((g) => g.status === "previa"),
    atualizadoEm: visiveis.map((g) => g.geradaEm).sort().at(-1) ?? null,
  });
}

/**
 * RF 3.1, RF 3.15, RF 3.17: executa o escalonador. Turmas bloqueadas ficam como estão; nas demais,
 * as aulas bloqueadas são mantidas e o restante é refeito numa nova versão (prévia oculta).
 */
export async function gerarHorario(): Promise<ResultadoGeracao> {
  await esperar(1400);
  if (situacaoDaGestao(formularioAtual) !== "encerrado") {
    throw new Error("Encerre o formulário antes de gerar o horário.");
  }

  const atuais = maisRecentes(grades);
  const ocupacao: Ocupacao = new Set();
  atuais.forEach((g) => registrarOcupacao(ocupacao, g.bloqueada ? g.aulas : g.aulas.filter((a) => a.bloqueada)));

  const geradaEm = new Date().toISOString();
  const novas = turmas
    .filter((turma) => !atuais.some((g) => g.turmaId === turma.id && g.bloqueada))
    .map((turma): Grade => {
      const anterior = atuais.find((g) => g.turmaId === turma.id);
      const versao = (anterior?.versao ?? 0) + 1;
      const { aulas, conflitos } = escalonarTurma({
        turma,
        estrutura: estruturasTurno.find((e) => e.turno === turma.turno)!,
        disciplinas: disciplinas.filter((d) => d.semestre === turma.semestre),
        professorDe: professorDaDisciplina,
        ocupacao,
        versao,
        fixas: anterior?.aulas.filter((a) => a.bloqueada) ?? [],
      });
      return {
        id: `g-${turma.id}-v${versao}-${Date.now()}`,
        turmaId: turma.id,
        turno: turma.turno,
        versao,
        status: "previa",
        visivelParaProfessores: false,
        bloqueada: false,
        geradaEm,
        aulas,
        conflitos,
      };
    });

  grades.push(...novas);
  return responder({ grades, turmasAfetadas: novas.map((g) => g.turmaId) }, 0);
}

/** RF 3.18: as prévias atuais viram o horário oficial, visível para os professores. */
export async function oficializarHorario(): Promise<Grade[]> {
  for (const grade of maisRecentes(grades)) {
    grade.status = "definitiva";
    grade.visivelParaProfessores = true;
  }
  return responder(grades, 700);
}

/** RF 8.11, RF 8.12: mostra ou oculta as prévias atuais para os professores. */
export async function alterarVisibilidadeHorario(visivel: boolean): Promise<Grade[]> {
  for (const grade of maisRecentes(grades)) if (grade.status === "previa") grade.visivelParaProfessores = visivel;
  return responder(grades, 400);
}

function encontrar(id: string) {
  const grade = grades.find((g) => g.id === id);
  if (!grade) throw new ErroNaoEncontrado("Grade", id);
  return grade;
}

/** RF 3.14: bloqueia a turma inteira para a próxima geração. */
export async function alterarBloqueioGrade(gradeId: string, bloqueada: boolean): Promise<Grade> {
  const grade = encontrar(gradeId);
  grade.bloqueada = bloqueada;
  return responder(grade, 300);
}

/** RF 3.3, RF 3.14: grava a edição manual (posições e bloqueios das aulas). */
export async function salvarEdicaoGrade(gradeId: string, aulas: Aula[]): Promise<Grade> {
  const grade = encontrar(gradeId);
  grade.aulas = structuredClone(aulas);
  grade.editadaEm = new Date().toISOString();
  return responder(grade, 600);
}
