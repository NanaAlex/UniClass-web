import { disciplinas, estruturasTurno, turmas } from "@/mocks/academico";
import { formularioAtual, respostasFormulario } from "@/mocks/formularios";
import { execucoes, travasDoPeriodo } from "@/mocks/geracoes";
import { professores } from "@/mocks/usuarios";
import { aplicarAcao, type ContextoEdicao } from "@/lib/edicaoGrade";
import { motivoParaNaoPublicar, temGradeValidada } from "@/lib/geracao";
import { simularRegeneracao } from "@/lib/simulacaoGeracao";
import type { AcaoEdicao, Execucao, HorarioProfessor, ProfessorResumo, RespostaFormulario, Trava } from "@/types";
import { ErroNaoEncontrado, esperar, responder } from "./simulacao";

// Geração do horário pelo motor (contrato das rotas /admin/geracoes do backend). Sem a API, as
// execuções vêm de mocks/geracoes e a regeneração com travas é simulada localmente
// (lib/simulacaoGeracao), sem nunca declarar ótimo.

/** Professores ativos com resposta enviada ao formulário vigente: os participantes (RN-20, RN-37). */
function participantes(): RespostaFormulario[] {
  const ativos = new Set(professores.filter((p) => p.statusConta === "ativa").map((p) => p.id));
  return respostasFormulario.filter((r) => r.formularioId === formularioAtual.id && ativos.has(r.professorId));
}

export type ContextoGeracao = {
  periodoLetivo: string;
  ativos: number;
  enviados: number;
  pendentes: ProfessorResumo[];
};

/** RN-36, RN-37: ativos, respostas enviadas e pendentes da edição vigente do formulário. */
export function obterContextoGeracao(): Promise<ContextoGeracao> {
  const ativos = professores.filter((p) => p.statusConta === "ativa");
  const enviaram = new Set(participantes().map((r) => r.professorId));
  return responder({
    periodoLetivo: formularioAtual.periodoLetivo.replace(".", "/"),
    ativos: ativos.length,
    enviados: enviaram.size,
    pendentes: ativos.filter((p) => !enviaram.has(p.id)).map(({ id, nome, fotoUrl }) => ({ id, nome, fotoUrl })),
  });
}

/** Execuções do período, da mais recente para a mais antiga. */
export function listarExecucoes(): Promise<Execucao[]> {
  return responder([...execucoes].sort((a, b) => b.iniciadaEm.localeCompare(a.iniciadaEm)));
}

export function obterExecucao(id: string): Promise<Execucao> {
  const execucao = execucoes.find((e) => e.id === id);
  if (!execucao) return Promise.reject(new ErroNaoEncontrado("Execução", id));
  return responder(execucao);
}

export class ConfirmacaoGeracaoNecessaria extends Error {
  constructor(public pendentes: ProfessorResumo[]) {
    super("Há professores ativos sem resposta enviada; confirme a geração antecipada.");
    this.name = "ConfirmacaoGeracaoNecessaria";
  }
}

/**
 * POST /admin/geracoes. Com professores pendentes, exige confirmação explícita (RN-37, CA-83). A
 * execução nasce EM_PROCESSAMENTO e é concluída em segundo plano (prazo único de 600 s no motor).
 */
