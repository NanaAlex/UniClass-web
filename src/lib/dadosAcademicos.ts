import type { BlocoAula, DadosAcademicos, DiaSemana, Disciplina, EstruturaTurno, Turma, Turno } from "@/types";

// Transformações puras da aba Dados (RF 7). A tela só chama estas funções e guarda o resultado.

export const ordemDias: DiaSemana[] = ["seg", "ter", "qua", "qui", "sex", "sab"];
export const MAXIMO_SEMESTRES = 8;
export const MAXIMO_AULAS_BLOCO = 4;

/** Início da primeira aula (HH:MM) e duração de cada aula do bloco, em minutos (RF 7.3). */
export type HorarioBloco = { horaInicio: string; duracaoAula: number };

export const MINUTOS_NO_DIA = 24 * 60;

// "07:30" <-> minutos desde 00:00
export function paraMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function paraHora(minutos: number) {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

/** Horário do bloco pela primeira aula; null se ainda não tem horário. */
export function horarioDoBloco(bloco: BlocoAula): HorarioBloco | null {
  const aula = bloco.aulas[0];
  if (!aula?.inicio || !aula.fim) return null;
  return { horaInicio: aula.inicio, duracaoAula: paraMinutos(aula.fim) - paraMinutos(aula.inicio) };
}

/** Minuto em que o bloco termina (fim da última aula); null se não tem horário. */
export function fimDoBloco(bloco: BlocoAula) {
  const fim = bloco.aulas[bloco.aulas.length - 1]?.fim;
  return fim ? paraMinutos(fim) : null;
}

/**
 * Posições contínuas no turno (1, 2, 3...) depois de mudar blocos. Com horário, as aulas
 * vêm em sequência a partir do início do bloco (como o back calcula); sem horário, ficam vazias.
 */
function renumerar(blocos: { quantidade: number; base?: BlocoAula; horario?: HorarioBloco }[]): BlocoAula[] {
  let posicao = 1;
  return blocos.map(({ quantidade, base, horario }) => {
    const usado = horario ?? (base ? horarioDoBloco(base) : null);
    return {
      aulas: Array.from({ length: quantidade }, (_, i) => {
        if (!usado) return { ...base?.aulas[i], posicao: posicao++ };
        const inicio = paraMinutos(usado.horaInicio) + i * usado.duracaoAula;
        return { posicao: posicao++, inicio: paraHora(inicio), fim: paraHora(inicio + usado.duracaoAula) };
      }),
    };
  });
}

export function aulasPorBloco(estrutura: EstruturaTurno) {
  return estrutura.blocos[0]?.aulas.length ?? 2;
}

/** RF 7.2: muda o tamanho de todos os blocos do turno. */
export function definirAulasPorBloco(estrutura: EstruturaTurno, quantidade: number): EstruturaTurno {
  return { ...estrutura, blocos: renumerar(estrutura.blocos.map((base) => ({ quantidade, base }))) };
}

/**
 * Tamanho único dos blocos no curso: o escalonador usa a mesma quantidade de aulas por bloco
 * em todos os turnos (o back recusa tamanhos diferentes). Vem do primeiro turno com blocos.
 */
export function aulasPorBlocoDoCurso(dados: DadosAcademicos) {
  const comBlocos = dados.estruturas.find((e) => e.blocos.length > 0);
  return comBlocos ? aulasPorBloco(comBlocos) : 2;
}

/** RF 7.2: muda o tamanho dos blocos de todos os turnos (tamanho único). */
export function definirAulasPorBlocoDoCurso(dados: DadosAcademicos, quantidade: number): DadosAcademicos {
  return { ...dados, estruturas: dados.estruturas.map((e) => definirAulasPorBloco(e, quantidade)) };
}

/** RF 7.3: novo bloco no fim, separado do anterior por um intervalo. */
export function adicionarBloco(estrutura: EstruturaTurno, horario: HorarioBloco, quantidade = aulasPorBloco(estrutura)): EstruturaTurno {
  const atuais = estrutura.blocos.map((base) => ({ quantidade: base.aulas.length, base }));
  return { ...estrutura, blocos: renumerar([...atuais, { quantidade, horario }]) };
}

/** RF 7.3: muda o início e a duração das aulas de um bloco (a fileira inteira, todos os dias). */
export function editarHorarioBloco(estrutura: EstruturaTurno, indice: number, horario: HorarioBloco): EstruturaTurno {
  return {
    ...estrutura,
    blocos: renumerar(
      estrutura.blocos.map((base, i) => ({ quantidade: base.aulas.length, base, horario: i === indice ? horario : undefined })),
    ),
  };
}

const INICIO_SUGERIDO: Record<Turno, string> = { manha: "07:30", tarde: "13:30", noite: "19:00" };
const INTERVALO_SUGERIDO = 20;

/** Sugestão para o novo bloco: 20 min depois do anterior, com a mesma duração das aulas. */
export function sugestaoNovoBloco(estrutura: EstruturaTurno): HorarioBloco {
  const ultimo = estrutura.blocos[estrutura.blocos.length - 1];
  const fim = ultimo ? fimDoBloco(ultimo) : null;
  return {
    horaInicio: fim === null ? INICIO_SUGERIDO[estrutura.turno] : paraHora(Math.min(fim + INTERVALO_SUGERIDO, MINUTOS_NO_DIA - 1)),
    duracaoAula: (ultimo && horarioDoBloco(ultimo)?.duracaoAula) || 50,
  };
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
