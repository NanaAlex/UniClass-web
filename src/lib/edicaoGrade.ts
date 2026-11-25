import type { Aula, DiaSemana, Grade } from "@/types";
import { rotuloAula, rotulosDia } from "./horario";

// Edição manual de uma prévia (RF 3.3) e bloqueio por aula (RF 3.14).

export type Horario = { dia: DiaSemana; posicao: number };

const noHorario = (aula: Aula, { dia, posicao }: Horario) => aula.dia === dia && aula.posicao === posicao;

/** Move a aula para o horário; se já houver outra aula lá, as duas trocam de lugar. */
export function moverAula(aulas: Aula[], idAula: string, destino: Horario): Aula[] {
  const origem = aulas.find((a) => a.id === idAula);
  if (!origem) return aulas;
  const ocupante = aulas.find((a) => noHorario(a, destino));
  return aulas.map((a) => {
    if (a.id === origem.id) return { ...a, ...destino };
    if (a.id === ocupante?.id) return { ...a, dia: origem.dia, posicao: origem.posicao };
    return a;
  });
}

export function alternarBloqueio(aulas: Aula[], idAula: string): Aula[] {
  return aulas.map((a) => (a.id === idAula ? { ...a, bloqueada: !a.bloqueada } : a));
}

/** Aulas que mudaram de lugar ou de bloqueio desde a última gravação. */
export function contarAlteracoes(original: Aula[], atual: Aula[]) {
  return atual.filter((a) => {
    const antes = original.find((o) => o.id === a.id);
    return !antes || antes.dia !== a.dia || antes.posicao !== a.posicao || antes.bloqueada !== a.bloqueada;
  }).length;
}

/**
 * RF 3.9: impede que a troca coloque um professor em duas turmas no mesmo horário.
 * `outrasGrades` = horário atual das demais turmas. Devolve o motivo, ou null se a troca é possível.
 */
export function motivoParaNaoMover(aulas: Aula[], idAula: string, destino: Horario, outrasGrades: Grade[]): string | null {
  const origem = aulas.find((a) => a.id === idAula);
  if (!origem) return null;
  const ocupante = aulas.find((a) => noHorario(a, destino));
  if (ocupante?.bloqueada) return "A aula desse horário está bloqueada. Desbloqueie-a para trocar.";

  const movimentos: [Aula | undefined, Horario][] = [
    [origem, destino],
    [ocupante, { dia: origem.dia, posicao: origem.posicao }],
  ];
  for (const [aula, horario] of movimentos) {
    if (!aula?.professor) continue;
    const choque = outrasGrades
      .flatMap((g) => g.aulas)
      .find((a) => a.turno === aula.turno && a.professor?.id === aula.professor?.id && noHorario(a, horario));
    if (choque) {
      return `${aula.professor.nome} já tem aula no ${choque.turma.semestre}º ${choque.turma.nome} nesse horário (${rotulosDia[horario.dia].longo}, ${rotuloAula(horario.posicao)}).`;
    }
  }
  return null;
}
