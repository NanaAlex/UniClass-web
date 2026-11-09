import type { AcaoEdicao, BlocoGrade, Coordenada, Disciplina, Execucao, GradeTurma, ProfessorResumo, Solicitacao, Trava, Turma } from "@/types";
import { temGradeValidada } from "./geracao";
import { mesmaCoordenada, ordemTurnos, rotuloCoordenada, rotuloTurma } from "./horario";

// Regras puras da aba Horários do administrador: execuções, grade por turma e por professor, travas.

export const hrefHorarios = "/admin/horarios";
export const hrefExecucao = (execucaoId: string) => `${hrefHorarios}?execucao=${encodeURIComponent(execucaoId)}`;
export const hrefGradeTurma = (execucaoId: string, turmaId: string) => `${hrefHorarios}/${encodeURIComponent(execucaoId)}/turmas/${encodeURIComponent(turmaId)}`;
export const hrefGradeProfessor = (execucaoId: string, professorId: string) =>
  `${hrefHorarios}/${encodeURIComponent(execucaoId)}/professores/${encodeURIComponent(professorId)}`;

/** Execuções da mais recente para a mais antiga. */
export const ordenarExecucoes = (execucoes: Execucao[]) => [...execucoes].sort((a, b) => b.iniciadaEm.localeCompare(a.iniciadaEm));

/** A execução escolhida na URL ou, sem escolha, a mais recente. */
export function execucaoSelecionada(execucoes: Execucao[], id?: string) {
  const ordenadas = ordenarExecucoes(execucoes);
  return ordenadas.find((e) => e.id === id) ?? ordenadas[0] ?? null;
}

/** A grade vigente para os professores: a última publicada (RN-29). */
export function execucaoVigente(execucoes: Execucao[]) {
  return [...execucoes].filter((e) => e.publicadaEm).sort((a, b) => (b.publicadaEm ?? "").localeCompare(a.publicadaEm ?? ""))[0] ?? null;
}

export const etapasGeracao = ["Coletar respostas", "Gerar", "Revisar e travar", "Publicar"];

/** Índice da etapa atual; igual ao total quando a grade vigente é a mais recente validada. */
export function etapaAtual(temFormulario: boolean, execucoes: Execucao[]) {
  if (!temFormulario) return 0;
  const validadas = ordenarExecucoes(execucoes).filter(temGradeValidada);
  if (validadas.length === 0) return 1;
  return validadas[0].publicadaEm ? etapasGeracao.length : 2;
}

// ---- Travas ---------------------------------------------------------------------------------

const naCoordenada = (t: Trava, c: Coordenada) => Boolean(t.coordenada && mesmaCoordenada(t.coordenada, c));

/** Travas que incidem sobre a posição da turma (ocupação ou vaga): RN-41, RN-42. */
export const travasDaPosicaoTurma = (travas: Trava[], turmaId: string, c: Coordenada) =>
  travas.filter((t) => (t.tipo === "ocupacao" || t.tipo === "vaga_turma") && t.turmaId === turmaId && naCoordenada(t, c));

/** Travas que incidem sobre a coordenada do professor (ocupação dele ou vaga): RN-43, RN-44. */
export const travasDaCoordenadaProfessor = (travas: Trava[], professorId: string, c: Coordenada) =>
  travas.filter((t) => (t.tipo === "ocupacao" || t.tipo === "vaga_professor") && t.professorId === professorId && naCoordenada(t, c));

/** Travas que dizem respeito à turma: posições dela e fixações do semestre dela. */
export const travasDaTurma = (travas: Trava[], turma: Turma) =>
  travas.filter((t) => t.turmaId === turma.id || (t.tipo === "fixacao_disciplina_professor" && t.semestre === turma.semestre));

export const travasDoProfessor = (travas: Trava[], professorId: string) => travas.filter((t) => t.professorId === professorId);

/** Todas as posições da turma estão travadas (efeito de "travar grade da turma"). */
export function gradeTurmaTravada(grade: GradeTurma, travas: Trava[]) {
  return grade.posicoes.length > 0 && grade.posicoes.every((b) => travasDaPosicaoTurma(travas, grade.turmaId, b).length > 0);
}

export function posicoesTravadas(grade: GradeTurma, travas: Trava[]) {
  return grade.posicoes.filter((b) => travasDaPosicaoTurma(travas, grade.turmaId, b).length > 0).length;
}

// ---- Lista de turmas ------------------------------------------------------------------------

export type SituacaoFiltro = "todas" | "com_travas" | "travadas" | "sem_travas";

export type FiltrosHorario = { semestre: string; turma: string; turno: string; situacao: SituacaoFiltro };

export const filtrosVazios: FiltrosHorario = { semestre: "", turma: "", turno: "", situacao: "todas" };

export const rotulosSituacaoFiltro: Record<SituacaoFiltro, string> = {
  todas: "Todas",
  com_travas: "Com alguma trava",
  travadas: "Grade inteira travada",
  sem_travas: "Sem travas",
};

export type TurmaNaGrade = { grade: GradeTurma; turma: Turma; travadas: number };

