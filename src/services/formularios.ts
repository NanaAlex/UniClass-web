import { disciplinas, estruturasTurno } from "@/mocks/academico";
import { formularioAtual, respostasFormulario } from "@/mocks/formularios";
import { formularioEncerrado } from "@/lib/formulario";
import type { Disciplina, Formulario, RespostaFormulario } from "@/types";
import { responder } from "./simulacao";

export function obterFormularioAtual(): Promise<Formulario> {
  return responder(formularioAtual);
}

export type DadosLancamento = Pick<Formulario, "nome" | "periodoLetivo" | "inicio" | "fim">;

/**
 * RF 2.7, RF 2.8: lança um novo formulário com o período de respostas definido.
 * Usa os dias, horários e disciplinas cadastrados em Dados (RF 2.3, RF 2.5).
 */
export async function lancarFormulario(dados: DadosLancamento): Promise<Formulario> {
  if (formularioAtual.status === "aberto" && !formularioEncerrado(formularioAtual)) {
    throw new Error("Já existe um formulário ativo. Encerre-o antes de lançar outro.");
  }
  Object.assign(formularioAtual, {
    ...dados,
    id: `f${Date.now()}`,
    status: "aberto",
    estruturas: estruturasTurno,
    disciplinaIds: disciplinas.map((d) => d.id),
  } satisfies Formulario);
  return responder(formularioAtual, 700);
}

/** RF 2.8: altera o período. Prorrogar um formulário encerrado pela data volta a abri-lo. */
export async function atualizarPrazo(id: string, prazo: Pick<Formulario, "inicio" | "fim">): Promise<Formulario> {
  if (formularioAtual.id !== id || formularioAtual.status !== "aberto") {
    throw new Error("Este formulário não pode mais ter o prazo alterado.");
  }
  if (new Date(prazo.fim) <= new Date(prazo.inicio)) throw new Error("O término precisa ser depois do início.");
  Object.assign(formularioAtual, prazo);
  return responder(formularioAtual, 600);
}

/** RF 2.7: encerra manualmente; a partir daqui nenhuma resposta é aceita (RF 2.12). */
export async function encerrarFormulario(id: string): Promise<Formulario> {
  if (formularioAtual.id !== id) throw new Error("Formulário não encontrado.");
  Object.assign(formularioAtual, { status: "encerrado", fim: new Date().toISOString() });
  return responder(formularioAtual, 600);
}

/** RF 2.5: apenas as disciplinas cadastradas para o formulário, por semestre e nome. */
export function listarDisciplinasDoFormulario(formulario: Pick<Formulario, "disciplinaIds">): Promise<Disciplina[]> {
  return responder(
    disciplinas
      .filter((d) => formulario.disciplinaIds.includes(d.id))
      .sort((a, b) => a.semestre - b.semestre || a.nome.localeCompare(b.nome, "pt-BR")),
  );
}

/** RF 2.9, RF 2.10: respostas recebidas, com data de envio. */
export function listarRespostas(formularioId: string): Promise<RespostaFormulario[]> {
  return responder(respostasFormulario.filter((r) => r.formularioId === formularioId));
}

/** RF 2.14: resposta enviada pelo professor (ou null se ainda não respondeu). */
export function obterRespostaDoProfessor(formularioId: string, professorId: string): Promise<RespostaFormulario | null> {
  return responder(
    respostasFormulario.find((r) => r.formularioId === formularioId && r.professorId === professorId) ?? null,
  );
}

/**
 * RF 2.1, RF 2.12, RF 2.18: envia ou atualiza a resposta. Recusa se o formulário estiver
 * encerrado ou se a resposta já enviada não tiver a edição liberada pelo administrador.
 */
export async function enviarResposta(
  dados: Pick<RespostaFormulario, "formularioId" | "professorId" | "disponibilidade" | "interesses" | "prioridadesPeriodo">,
): Promise<RespostaFormulario> {
  if (formularioAtual.id === dados.formularioId && formularioAtual.status !== "aberto") {
    throw new Error("O período de respostas deste formulário está encerrado.");
  }
  const existente = respostasFormulario.find(
    (r) => r.formularioId === dados.formularioId && r.professorId === dados.professorId,
  );
  if (existente && !existente.edicaoLiberada) {
    throw new Error("Sua resposta já foi enviada. Para alterá-la, solicite a reabertura à coordenação.");
  }
  const resposta: RespostaFormulario = {
    id: existente?.id ?? `r${Date.now()}`,
    ...dados,
    enviadaEm: new Date().toISOString(),
    edicaoLiberada: false,
  };
  if (existente) Object.assign(existente, resposta);
  else respostasFormulario.push(resposta);
  return responder(resposta, 700);
}