export async function gerarHorario({ confirmarGeracaoAntecipada }: { confirmarGeracaoAntecipada: boolean }): Promise<Execucao> {
  const contexto = await obterContextoGeracao();
  if (contexto.pendentes.length > 0 && !confirmarGeracaoAntecipada) throw new ConfirmacaoGeracaoNecessaria(contexto.pendentes);
  if (execucoes.some((e) => e.status === "EM_PROCESSAMENTO")) throw new Error("Já existe uma geração em processamento; aguarde a conclusão.");

  const base = [...execucoes].filter(temGradeValidada).sort((a, b) => b.iniciadaEm.localeCompare(a.iniciadaEm))[0];
  const inicio = new Date();
  const id = `sim-${inicio.getTime()}`;
  const emProcessamento: Execucao = {
    ...structuredClone(base ?? execucoes[0]),
    id,
    status: "EM_PROCESSAMENTO",
    iniciadaEm: inicio.toISOString(),
    concluidaEm: null,
    publicadaEm: null,
    grade: null,
    simulada: true,
  };
  execucoes.push(emProcessamento);

  setTimeout(() => {
    const indice = execucoes.findIndex((e) => e.id === id);
    if (indice < 0) return;
    if (!base) {
      execucoes[indice] = { ...emProcessamento, status: "ERRO_EXECUCAO", concluidaEm: new Date().toISOString() };
      return;
    }
    execucoes[indice] = simularRegeneracao(
      {
        base,
        travas: [...travasDoPeriodo],
        respostas: participantes(),
        turmas,
        disciplinas,
        estruturas: estruturasTurno,
        contexto: { ativos: contexto.ativos, enviados: contexto.enviados, pendentes: contexto.pendentes.length, antecipada: contexto.pendentes.length > 0 },
      },
      id,
      inicio,
    );
  }, 2500);

  return responder(emProcessamento, 500);
}

export type DadosEdicao = Omit<ContextoEdicao, "execucao" | "travas">;

/** O que a tela precisa para conferir cada gesto de edição antes de enviá-lo (a API repete a conferência). */
export function obterDadosEdicao(): Promise<DadosEdicao> {
  return responder({ respostas: participantes(), turmas, disciplinas, estruturas: estruturasTurno });
}

/** Travas do período (RN-50: não há travas herdadas de outro período). */
export function listarTravas(): Promise<Trava[]> {
  return responder(travasDoPeriodo);
}

/**
 * POST /admin/geracoes/:id/edicoes. Aplica as ações em ordem, tudo ou nada: se uma for recusada,
 * nenhuma trava é gravada (a API repete as verificações da tela: RN-64, CA-185).
 */
export async function aplicarEdicoes(execucaoId: string, acoes: AcaoEdicao[]): Promise<Trava[]> {
  await esperar(500);
  const execucao = execucoes.find((e) => e.id === execucaoId);
  if (!execucao || !temGradeValidada(execucao)) throw new Error("Só uma grade completa e validada pode ser base de edição.");
  const criadas: Trava[] = [];
  for (const acao of acoes) {
    const ctx: ContextoEdicao = {
      execucao,
      travas: [...travasDoPeriodo, ...criadas],
      respostas: participantes(),
      turmas,
      disciplinas,
      estruturas: estruturasTurno,
    };
    const r = aplicarAcao(ctx, acao);
    if (!r.ok) throw new Error(r.motivo);
    criadas.push(...r.travas);
  }
  travasDoPeriodo.push(...criadas);
  return structuredClone(criadas);
}

/** POST /admin/geracoes/:id/publicar: só OTIMA_COMPROVADA com grade validada (RN-29, CA-195). */
export async function publicarExecucao(id: string): Promise<Execucao> {
  await esperar(600);
  const execucao = execucoes.find((e) => e.id === id);
  if (!execucao) throw new ErroNaoEncontrado("Execução", id);
  const motivo = motivoParaNaoPublicar(execucao);
  if (motivo) throw new Error(motivo);
  // A publicação anterior continua no histórico; a vigente é a mais recente (RN-29)
  execucao.publicadaEm = new Date().toISOString();
  return structuredClone(execucao);
}

/** Grade vigente: a última execução publicada. */
export function obterExecucaoVigente(): Promise<Execucao | null> {
  const publicadas = execucoes.filter((e) => e.publicadaEm).sort((a, b) => (b.publicadaEm ?? "").localeCompare(a.publicadaEm ?? ""));
  return responder(publicadas[0] ?? null);
}

/** Horário do professor: projeção da grade publicada, com todas as coordenadas (RN-69, CA-190). */
export async function obterHorarioDoProfessor(professorId: string): Promise<HorarioProfessor> {
  const vigente = await obterExecucaoVigente();
  const projecao = vigente?.grade?.porProfessor.find((p) => p.professorId === professorId);
  return {
    posicoes: projecao?.posicoes ?? [],
    publicadoEm: vigente?.publicadaEm ?? null,
    aulasPorBloco: vigente?.aulasPorBloco ?? 2,
  };
}
