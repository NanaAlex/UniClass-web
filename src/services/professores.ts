import { formularioAtual, respostasFormulario } from "@/mocks/formularios";
import { solicitacoes } from "@/mocks/solicitacoes";
import { professores, professoresOutrosCursos } from "@/mocks/usuarios";
import { aguardandoAdministrador } from "@/lib/solicitacao";
import type { Professor, ProfessorComSituacao } from "@/types";
import { ErroNaoEncontrado, esperar, responder } from "./simulacao";

function comSituacao(professor: Professor): ProfessorComSituacao {
  const resposta = respostasFormulario.find((r) => r.formularioId === formularioAtual.id && r.professorId === professor.id);
  const abertas = solicitacoes.filter((s) => s.professor.id === professor.id && aguardandoAdministrador(s));
  return {
    ...professor,
    formularioRespondidoEm: resposta?.enviadaEm ?? null,
    pedidosAbertos: {
      horario: abertas.filter((s) => s.tipo === "horario").length,
      formulario: abertas.filter((s) => s.tipo === "formulario").length,
    },
  };
}

/** RF 8.2: todos os professores do curso. Busca e filtros (RF 8.3, RF 8.4) são feitos na tela, sem nova requisição. */
export function listarProfessores(): Promise<ProfessorComSituacao[]> {
  return responder(professores.map(comSituacao));
}

/** RF 8.6 */
export async function obterProfessor(id: string): Promise<ProfessorComSituacao> {
  const professor = professores.find((p) => p.id === id);
  if (!professor) {
    await esperar();
    throw new ErroNaoEncontrado("Professor", id);
  }
  return responder(comSituacao(professor));
}

export type ResultadoConvite = { professor: ProfessorComSituacao; jaTinhaConta: boolean };

/**
 * RF 8.1: convida por e-mail; a conta fica "convidado" até o professor aceitar.
 * RF 1.13: se o e-mail já tem conta em outro curso, o convite é de vínculo e o nome já é conhecido.
 */
export async function convidarProfessores(emails: string[]): Promise<ResultadoConvite[]> {
  const resultados = emails.map((email) => {
    const existente = professoresOutrosCursos.find((p) => p.email === email);
    const professor: Professor = {
      id: existente?.id ?? `p${Date.now()}-${email}`,
      nome: existente?.nome ?? "",
      email,
      telefone: existente?.telefone,
      statusConta: "convidado",
      areas: existente?.areas ?? [],
      criadoEm: new Date().toISOString(),
    };
    professores.push(professor);
    return { professor: comSituacao(professor), jaTinhaConta: Boolean(existente) };
  });
  return responder(resultados, 700);
}

/** RF 5.9: reenvia o link de criação de conta. */
export async function reenviarConvite(id: string): Promise<void> {
  if (!professores.some((p) => p.id === id)) throw new ErroNaoEncontrado("Professor", id);
  await esperar(500);
}

/** RF 8.10 / RF 1.8 */
export async function alterarStatusConta(id: string, ativa: boolean): Promise<ProfessorComSituacao> {
  const professor = professores.find((p) => p.id === id);
  if (!professor) throw new ErroNaoEncontrado("Professor", id);
  professor.statusConta = ativa ? "ativa" : "desativada";
  return responder(comSituacao(professor), 500);
}

/** Protótipo "Editar foto". Sem back-end, a foto é um endereço local do navegador (some ao recarregar). */
export async function atualizarFotoProfessor(id: string, fotoUrl: string): Promise<ProfessorComSituacao> {
  const professor = professores.find((p) => p.id === id);
  if (!professor) throw new ErroNaoEncontrado("Professor", id);
  professor.fotoUrl = fotoUrl;
  return responder(comSituacao(professor), 600);
}
