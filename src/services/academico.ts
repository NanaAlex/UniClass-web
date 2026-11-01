import { disciplinas, estruturasTurno, semestres, turmas } from "@/mocks/academico";
import type { DadosAcademicos, Disciplina, EstruturaTurno, Semestre, Turma, Turno } from "@/types";
import { esperar, responder } from "./simulacao";

export function listarEstruturasTurno(): Promise<EstruturaTurno[]> {
  return responder(estruturasTurno);
}

export function listarSemestres(): Promise<Semestre[]> {
  return responder(semestres);
}

export function listarTurmas(filtro: { semestre?: number; turno?: Turno } = {}): Promise<Turma[]> {
  return responder(
    turmas.filter(
      (t) => (!filtro.semestre || t.semestre === filtro.semestre) && (!filtro.turno || t.turno === filtro.turno),
    ),
  );
}

/** RF 7.8: filtra por um ou mais semestres; lista vazia devolve todas. */
export function listarDisciplinas(filtro: { semestres?: number[] } = {}): Promise<Disciplina[]> {
  const selecionados = filtro.semestres ?? [];
  return responder(
    selecionados.length ? disciplinas.filter((d) => selecionados.includes(d.semestre)) : disciplinas,
  );
}

/** RF 7: dias, blocos, semestres, turmas e disciplinas do administrador. */
export function obterDadosAcademicos(): Promise<DadosAcademicos> {
  return responder({ estruturas: estruturasTurno, semestres, turmas, disciplinas });
}

/** Simula a gravação; sem back-end, quem guarda o estado é a tela. */
export async function salvarDadosAcademicos(dados: DadosAcademicos): Promise<DadosAcademicos> {
  await esperar(700);
  return structuredClone(dados);
}