/** Filtros por semestre, turma, turno e situação das travas. */
export function filtrarTurmas(grades: GradeTurma[], turmas: Turma[], travas: Trava[], filtros: FiltrosHorario): TurmaNaGrade[] {
  return grades
    .map((grade) => ({ grade, turma: turmas.find((t) => t.id === grade.turmaId)!, travadas: posicoesTravadas(grade, travas) }))
    .filter(({ grade, turma, travadas }) => {
      if (!turma) return false;
      if (filtros.semestre && String(turma.semestre) !== filtros.semestre) return false;
      if (filtros.turma && turma.nome !== filtros.turma) return false;
      if (filtros.turno && turma.turno !== filtros.turno) return false;
      if (filtros.situacao === "com_travas") return travadas > 0 || travasDaTurma(travas, turma).length > 0;
      if (filtros.situacao === "travadas") return travadas === grade.posicoes.length;
      if (filtros.situacao === "sem_travas") return travadas === 0 && travasDaTurma(travas, turma).length === 0;
      return true;
    })
    .sort((a, b) => a.turma.semestre - b.turma.semestre || a.turma.nome.localeCompare(b.turma.nome));
}

// ---- Professores ----------------------------------------------------------------------------

export type ProfessorNoHorario = { professor: ProfessorResumo; blocos: number; aulas: number; turmas: string[] };

/** Professores com aulas na grade da execução, com carga (blocos × K) e turmas. */
export function professoresNaGrade(execucao: Execucao, professores: ProfessorResumo[], turmas: Turma[]): ProfessorNoHorario[] {
  if (!execucao.grade) return [];
  const K = execucao.aulasPorBloco;
  return execucao.grade.porProfessor
    .map((p) => {
      const ocupados = p.posicoes.filter((b) => b.disciplinaId);
      const nomesTurmas = Array.from(new Set(ocupados.map((b) => b.turmaId!)))
        .map((id) => turmas.find((t) => t.id === id))
        .filter((t): t is Turma => Boolean(t))
        .sort((a, b) => a.semestre - b.semestre || a.nome.localeCompare(b.nome))
        .map((t) => `${t.semestre}º ${t.nome}`);
      const professor = professores.find((x) => x.id === p.professorId) ?? { id: p.professorId, nome: p.professorId };
      return { professor, blocos: ocupados.length, aulas: ocupados.length * K, turmas: nomesTurmas };
    })
    .sort((a, b) => a.professor.nome.localeCompare(b.professor.nome));
}

/** Posições do professor agrupadas por turno, na ordem manhã → tarde → noite (RN-69: todas as coordenadas). */
export function posicoesPorTurno(posicoes: BlocoGrade[]) {
  return ordemTurnos.map((turno) => ({ turno, posicoes: posicoes.filter((b) => b.turno === turno) })).filter((g) => g.posicoes.length > 0);
}

// ---- Nomes ----------------------------------------------------------------------------------

export type Nomes = {
  disciplina: (id: string) => Disciplina | undefined;
  professor: (id: string) => string;
  turma: (id: string) => string;
};

export function criarNomes(disciplinas: Disciplina[], professores: ProfessorResumo[], turmas: Turma[]): Nomes {
  const d = new Map(disciplinas.map((x) => [x.id, x]));
  const p = new Map(professores.map((x) => [x.id, x.nome]));
  const t = new Map(turmas.map((x) => [x.id, rotuloTurma(x)]));
  return {
    disciplina: (id) => d.get(id),
    professor: (id) => p.get(id) ?? id,
    turma: (id) => t.get(id) ?? id,
  };
}

/** Nomes no formato que lib/edicaoGrade.descreverTrava espera. */
export const nomesParaTravas = (n: Nomes) => ({ disciplina: (id: string) => n.disciplina(id)?.nome ?? id, professor: n.professor, turma: n.turma });

// ---- Pedidos de alteração (RF 3.4) ----------------------------------------------------------

export function solicitacoesDaTurma(solicitacoes: Solicitacao[], turma: Turma) {
  return solicitacoes.filter((s) => s.tipo === "horario" && s.aula?.turma === rotuloTurma(turma));
}

/** Pedidos não lidos, cada um com a turma citada. */
export function pedidosNaoLidos(solicitacoes: Solicitacao[], turmas: Turma[]) {
  return solicitacoes
    .filter((s) => s.tipo === "horario" && !s.lidaEm)
    .map((solicitacao) => ({ solicitacao, turma: turmas.find((t) => solicitacoesDaTurma([solicitacao], t).length > 0) }));
}

/** Blocos da turma com pedido ainda não lido: recebem um marcador na grade. */
export function blocosComPedido(solicitacoes: Solicitacao[]) {
  return solicitacoes
    .filter((s) => !s.lidaEm && s.aula)
    .map((s) => ({ dia: s.aula!.dia, turno: s.aula!.turno, indice: s.aula!.indice }));
}

// ---- Ações de edição ------------------------------------------------------------------------

/** Texto de uma ação do rascunho ("Trocar Segunda · Manhã · Bloco 1 ↔ Terça · Manhã · Bloco 2 em 1º A"). */
export function descreverAcao(acao: AcaoEdicao, n: Nomes) {
  switch (acao.acao) {
    case "bloquear_grade_turma":
      return `Travar a grade inteira de ${n.turma(acao.turmaId)}`;
    case "bloquear_grade_professor":
      return `Travar a grade inteira de ${n.professor(acao.professorId)}`;
    case "bloquear_bloco_turma":
      return `Travar ${rotuloCoordenada(acao.coordenada)} em ${n.turma(acao.turmaId)}`;
    case "bloquear_bloco_professor":
      return `Travar ${rotuloCoordenada(acao.coordenada)} de ${n.professor(acao.professorId)}`;
    case "fixar_disciplina_professor_semestre":
      return `Fixar ${n.disciplina(acao.disciplinaId)?.nome ?? acao.disciplinaId} com ${n.professor(acao.professorId)} no ${acao.semestre}º semestre`;
    case "trocar_posicoes":
      return `Trocar ${rotuloCoordenada(acao.origem)} ↔ ${rotuloCoordenada(acao.destino)} em ${n.turma(acao.origem.turmaId)}`;
  }
}
