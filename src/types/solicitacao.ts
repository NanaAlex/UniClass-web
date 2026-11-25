import type { DiaSemana } from "./academico";
import type { ProfessorResumo } from "./usuario";

/**
 * horario: descritiva, sem aceite (RF 3.4) — o admin apenas marca como lida (`lidaEm`).
 * formulario: pedido para reabrir o formulário, com aceite ou recusa (RF 2.15, RF 2.18, RF 9.6).
 */
export type TipoSolicitacao = "horario" | "formulario";

/** RF 9.4. Solicitações de horário permanecem "pendente"; o que muda nelas é `lidaEm`. */
export type StatusSolicitacao = "pendente" | "aprovada" | "rejeitada";

export type AulaReferenciada = {
  dia: DiaSemana;
  posicao: number;
  disciplina: string;
  turma: string;
};

export type Solicitacao = {
  id: string;
  tipo: TipoSolicitacao;
  status: StatusSolicitacao;
  professor: ProfessorResumo;
  descricao: string;
  criadaEm: string; // ISO 8601
  /** Quando o admin leu (apenas tipo "horario"). */
  lidaEm?: string;
  /** Quando o admin aprovou ou rejeitou (apenas tipo "formulario"). */
  respondidaEm?: string;
  aula?: AulaReferenciada;
  /** Mensagem opcional do administrador ao analisar o pedido. */
  resposta?: string;
};
