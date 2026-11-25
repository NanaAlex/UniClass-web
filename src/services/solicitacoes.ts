import { formularioAtual, respostasFormulario } from "@/mocks/formularios";
import { solicitacoes } from "@/mocks/solicitacoes";
import type { AulaReferenciada, ProfessorResumo, Solicitacao, TipoSolicitacao } from "@/types";
import { ErroNaoEncontrado, responder } from "./simulacao";

/** RF 9.1, RF 9.2, RF 8.9: todas (admin) ou só as de um professor; mais recentes primeiro. */
export function listarSolicitacoes(filtro: { professorId?: string; tipo?: TipoSolicitacao } = {}): Promise<Solicitacao[]> {
  const resultado = solicitacoes
    .filter((s) => (!filtro.professorId || s.professor.id === filtro.professorId) && (!filtro.tipo || s.tipo === filtro.tipo))
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  return responder(resultado);
}

/** RF 3.4, RF 9.3 (horário) e RF 2.15 (formulário). */
export function criarSolicitacao(dados: {
  tipo: TipoSolicitacao;
  professor: ProfessorResumo;
  descricao: string;
  aula?: AulaReferenciada;
}): Promise<Solicitacao> {
  const nova: Solicitacao = { id: `s${Date.now()}`, status: "pendente", criadaEm: new Date().toISOString(), ...dados };
  solicitacoes.push(nova);
  return responder(nova, 600);
}

function encontrar(id: string) {
  const solicitacao = solicitacoes.find((s) => s.id === id);
  if (!solicitacao) throw new ErroNaoEncontrado("Solicitação", id);
  return solicitacao;
}

/** Texto vazio não vira resposta. */
function limpar(resposta?: string) {
  return resposta?.trim() || undefined;
}

/** Solicitação de horário não tem aceite (RF 3.4): o admin só registra a leitura, com um recado opcional. */
export function marcarComoLida(id: string, resposta?: string): Promise<Solicitacao> {
  const solicitacao = encontrar(id);
  solicitacao.lidaEm = new Date().toISOString();
  solicitacao.resposta = limpar(resposta);
  return responder(solicitacao, 500);
}

/** RF 9.6. Aprovar um pedido de formulário libera a edição da resposta (RF 2.18). */
export function responderSolicitacao(id: string, decisao: "aprovada" | "rejeitada", resposta?: string): Promise<Solicitacao> {
  const solicitacao = encontrar(id);
  if (solicitacao.tipo !== "formulario") throw new Error("Apenas solicitações de formulário podem ser aprovadas ou rejeitadas.");
  solicitacao.status = decisao;
  solicitacao.respondidaEm = new Date().toISOString();
  solicitacao.resposta = limpar(resposta);
  if (decisao === "aprovada") {
    const respostaFormulario = respostasFormulario.find(
      (r) => r.formularioId === formularioAtual.id && r.professorId === solicitacao.professor.id,
    );
    if (respostaFormulario) respostaFormulario.edicaoLiberada = true;
  }
  return responder(solicitacao, 600);
}
