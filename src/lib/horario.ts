import type { ChaveBloco, Coordenada, DiaSemana, Disciplina, EstruturaTurno, Turma, Turno } from "@/types";

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

export const ordemDias: DiaSemana[] = ["seg", "ter", "qua", "qui", "sex", "sab"];
export const ordemTurnos: Turno[] = ["manha", "tarde", "noite"];

export const QUANTIDADE_CORES_DISCIPLINA = 8;

/** Cor estável (1–8) para a disciplina: a mesma matéria tem sempre a mesma cor. */
export function corDaDisciplina(disciplina: Pick<Disciplina, "id" | "cor">): number {
  if (disciplina.cor) return disciplina.cor;
  let hash = 0;
  for (const letra of disciplina.id) hash = (hash * 31 + letra.charCodeAt(0)) >>> 0;
  return (hash % QUANTIDADE_CORES_DISCIPLINA) + 1;
}

export function chaveBloco(turno: Turno, dia: DiaSemana, indice: number): ChaveBloco {
  return `${turno}:${dia}:${indice}`;
}

export function chaveDe(c: Coordenada): ChaveBloco {
  return chaveBloco(c.turno, c.dia, c.indice);
}

export function deChaveBloco(chave: ChaveBloco): Coordenada {
  const [turno, dia, indice] = chave.split(":");
  return { turno: turno as Turno, dia: dia as DiaSemana, indice: Number(indice) };
}

export const mesmaCoordenada = (a: Coordenada, b: Coordenada) => a.dia === b.dia && a.turno === b.turno && a.indice === b.indice;

/** Aulas ((i−1)·K+1)..(i·K) do bloco i (RN-10, CA-78). */
export function aulasDoBloco(K: number, indice: number): number[] {
  return Array.from({ length: K }, (_, i) => (indice - 1) * K + i + 1);
}

/** "Bloco 2 · aulas 3–4" (sem horário de relógio, RN-35). */
export function rotuloBloco(K: number, indice: number) {
  const aulas = aulasDoBloco(K, indice);
  return aulas.length === 1 ? `Bloco ${indice} · aula ${aulas[0]}` : `Bloco ${indice} · aulas ${aulas[0]}–${aulas[aulas.length - 1]}`;
}

/** "Segunda · Manhã · Bloco 1" */
export function rotuloCoordenada(c: Coordenada) {
  return `${rotulosDia[c.dia].longo} · ${rotulosTurno[c.turno]} · Bloco ${c.indice}`;
}

/** "2º A · Manhã" */
export function rotuloTurma(turma: Turma) {
  return `${turma.semestre}º ${turma.nome} · ${rotulosTurno[turma.turno]}`;
}

/** Todas as coordenadas de um turno, na ordem dia → índice. */
export function coordenadasDoTurno(estrutura: EstruturaTurno): Coordenada[] {
  return estrutura.dias.flatMap((dia) => Array.from({ length: estrutura.blocos }, (_, i) => ({ dia, turno: estrutura.turno, indice: i + 1 })));
}

export function blocosNecessarios(aulasPorSemana: number, K: number) {
  return aulasPorSemana / K;
}
