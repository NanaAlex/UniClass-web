import type { DadosAcademicos, DiaSemana, Disciplina, EstruturaTurno, Turma, Turno } from "@/types";
import { rotulosTurno } from "./horario";

// Transformações puras da aba Dados (RF 7). A tela só chama estas funções e guarda o resultado.

export const ordemDias: DiaSemana[] = ["seg", "ter", "qua", "qui", "sex", "sab"];
export const MAXIMO_SEMESTRES = 8;
export const MAXIMO_AULAS_BLOCO = 4;
export const MAXIMO_BLOCOS_TURNO = 6;
export const MAXIMO_AULAS_DISCIPLINA = 12;

/** RN-09: K é global, igual em todos os turnos e dias. */
export function definirAulasPorBloco(dados: DadosAcademicos, K: number): DadosAcademicos {
  return { ...dados, aulasPorBloco: K };
}

/** RN-10: blocos ordinais; um novo bloco entra no fim do turno. Não há horário de relógio (RN-35). */
export function adicionarBloco(estrutura: EstruturaTurno): EstruturaTurno {
  return { ...estrutura, blocos: Math.min(MAXIMO_BLOCOS_TURNO, estrutura.blocos + 1) };
}

/** Remove o último bloco: os índices restantes continuam 1..B. */
export function removerUltimoBloco(estrutura: EstruturaTurno): EstruturaTurno {
  return { ...estrutura, blocos: Math.max(0, estrutura.blocos - 1) };
}

/** RF 7.1: dias sempre na ordem da semana. */
export function alternarDia(estrutura: EstruturaTurno, dia: DiaSemana, incluir: boolean): EstruturaTurno {
  const dias = incluir ? [...estrutura.dias, dia] : estrutura.dias.filter((d) => d !== dia);
  return { ...estrutura, dias: ordemDias.filter((d) => dias.includes(d)) };
}

/** RN-13, CA-16: cargas possíveis são múltiplos de K. */
export function opcoesCarga(K: number) {
  return Array.from({ length: Math.floor(MAXIMO_AULAS_DISCIPLINA / K) }, (_, i) => (i + 1) * K);
}

/** Disciplinas cuja carga não é múltipla de K: impedem salvar (a geração as rejeitaria na pré-validação). */
export function cargasIncompativeis(dados: DadosAcademicos) {
  return dados.disciplinas.filter((d) => d.aulasPorSemana % dados.aulasPorBloco !== 0);
}

const assinaturaTurma = (t: Turma) => `${t.id}|${t.semestre}|${t.turno}`;
const assinaturaDisciplina = (d: Disciplina) => `${d.id}|${d.semestre}|${d.aulasPorSemana}`;

/**
 * RN-38: o que muda a estrutura da edição do formulário (K, dias, blocos, turmas, disciplinas e
 * cargas). Nome e cor não são estruturais.
 */
export function alteracoesEstruturais(antes: DadosAcademicos, depois: DadosAcademicos): string[] {
  const mudancas: string[] = [];
  if (antes.aulasPorBloco !== depois.aulasPorBloco) mudancas.push(`Aulas por bloco: ${antes.aulasPorBloco} → ${depois.aulasPorBloco}`);
  for (const e of depois.estruturas) {
    const a = antes.estruturas.find((x) => x.turno === e.turno);
    if (!a || a.dias.join() !== e.dias.join()) mudancas.push(`Dias letivos da ${rotulosTurno[e.turno].toLowerCase()}`);
    if (!a || a.blocos !== e.blocos) mudancas.push(`Blocos da ${rotulosTurno[e.turno].toLowerCase()}: ${a?.blocos ?? 0} → ${e.blocos}`);
  }
  const turmasAntes = new Set(antes.turmas.map(assinaturaTurma));
  const turmasDepois = new Set(depois.turmas.map(assinaturaTurma));
  if (turmasAntes.size !== turmasDepois.size || Array.from(turmasDepois).some((t) => !turmasAntes.has(t))) mudancas.push("Turmas");
  const discAntes = new Set(antes.disciplinas.map(assinaturaDisciplina));
  const discDepois = new Set(depois.disciplinas.map(assinaturaDisciplina));
  if (discAntes.size !== discDepois.size || Array.from(discDepois).some((d) => !discAntes.has(d))) mudancas.push("Disciplinas ou cargas");
  return mudancas;
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
