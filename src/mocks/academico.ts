import type { Disciplina, EstruturaTurno, Semestre, Turma } from "@/types";
import dadosDemo from "./demo/dadosDemo.json";

// Conjunto de demonstração único (mocks/demo/dadosDemo.json): o mesmo usado para gerar, com o
// motor Prolog real, a execução simulada de mocks/demo/execucaoDemo.json.

/** K global (RN-09). */
export const configuracao = { aulasPorBloco: dadosDemo.aulasPorBloco };

export const estruturasTurno: EstruturaTurno[] = dadosDemo.estruturas as EstruturaTurno[];

export const turmas: Turma[] = dadosDemo.turmas as Turma[];

export const semestres: Semestre[] = [1, 2, 3, 4, 5, 6].map((numero) => ({
  id: `s${numero}`,
  numero,
  turmaIds: turmas.filter((t) => t.semestre === numero).map((t) => t.id),
}));

export const disciplinas: Disciplina[] = dadosDemo.disciplinas;
