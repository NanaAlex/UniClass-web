import type { VarianteEtiqueta } from "@/components/ui/Etiqueta";
import type { Aula, Grade, ProfessorResumo, Solicitacao, Turma } from "@/types";
import type { SituacaoGestao } from "./gestaoFormulario";
import { rotuloTurma } from "./horario";

// Regras puras da aba Horários do administrador (RF 3, RF 4).

export const hrefHorarios = "/admin/horarios";
export const hrefGrade = (gradeId: string) => `${hrefHorarios}/${gradeId}`;

/** A versão mais recente de cada turma: o horário atual. */
export function maisRecentes(grades: Grade[]) {
  return grades.filter((g) => !grades.some((outra) => outra.turmaId === g.turmaId && outra.versao > g.versao));
}

export const etapasGeracao = ["Coletar respostas", "Gerar horário", "Revisar prévia", "Horário oficial"];

/** Índice da etapa atual; igual ao total quando tudo está concluído. */
export function etapaAtual(situacaoFormulario: SituacaoGestao, atuais: Grade[]) {
  if (situacaoFormulario !== "encerrado") return 0;
  if (atuais.length === 0) return 1;
  return atuais.some((g) => g.status === "previa") ? 2 : etapasGeracao.length;
}

export const etiquetasStatusGrade: Record<Grade["status"], { rotulo: string; variante: VarianteEtiqueta }> = {
  previa: { rotulo: "Prévia", variante: "info" },
  definitiva: { rotulo: "Oficial", variante: "sucesso" },
};

/** Professores veem as prévias? Só faz sentido enquanto houver alguma. */
export function previasVisiveis(atuais: Grade[]) {
  const previas = atuais.filter((g) => g.status === "previa");
  return previas.length > 0 && previas.every((g) => g.visivelParaProfessores);
}

export type SituacaoFiltro = "todas" | "editadas" | "bloqueadas" | "pendencias";

export type FiltrosHorario = { semestre: string; turma: string; turno: string; situacao: SituacaoFiltro };

export const filtrosVazios: FiltrosHorario = { semestre: "", turma: "", turno: "", situacao: "todas" };

export const rotulosSituacaoFiltro: Record<SituacaoFiltro, string> = {
  todas: "Todas",
  editadas: "Editadas manualmente",
  bloqueadas: "Com bloqueio",
  pendencias: "Com pendências",
};

export const aulasBloqueadas = (grade: Grade) => grade.aulas.filter((a) => a.bloqueada).length;

/** RF 3.11: turma, semestre e período (turno), além da situação da grade. */
export function filtrarGrades(atuais: Grade[], turmas: Turma[], filtros: FiltrosHorario) {
  return atuais
    .map((grade) => ({ grade, turma: turmas.find((t) => t.id === grade.turmaId)! }))
    .filter(({ grade, turma }) => {
      if (!turma) return false;
      if (filtros.semestre && String(turma.semestre) !== filtros.semestre) return false;
      if (filtros.turma && turma.nome !== filtros.turma) return false;
      if (filtros.turno && turma.turno !== filtros.turno) return false;
      if (filtros.situacao === "editadas") return Boolean(grade.editadaEm);
      if (filtros.situacao === "bloqueadas") return grade.bloqueada || aulasBloqueadas(grade) > 0;
      if (filtros.situacao === "pendencias") return grade.conflitos.length > 0;
      return true;
    })
    .sort((a, b) => a.turma.semestre - b.turma.semestre || a.turma.nome.localeCompare(b.turma.nome));
}

/** RF 3.19: versões de cada turma, da mais nova para a mais antiga. */
export function versoesPorTurma(grades: Grade[], turmas: Turma[]) {
  return [...turmas]
    .sort((a, b) => a.semestre - b.semestre || a.nome.localeCompare(b.nome))
    .map((turma) => ({ turma, versoes: grades.filter((g) => g.turmaId === turma.id).sort((a, b) => b.versao - a.versao) }))
    .filter(({ versoes }) => versoes.length > 0);
}

export type ProfessorNoHorario = { professor: ProfessorResumo; aulas: number; turmas: string[] };

/** Professores alocados no horário atual, com quantas aulas e em quais turmas. */
export function professoresNoHorario(atuais: Grade[]): ProfessorNoHorario[] {
  const porId = new Map<string, ProfessorNoHorario>();
  for (const aula of atuais.flatMap((g) => g.aulas)) {
    if (!aula.professor) continue;
    const item = porId.get(aula.professor.id) ?? { professor: aula.professor, aulas: 0, turmas: [] };
    item.aulas += 1;
    const turma = `${aula.turma.semestre}º ${aula.turma.nome}`;
    if (!item.turmas.includes(turma)) item.turmas.push(turma);
    porId.set(aula.professor.id, item);
  }
  return Array.from(porId.values()).sort((a, b) => a.professor.nome.localeCompare(b.professor.nome));
}

/** Pedidos de alteração de horário (RF 3.4) que citam uma aula desta turma. */
export function solicitacoesDaTurma(solicitacoes: Solicitacao[], turma: Turma) {
  return solicitacoes.filter((s) => s.tipo === "horario" && s.aula?.turma === rotuloTurma(turma));
}

/** RF 4.4: pedidos não lidos, cada um com a grade atual da turma citada. */
export function pedidosNaoLidos(solicitacoes: Solicitacao[], atuais: Grade[], turmas: Turma[]) {
  return solicitacoes
    .filter((s) => s.tipo === "horario" && !s.lidaEm)
    .map((solicitacao) => {
      const turma = turmas.find((t) => solicitacoesDaTurma([solicitacao], t).length > 0);
      return { solicitacao, gradeId: atuais.find((g) => g.turmaId === turma?.id)?.id };
    });
}

/** Aulas com pedido ainda não lido: recebem um marcador na grade. */
export function idsAulasComPedido(aulas: Aula[], solicitacoes: Solicitacao[]) {
  const pendentes = solicitacoes.filter((s) => !s.lidaEm && s.aula);
  return new Set(
    aulas.filter((a) => pendentes.some((s) => s.aula?.dia === a.dia && s.aula.posicao === a.posicao)).map((a) => a.id),
  );
}
