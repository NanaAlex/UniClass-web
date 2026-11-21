import { alteracoesEstruturais, cargasIncompativeis } from "@/lib/dadosAcademicos";
import { configuracao, disciplinas, estruturasTurno, semestres, turmas } from "@/mocks/academico";
import { formularioAtual, respostasFormulario } from "@/mocks/formularios";
import type { DadosAcademicos, Disciplina, EstruturaTurno, Semestre, Turma, Turno } from "@/types";
import { esperar, responder } from "./simulacao";

export function listarEstruturasTurno(): Promise<EstruturaTurno[]> {
  return responder(estruturasTurno);
}

export function listarSemestres(): Promise<Semestre[]> {
  return responder(semestres);
}

export function listarTurmas(filtro: { semestre?: number; turno?: Turno } = {}): Promise<Turma[]> {
  return responder(turmas.filter((t) => (!filtro.semestre || t.semestre === filtro.semestre) && (!filtro.turno || t.turno === filtro.turno)));
}

/** RF 7.8: filtra por um ou mais semestres; lista vazia devolve todas. */
export function listarDisciplinas(filtro: { semestres?: number[] } = {}): Promise<Disciplina[]> {
  const selecionados = filtro.semestres ?? [];
  return responder(selecionados.length ? disciplinas.filter((d) => selecionados.includes(d.semestre)) : disciplinas);
}

const atuais = (): DadosAcademicos => ({ aulasPorBloco: configuracao.aulasPorBloco, estruturas: estruturasTurno, semestres, turmas, disciplinas });

/** RF 7: K global, dias e blocos, semestres, turmas e disciplinas do administrador. */
export function obterDadosAcademicos(): Promise<DadosAcademicos> {
  return responder(atuais());
}

/** RN-38: a mudança estrutural invalida a edição lançada do formulário; exige confirmação dupla na tela. */
export class ConfirmacaoEstruturalNecessaria extends Error {
  constructor(
    public mudancas: string[],
    public edicao: number,
    public respostas: number,
  ) {
    super("A alteração é estrutural e encerra a edição vigente do formulário.");
    this.name = "ConfirmacaoEstruturalNecessaria";
  }
}

/** A edição do formulário já foi lançada (recebe ou recebeu respostas). */
const edicaoLancada = () => formularioAtual.status === "aberto" || respostasFormulario.some((r) => r.formularioId === formularioAtual.id);

function substituir<T>(lista: T[], novos: T[]) {
  lista.splice(0, lista.length, ...structuredClone(novos));
}

/**
 * Grava os dados. Recusa carga que não seja múltipla de K (RN-13, CA-16). Com alteração estrutural
 * sobre uma edição lançada, só grava com `confirmarAlteracaoEstrutural`: então encerra a edição e
 * exclui as respostas dela (RN-38, CA-86 a CA-89); o administrador lança uma nova edição.
 */
export async function salvarDadosAcademicos(
  dados: DadosAcademicos,
  { confirmarAlteracaoEstrutural = false }: { confirmarAlteracaoEstrutural?: boolean } = {},
): Promise<{ dados: DadosAcademicos; edicaoEncerrada: boolean; respostasExcluidas: number }> {
  await esperar(700);
  const incompativeis = cargasIncompativeis(dados);
  if (incompativeis.length) {
    throw new Error(`Carga não múltipla de ${dados.aulasPorBloco} aulas por bloco: ${incompativeis.map((d) => d.nome).join(", ")}.`);
  }

  const mudancas = alteracoesEstruturais(atuais(), dados);
  const afetaEdicao = mudancas.length > 0 && edicaoLancada();
  const respostasDaEdicao = respostasFormulario.filter((r) => r.formularioId === formularioAtual.id).length;
  if (afetaEdicao && !confirmarAlteracaoEstrutural) throw new ConfirmacaoEstruturalNecessaria(mudancas, formularioAtual.edicao, respostasDaEdicao);

  configuracao.aulasPorBloco = dados.aulasPorBloco;
  substituir(estruturasTurno, dados.estruturas);
  substituir(semestres, dados.semestres);
  substituir(turmas, dados.turmas);
  substituir(disciplinas, dados.disciplinas);

  if (afetaEdicao) {
    Object.assign(formularioAtual, { status: "encerrado", fim: new Date().toISOString() });
    for (let i = respostasFormulario.length - 1; i >= 0; i--) {
      if (respostasFormulario[i].formularioId === formularioAtual.id) respostasFormulario.splice(i, 1);
    }
  }
  return { dados: structuredClone(atuais()), edicaoEncerrada: afetaEdicao, respostasExcluidas: afetaEdicao ? respostasDaEdicao : 0 };
}
