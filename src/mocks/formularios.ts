import type { Formulario, RespostaFormulario } from "@/types";
import { configuracao, disciplinas, estruturasTurno } from "./academico";
import dadosDemo from "./demo/dadosDemo.json";

/**
 * O João (p2, professor logado) ainda não respondeu: a aba Formulário abre no preenchimento e a
 * geração do horário pede a confirmação de geração antecipada (RN-37).
 * Os demais professores ativos (p1, p3–p10) já enviaram; a resposta do Rafael (p4) está com a
 * edição liberada pela coordenação.
 */
export const formularioAtual: Formulario = {
  id: "f2027-1",
  nome: "Disponibilidade 2027.1",
  periodoLetivo: "2027.1",
  edicao: 1,
  status: "aberto",
  inicio: "2026-10-15T03:00:00Z",
  fim: "2026-11-25T02:59:00Z",
  aulasPorBloco: configuracao.aulasPorBloco,
  // Cópia: a edição guarda a estrutura do lançamento; mudanças em Dados exigem nova edição (RN-38)
  estruturas: structuredClone(estruturasTurno),
  disciplinaIds: disciplinas.map((d) => d.id),
};

export const respostasFormulario: RespostaFormulario[] = (dadosDemo.respostas as Omit<RespostaFormulario, "formularioId">[]).map(
  (r) => ({ ...r, formularioId: formularioAtual.id }),
);
