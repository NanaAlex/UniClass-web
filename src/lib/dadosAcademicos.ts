import type { BlocoAula, DadosAcademicos, DiaSemana, Disciplina, EstruturaTurno, Turma, Turno } from "@/types";

// Transformações puras da aba Dados (RF 7). A tela só chama estas funções e guarda o resultado.

export const ordemDias: DiaSemana[] = ["seg", "ter", "qua", "qui", "sex", "sab"];
export const MAXIMO_SEMESTRES = 8;
export const MAXIMO_AULAS_BLOCO = 4;

/** Posições contínuas no turno (1, 2, 3...) depois de mudar blocos. Horários das aulas novas ficam vazios. */
function renumerar(blocos: { quantidade: number; base?: BlocoAula }[]): BlocoAula[] {
  let posicao = 1;
  return blocos.map(({ quantidade, base }) => ({
    aulas: Array.from({ length: quantidade }, (_, i) => ({ ...base?.aulas[i], posicao: posicao++ })),
  }));
}

export function aulasPorBloco(estrutura: EstruturaTurno) {
  return estrutura.blocos[0]?.aulas.length ?? 2;
}

/** RF 7.2: muda o tamanho de todos os blocos do turno. */
export function definirAulasPorBloco(estrutura: EstruturaTurno, quantidade: number): EstruturaTurno {
  return { ...estrutura, blocos: renumerar(estrutura.blocos.map((base) => ({ quantidade, base }))) };
}

/** RF 7.3: novo bloco no fim, separado do anterior por um intervalo. */
export function adicionarBloco(estrutura: EstruturaTurno): EstruturaTurno {
  const atuais = estrutura.blocos.map((base) => ({ quantidade: base.aulas.length, base }));
  return { ...estrutura, blocos: renumerar([...atuais, { quantidade: aulasPorBloco(estrutura) }]) };
}

export function removerBloco(estrutura: EstruturaTurno, indice: number): EstruturaTurno {
  const restantes = estrutura.blocos.filter((_, i) => i !== indice);
  return { ...estrutura, blocos: renumerar(restantes.map((base) => ({ quantidade: base.aulas.length, base }))) };
}

/** RF 7.1: dias sempre na ordem da semana. */
export function alternarDia(estrutura: EstruturaTurno, dia: DiaSemana, incluir: boolean): EstruturaTurno {
  const dias = incluir ? [...estrutura.dias, dia] : estrutura.dias.filter((d) => d !== dia);
  return { ...estrutura, dias: ordemDias.filter((d) => dias.includes(d)) };
}

export function substituirEstrutura(dados: DadosAcademicos, nova: EstruturaTurno): DadosAcademicos {
  return { ...dados, estruturas: dados.estruturas.map((e) => (e.turno === nova.turno ? nova : e)) };
}

/** Menor número de semestre ainda livre (preenche lacunas deixadas por exclusões). */
export function proximoSemestre(dados: DadosAcademicos): number | null {
  for (let numero = 1; numero <= MAXIMO_SEMESTRES; numero++) {
    if (!dados.semestres.some((s) => s.numero === numero)) return numero;
  }
  return null;
}

/** RF 7.4 */
export function adicionarSemestre(dados: DadosAcademicos, numero: number): DadosAcademicos {
  const semestres = [...dados.semestres, { id: `s${numero}`, numero, turmaIds: [] }];
  return { ...dados, semestres: semestres.sort((a, b) => a.numero - b.numero) };
}

/** Exclui o semestre com suas turmas e disciplinas, para não deixar vínculos soltos (RF 7.7). */
export function removerSemestre(dados: DadosAcademicos, numero: number): DadosAcademicos {
  return {
    ...dados,
    semestres: dados.semestres.filter((s) => s.numero !== numero),
    turmas: dados.turmas.filter((t) => t.semestre !== numero),
    disciplinas: dados.disciplinas.filter((d) => d.semestre !== numero),
  };
}

export function turmasDoSemestre(dados: DadosAcademicos, numero: number): Turma[] {
  return dados.turmas.filter((t) => t.semestre === numero).sort((a, b) => a.nome.localeCompare(b.nome));
}

/** Primeira letra livre no semestre: A, B, C... */
export function proximaLetraTurma(dados: DadosAcademicos, numero: number): string {
  const usadas = new Set(turmasDoSemestre(dados, numero).map((t) => t.nome));
  let codigo = 65;
  while (usadas.has(String.fromCharCode(codigo))) codigo++;
  return String.fromCharCode(codigo);
}

/** RF 7.5 */
export function adicionarTurma(dados: DadosAcademicos, semestre: number, turno: Turno): DadosAcademicos {
  const nome = proximaLetraTurma(dados, semestre);
  const turma: Turma = { id: `t${semestre}${nome.toLowerCase()}-${Date.now()}`, nome, semestre, turno };
  return {
    ...dados,
    turmas: [...dados.turmas, turma],
    semestres: dados.semestres.map((s) => (s.numero === semestre ? { ...s, turmaIds: [...s.turmaIds, turma.id] } : s)),
  };
}

export function removerTurma(dados: DadosAcademicos, id: string): DadosAcademicos {
  return {
    ...dados,
    turmas: dados.turmas.filter((t) => t.id !== id),
    semestres: dados.semestres.map((s) => ({ ...s, turmaIds: s.turmaIds.filter((t) => t !== id) })),
  };
}

/** RF 7.6 */
export function adicionarDisciplina(dados: DadosAcademicos, nova: Omit<Disciplina, "id">): DadosAcademicos {
  return { ...dados, disciplinas: [{ ...nova, id: `disc-${Date.now()}` }, ...dados.disciplinas] };
}

export function removerDisciplina(dados: DadosAcademicos, id: string): DadosAcademicos {
  return { ...dados, disciplinas: dados.disciplinas.filter((d) => d.id !== id) };
}

/** Seções da aba Dados; a ativa fica em `?aba=` na URL. */
export type AbaDados = "horarios" | "semestres" | "disciplinas";
export const abasDados: AbaDados[] = ["horarios", "semestres", "disciplinas"];
