import type { VarianteEtiqueta } from "@/components/ui/Etiqueta";
import type { ChaveHorario, ChavePeriodo, Formulario, NivelInteresse, RespostaFormulario, Solicitacao } from "@/types";

/** O que o professor pode fazer com o formulário atual. */
export type SituacaoFormulario = "indisponivel" | "pendente" | "respondido" | "edicao_liberada" | "encerrado";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

/** RF 2.7, 2.8: encerra pelo status (manual) ou pela data de fim (automático). */
export function formularioEncerrado(formulario: Formulario, agora = new Date()) {
  return formulario.status === "encerrado" || new Date(formulario.fim).getTime() < agora.getTime();
}

export function situacaoDoFormulario(formulario: Formulario | null, resposta: RespostaFormulario | null): SituacaoFormulario {
  if (!formulario || formulario.status === "rascunho") return "indisponivel";
  if (formularioEncerrado(formulario)) return "encerrado";
  // Lançado pelo administrador com início futuro: ainda não recebe respostas
  if (new Date(formulario.inicio).getTime() > Date.now()) return "indisponivel";
  if (!resposta) return "pendente";
  return resposta.edicaoLiberada ? "edicao_liberada" : "respondido";
}

/** Situações em que a resposta pode ser preenchida ou alterada (RF 2.12, RF 2.18). */
export function podeEditarResposta(situacao: SituacaoFormulario) {
  return situacao === "pendente" || situacao === "edicao_liberada";
}

export const etiquetasSituacao: Record<SituacaoFormulario, { rotulo: string; variante: VarianteEtiqueta }> = {
  indisponivel: { rotulo: "Indisponível", variante: "neutra" },
  pendente: { rotulo: "Aguardando sua resposta", variante: "aviso" },
  respondido: { rotulo: "Respondido", variante: "sucesso" },
  edicao_liberada: { rotulo: "Edição liberada", variante: "info" },
  encerrado: { rotulo: "Encerrado", variante: "neutra" },
};

/** Dias inteiros até o fim do prazo (0 = termina hoje). */
export function diasRestantes(fim: string, agora = new Date()) {
  return Math.max(0, Math.ceil((new Date(fim).getTime() - agora.getTime()) / UM_DIA_MS));
}

/**
 * RF 2.15: o professor pede reabertura quando já respondeu, o prazo segue aberto
 * e não há outro pedido de formulário aguardando a coordenação.
 */
export function motivoBloqueioSolicitacao(situacao: SituacaoFormulario, solicitacoes: Solicitacao[]): string | null {
  if (situacao === "indisponivel" || situacao === "pendente") return "Disponível depois que você enviar sua resposta.";
  if (situacao === "encerrado") return "O prazo do formulário terminou.";
  if (situacao === "edicao_liberada") return "Sua edição já está liberada.";
  if (solicitacoes.some((s) => s.tipo === "formulario" && s.status === "pendente")) {
    return "Você já tem um pedido aguardando a coordenação.";
  }
  return null;
}

export const NIVEIS: NivelInteresse[] = [1, 2, 3, 4, 5];
export const NIVEL_PADRAO: NivelInteresse = 3;

export const rotulosNivel: Record<NivelInteresse, string> = {
  1: "Muito baixa",
  2: "Baixa",
  3: "Média",
  4: "Alta",
  5: "Muito alta",
};

export function chavePeriodo(chave: ChaveHorario): ChavePeriodo {
  const [turno, dia] = chave.split(":");
  return `${turno}:${dia}` as ChavePeriodo;
}

/** Períodos (turno + dia) com pelo menos um horário marcado como disponível. */
export function periodosDisponiveis(disponibilidade: ChaveHorario[]) {
  return new Set(disponibilidade.map(chavePeriodo));
}

/** Mantém só os períodos com disponibilidade e completa os que faltam com o nível padrão. */
export function normalizarPrioridades(
  prioridades: RespostaFormulario["prioridadesPeriodo"],
  disponibilidade: ChaveHorario[],
): RespostaFormulario["prioridadesPeriodo"] {
  return Object.fromEntries(
    Array.from(periodosDisponiveis(disponibilidade)).map((periodo) => [periodo, prioridades[periodo] ?? NIVEL_PADRAO]),
  );
}
