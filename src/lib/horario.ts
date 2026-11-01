import type { Aula, ChaveHorario, DiaSemana, Disciplina, Turma, Turno } from "@/types";

export const rotulosDia: Record<DiaSemana, { curto: string; longo: string }> = {
  seg: { curto: "Seg", longo: "Segunda" },
  ter: { curto: "Ter", longo: "Terça" },
  qua: { curto: "Qua", longo: "Quarta" },
  qui: { curto: "Qui", longo: "Quinta" },
  sex: { curto: "Sex", longo: "Sexta" },
  sab: { curto: "Sáb", longo: "Sábado" },
};

export const rotulosTurno: Record<Turno, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export const QUANTIDADE_CORES_DISCIPLINA = 8;

/** Cor estável (1–8) para a disciplina: a mesma matéria tem sempre a mesma cor. */
export function corDaDisciplina(disciplina: Disciplina): number {
  if (disciplina.cor) return disciplina.cor;
  let hash = 0;
  for (const letra of disciplina.id) hash = (hash * 31 + letra.charCodeAt(0)) >>> 0;
  return (hash % QUANTIDADE_CORES_DISCIPLINA) + 1;
}

export function chaveHorario(turno: Turno, dia: DiaSemana, posicao: number): ChaveHorario {
  return `${turno}:${dia}:${posicao}`;
}

export function rotuloAula(posicao: number) {
  return `${posicao}ª aula`;
}

/** "2º A · Manhã" */
export function rotuloTurma(turma: Turma) {
  return `${turma.semestre}º ${turma.nome} · ${rotulosTurno[turma.turno]}`;
}

const ordemTurnos: Turno[] = ["manha", "tarde", "noite"];

/** Turnos em que há aulas, na ordem do dia. */
export function turnosDasAulas(aulas: Aula[]): Turno[] {
  return ordemTurnos.filter((turno) => aulas.some((aula) => aula.turno === turno));
}
