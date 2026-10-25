import type { Aula, Conflito, Disciplina, EstruturaTurno, ProfessorResumo, Turma } from "@/types";
import { rotuloTurma } from "./horario";

/** Horários já ocupados de cada professor, em todas as turmas: "p2:manha:seg:1". */
export type Ocupacao = Set<string>;

export function chaveOcupacao(professorId: string, aula: Pick<Aula, "turno" | "dia" | "posicao">) {
  return `${professorId}:${aula.turno}:${aula.dia}:${aula.posicao}`;
}

export function registrarOcupacao(ocupacao: Ocupacao, aulas: Aula[]) {
  for (const aula of aulas) if (aula.professor) ocupacao.add(chaveOcupacao(aula.professor.id, aula));
}

type EntradaEscalonador = {
  turma: Turma;
  estrutura: EstruturaTurno;
  /** Disciplinas do semestre da turma. */
  disciplinas: Disciplina[];
  professorDe: (disciplinaId: string) => ProfessorResumo | undefined;
  /** Atualizada com as aulas alocadas, para a próxima turma não repetir o professor no horário. */
  ocupacao: Ocupacao;
  /** Muda a ordem das disciplinas: cada versão sai diferente da anterior. */
  versao: number;
  /** Aulas bloqueadas, mantidas no mesmo lugar (RF 3.15). */
  fixas?: Aula[];
};

/**
 * Simulação do escalonador (RF 3.1). Mantém as aulas fixas, preenche os horários livres
 * com as aulas que faltam (em pares da mesma disciplina) e nunca coloca um professor
 * em duas turmas no mesmo horário (RF 3.9): sem professor livre, a aula vira conflito (RF 3.10).
 */
export function escalonarTurma({ turma, estrutura, disciplinas, professorDe, ocupacao, versao, fixas = [] }: EntradaEscalonador) {
  registrarOcupacao(ocupacao, fixas);
  const tomados = new Set(fixas.map((aula) => `${aula.dia}:${aula.posicao}`));
  const horarios = estrutura.dias
    .flatMap((dia) => estrutura.blocos.flatMap((bloco) => bloco.aulas.map(({ posicao }) => ({ dia, posicao }))))
    .filter(({ dia, posicao }) => !tomados.has(`${dia}:${posicao}`));

  const fila = disciplinas.flatMap((disciplina) => {
    const jaFixas = fixas.filter((aula) => aula.disciplina.id === disciplina.id).length;
    return Array<Disciplina>(Math.max(0, disciplina.aulasPorSemana - jaFixas)).fill(disciplina);
  });
  const deslocamento = fila.length ? (2 * versao) % fila.length : 0;
  const restantes = [...fila.slice(deslocamento), ...fila.slice(0, deslocamento)];

  const aulas: Aula[] = [...fixas];
  const semProfessor = new Set<Disciplina>();

  for (const { dia, posicao } of horarios) {
    if (restantes.length === 0) break;
    const horario = { turno: turma.turno, dia, posicao };
    const livre = (disciplina: Disciplina) => {
      const professor = professorDe(disciplina.id);
      return !professor || !ocupacao.has(chaveOcupacao(professor.id, horario));
    };
    const [disciplina] = restantes.splice(Math.max(0, restantes.findIndex(livre)), 1);
    const professor = livre(disciplina) ? professorDe(disciplina.id) : undefined;
    if (professor) ocupacao.add(chaveOcupacao(professor.id, horario));
    else semProfessor.add(disciplina);
    aulas.push({ id: `${turma.id}-v${versao}-${dia}-${posicao}`, ...horario, disciplina, turma, professor, bloqueada: false });
  }

  const conflitos: Conflito[] = Array.from(semProfessor).map((disciplina) => ({
    id: `${turma.id}-v${versao}-${disciplina.id}`,
    tipo: "sem_professor",
    disciplinaId: disciplina.id,
    descricao: professorDe(disciplina.id)
      ? `${disciplina.nome} (${rotuloTurma(turma)}) ficou com aulas sem professor: ${professorDe(disciplina.id)?.nome} já tem aula em outra turma nesses horários.`
      : `${disciplina.nome} (${rotuloTurma(turma)}) ficou sem professor: ninguém demonstrou interesse na disciplina.`,
  }));
  if (restantes.length > 0) {
    conflitos.push({
      id: `${turma.id}-v${versao}-carga`,
      tipo: "carga_excedida",
      descricao: `${restantes.length} aula(s) de ${rotuloTurma(turma)} não couberam nos horários do turno.`,
    });
  }

  return { aulas, conflitos };
}
