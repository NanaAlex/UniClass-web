import { rotuloTurma } from "@/lib/horario";
import type {
  Aula,
  ChaveHorario,
  DiaSemana,
  Disciplina,
  EstruturaTurno,
  Formulario,
  HorarioProfessor,
  NivelInteresse,
  ProfessorComSituacao,
  RespostaFormulario,
  Solicitacao,
  StatusSolicitacao,
  Turno,
} from "@/types";
import { obterDadosAcademicos, obterFormularioAtual } from "./administrador";
import { chamarApi, ErroApi } from "./api";
import { ErroNaoEncontrado } from "./simulacao";

/*
   Aba Professores do administrador ligada ao back (CU-005, CU-007 a CU-011)
   Mesmo padrão de services/administrador.ts (Adapter, ADR 010): cada
   função chama a rota e converte para ProfessorComSituacao, o formato
   que as telas já usam. services/professores.ts (mocks) continua para
   a tela Horários, que ainda usa ids simulados.
*/

/*
   Formatos que o back devolve
   Datas em "AAAA-MM-DDTHH:MM:SS", horário de Brasília.
*/
type ProfessorApi = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  dataVinculo: string | null;
  dataResposta: string | null;
  respostaPendente: boolean;
  solicitouAlteracaoFormulario: boolean;
  solicitouAlteracaoHorario: boolean;
};

type ConviteApi = {
  idConvite: number;
  email: string;
  tipo: "CRIACAO_CONTA" | "VINCULO";
  dataEnvio: string;
  dataExpiracao: string;
};

type ResultadoConviteApi = { email: string; enviado: boolean; tipo?: ConviteApi["tipo"]; error?: string };

const deBrasilia = (dataHora: string) => `${dataHora}-03:00`;

/*
   Id do convidado na tela: "convite-" + e-mail em base64url.
   O id_convite do back muda a cada reenvio; o e-mail não, então o
   perfil aberto continua o mesmo depois de "Reenviar convite".
*/
const PREFIXO_CONVITE = "convite-";

function idDoConvite(email: string) {
  const bytes = new TextEncoder().encode(email);
  const base64 = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
  return PREFIXO_CONVITE + base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function emailDoConvite(id: string): string | null {
  if (!id.startsWith(PREFIXO_CONVITE)) return null;
  try {
    const base64 = id.slice(PREFIXO_CONVITE.length).replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/*
   Back -> front
   Telefone, áreas e foto não existem no banco (fora desta task).
   Os pedidos abertos vêm como indicadores; a tela só confere "> 0".
*/
function deProfessor(professor: ProfessorApi): ProfessorComSituacao {
  return {
    id: String(professor.id),
    nome: professor.nome,
    email: professor.email,
    statusConta: professor.ativo ? "ativa" : "desativada",
    areas: [],
    criadoEm: professor.dataVinculo ? deBrasilia(professor.dataVinculo) : "",
    formularioRespondidoEm: professor.dataResposta ? deBrasilia(professor.dataResposta) : null,
    respostaPendente: professor.respostaPendente,
    pedidosAbertos: {
      horario: professor.solicitouAlteracaoHorario ? 1 : 0,
      formulario: professor.solicitouAlteracaoFormulario ? 1 : 0,
    },
  };
}

/** Convidado sem nome: de quem já tem conta, o nome só aparece depois do aceite (RF 6.4). */
function deConvite(convite: ConviteApi): ProfessorComSituacao {
  return {
    id: idDoConvite(convite.email),
    nome: "",
    email: convite.email,
    statusConta: "convidado",
    areas: [],
    criadoEm: deBrasilia(convite.dataEnvio),
    formularioRespondidoEm: null,
    respostaPendente: false,
    pedidosAbertos: { horario: 0, formulario: 0 },
  };
}

/** RF 8.2: professores vinculados e convites pendentes. Busca e filtros (RF 8.3, RF 8.4) continuam na tela. */
export async function listarProfessores(): Promise<ProfessorComSituacao[]> {
  const { professores, convites } = await chamarApi<{ professores: ProfessorApi[]; convites?: ConviteApi[] }>(
    "/admin/professores",
  );
  return [...professores.map(deProfessor), ...(convites ?? []).map(deConvite)];
}

/** RF 8.6 (CU-011). O convidado não tem rota própria: vem da lista. */
export async function obterProfessor(id: string): Promise<ProfessorComSituacao> {
  const email = emailDoConvite(id);
  if (email !== null) {
    const convidado = (await listarProfessores()).find((p) => p.id === id);
    if (!convidado) throw new ErroNaoEncontrado("Professor", id);
    return convidado;
  }

  if (!/^[1-9]\d*$/.test(id)) throw new ErroNaoEncontrado("Professor", id);
  try {
    const { professor } = await chamarApi<{ professor: ProfessorApi }>(`/admin/professores/${id}`);
    return deProfessor(professor);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) throw new ErroNaoEncontrado("Professor", id);
    throw erro;
  }
}

/** RF 8.10 / RF 1.8 (CU-008) */
export async function alterarStatusConta(id: string, ativa: boolean): Promise<ProfessorComSituacao> {
  await chamarApi(`/admin/professores/${id}/status`, { method: "PUT", body: { ativo: ativa } });
  return obterProfessor(id);
}

export type ResultadoConvite = { professor: ProfessorComSituacao; jaTinhaConta: boolean };
export type ConviteRecusado = { email: string; motivo: string };
export type ResultadoConvites = { enviados: ResultadoConvite[]; recusados: ConviteRecusado[] };

/**
 * RF 8.1, RF 1.13 (CU-005, CU-007): quem já tem conta recebe convite de vínculo.
 * Com todos recusados, o back responde 400 e o erro traz o motivo.
 */
export async function convidarProfessores(emails: string[]): Promise<ResultadoConvites> {
  const { resultados } = await chamarApi<{ resultados: ResultadoConviteApi[] }>("/admin/convites", {
    method: "POST",
    body: { emails },
  });
  const agora = new Date().toISOString();
  return {
    enviados: resultados
      .filter((r) => r.enviado)
      .map((r) => ({
        jaTinhaConta: r.tipo === "VINCULO",
        professor: { ...deConvite({ idConvite: 0, email: r.email, tipo: "CRIACAO_CONTA", dataEnvio: "", dataExpiracao: "" }), criadoEm: agora },
      })),
    recusados: resultados.filter((r) => !r.enviado).map((r) => ({ email: r.email, motivo: r.error ?? "Não enviado" })),
  };
}

/** RF 5.9: um novo convite para o mesmo e-mail invalida o anterior (RNF 8). */
export async function reenviarConvite(id: string): Promise<void> {
  const email = emailDoConvite(id);
  if (email === null) throw new ErroNaoEncontrado("Convite", id);
  await chamarApi("/admin/convites", { method: "POST", body: { emails: [email] } });
}

/** Protótipo "Editar foto": sem coluna no banco, a foto é um endereço local do navegador (some ao recarregar). */
export async function atualizarFotoProfessor(id: string, fotoUrl: string): Promise<ProfessorComSituacao> {
  return { ...(await obterProfessor(id)), fotoUrl };
}

/*
   Abas do perfil: Formulário (CU-012, RF 8.7) e Solicitações (RF 8.9)
*/
const DIAS: Record<string, DiaSemana> = {
  SEGUNDA: "seg",
  TERCA: "ter",
  QUARTA: "qua",
  QUINTA: "qui",
  SEXTA: "sex",
  SABADO: "sab",
};

const TURNOS: Record<string, Turno> = { MANHA: "manha", TARDE: "tarde", NOITE: "noite" };

const STATUS: Record<string, StatusSolicitacao> = {
  PENDENTE: "pendente",
  APROVADA: "aprovada",
  REJEITADA: "rejeitada",
};

type RespostaApi = {
  status: "ENVIADA" | "LIBERADA_PARA_ALTERACAO";
  dataEnvio: string;
  disponibilidades: { diaSemana: string; turno: string; posicao: number; disponivel: boolean }[];
  preferenciasTurno: { diaSemana: string; turno: string; nota: number }[];
  interesses: { idMateria: number; nota: number }[];
};

type SolicitacoesApi = {
  formulario: {
    id: number;
    motivo: string;
    status: string;
    dataSolicitacao: string;
    dataAnalise: string | null;
    resposta: string | null;
  }[];
  horario: {
    id: number;
    aula: {
      materia: string;
      dia: string;
      turno: string;
      posicao: number;
      turma: { nome: string; numeroSemestre: number };
    } | null;
    motivo: string;
    dataEnvio: string;
    dataLeitura: string | null;
    resposta: string | null;
  }[];
};

/** Resposta do back -> RespostaFormulario (mesmas chaves "noite:seg:3" da área do professor). */
function converterResposta(resposta: RespostaApi, formularioId: string, professorId: string): RespostaFormulario {
  return {
    id: formularioId,
    formularioId,
    professorId,
    enviadaEm: resposta.dataEnvio,
    disponibilidade: resposta.disponibilidades
      .filter((item) => item.disponivel)
      .map((item) => `${TURNOS[item.turno]}:${DIAS[item.diaSemana]}:${item.posicao}` as ChaveHorario),
    interesses: resposta.interesses.map((item) => ({
      disciplinaId: String(item.idMateria),
      nivel: item.nota as NivelInteresse,
    })),
    prioridadesPeriodo: Object.fromEntries(
      resposta.preferenciasTurno.map((item) => [`${TURNOS[item.turno]}:${DIAS[item.diaSemana]}`, item.nota as NivelInteresse]),
    ),
    edicaoLiberada: resposta.status === "LIBERADA_PARA_ALTERACAO",
  };
}

export type RespostaDoProfessor = {
  formulario: Formulario;
  resposta: RespostaFormulario | null;
  disciplinas: Disciplina[];
};

/**
 * RF 8.7 (CU-012): resposta ao formulário mais recente do admin, com a grade e as
 * disciplinas da aba Dados (o formulário cobre o curso inteiro). Sem formulário
 * lançado, a aba mostra "Formulário ainda não publicado"; sem resposta, os avisos dela.
 */
export async function obterRespostaDoProfessor(professorId: string): Promise<RespostaDoProfessor> {
  const [atual, dados] = await Promise.all([obterFormularioAtual(), obterDadosAcademicos()]);
  const disciplinas = dados.disciplinas;
  const estruturas = dados.estruturas.filter((e) => e.dias.length > 0 && e.blocos.length > 0);
  const agora = new Date().toISOString();

  const formulario: Formulario = atual
    ? { ...atual, estruturas, disciplinaIds: disciplinas.map((d) => d.id) }
    : { id: "", nome: "", periodoLetivo: "—", status: "rascunho", inicio: agora, fim: agora, estruturas, disciplinaIds: [] };

  // Convidado ainda não tem conta, então não tem resposta
  if (!atual || !/^[1-9]\d*$/.test(professorId)) return { formulario, resposta: null, disciplinas };

  try {
    const resposta = await chamarApi<RespostaApi>(
      `/admin/professores/${professorId}/formularios/${atual.id}/resposta`,
    );
    return { formulario, resposta: converterResposta(resposta, atual.id, professorId), disciplinas };
  } catch (erro) {
    // CU-012 A1: 404 = o professor não respondeu este formulário
    if (erro instanceof ErroApi && erro.status === 404) return { formulario, resposta: null, disciplinas };
    throw erro;
  }
}

/*
   Os pedidos vêm de duas tabelas com ids próprios: o id da tela leva o
   tipo ("formulario-12", "horario-5") para não repetir.
*/
const numeroDoPedido = (solicitacao: Solicitacao) => solicitacao.id.slice(solicitacao.tipo.length + 1);

/** RF 8.9: pedidos de alteração do formulário e do horário feitos pelo professor. */
export async function listarSolicitacoesDoProfessor(professorId: string): Promise<Solicitacao[]> {
  if (!/^[1-9]\d*$/.test(professorId)) return []; // convidado

  const { formulario, horario } = await chamarApi<SolicitacoesApi>(`/admin/professores/${professorId}/solicitacoes`);
  const professor = { id: professorId, nome: "" }; // a aba não mostra o nome

  return [
    ...formulario.map(
      (pedido): Solicitacao => ({
        id: `formulario-${pedido.id}`,
        tipo: "formulario",
        status: STATUS[pedido.status] ?? "pendente",
        professor,
        descricao: pedido.motivo,
        criadaEm: pedido.dataSolicitacao,
        respondidaEm: pedido.dataAnalise ?? undefined,
        resposta: pedido.resposta ?? undefined,
      }),
    ),
    ...horario.map(
      (pedido): Solicitacao => ({
        id: `horario-${pedido.id}`,
        tipo: "horario",
        status: "pendente", // descritivo (RF 3.4): o que muda é a leitura
        professor,
        descricao: pedido.motivo,
        criadaEm: pedido.dataEnvio,
        lidaEm: pedido.dataLeitura ?? undefined,
        resposta: pedido.resposta ?? undefined,
        aula: pedido.aula
          ? {
              dia: DIAS[pedido.aula.dia],
              posicao: pedido.aula.posicao,
              disciplina: pedido.aula.materia,
              turma: rotuloTurma({
                id: "",
                nome: pedido.aula.turma.nome,
                semestre: pedido.aula.turma.numeroSemestre,
                turno: TURNOS[pedido.aula.turno],
              }),
            }
          : undefined,
      }),
    ),
  ];
}

/** RF 9.6 (CU-037): aprovar libera a resposta para um novo envio; recusar exige o motivo (o back avisa). */
export async function responderSolicitacao(
  solicitacao: Solicitacao,
  decisao: "aprovada" | "rejeitada",
  resposta: string,
): Promise<Solicitacao> {
  await chamarApi(`/admin/solicitacoes/formulario/${numeroDoPedido(solicitacao)}`, {
    method: "PUT",
    body: { decisao: decisao === "aprovada" ? "APROVADA" : "REJEITADA", resposta },
  });
  return { ...solicitacao, status: decisao, respondidaEm: new Date().toISOString(), resposta: resposta.trim() || undefined };
}

/** RF 9.5, RF 3.4: o pedido de horário não tem aceite; o admin o marca como lido. */
export async function marcarComoLida(solicitacao: Solicitacao, resposta: string): Promise<Solicitacao> {
  await chamarApi(`/admin/solicitacoes/horario/${numeroDoPedido(solicitacao)}/lida`, {
    method: "PUT",
    body: { resposta },
  });
  return { ...solicitacao, lidaEm: new Date().toISOString(), resposta: resposta.trim() || undefined };
}

/*
   Aba Horário do perfil (CU-013, RF 8.8)
*/
type AulaApi = {
  idAula: number;
  idGeracao: number;
  geradaEm: string;
  numeroSemestre: number;
  idTurma: number;
  turma: string;
  idMateria: number;
  materia: string;
  aulasPorSemana: number;
  qtdProfessores: number;
  dia: string;
  turno: string;
  posicao: number;
  bloqueada: boolean;
};

/** Mesma conversão de services/professor.ts; a disciplina não tem turno no back, usa o da turma. */
function converterAula(aula: AulaApi): Aula {
  const turno = TURNOS[aula.turno];
  return {
    id: String(aula.idAula),
    dia: DIAS[aula.dia],
    turno,
    posicao: aula.posicao,
    disciplina: {
      id: String(aula.idMateria),
      nome: aula.materia,
      semestre: aula.numeroSemestre,
      aulasPorSemana: aula.aulasPorSemana,
      quantidadeProfessores: aula.qtdProfessores,
      turno,
    },
    turma: { id: String(aula.idTurma), nome: aula.turma, semestre: aula.numeroSemestre, turno },
    bloqueada: aula.bloqueada,
  };
}

export type HorarioDoProfessor = { horario: HorarioProfessor; estruturas: EstruturaTurno[] };

/**
 * RF 8.8: em cada semestre, a prévia (inclusive a ainda oculta para o professor) ou,
 * sem prévia, o definitivo. A grade usa os dias e blocos da aba Dados.
 */
export async function obterHorarioDoProfessor(professorId: string): Promise<HorarioDoProfessor> {
  const vazio: HorarioProfessor = { aulas: [], previa: false, atualizadoEm: null };
  const comAulas = /^[1-9]\d*$/.test(professorId); // convidado não tem aulas

  const [horario, dados] = await Promise.all([
    comAulas
      ? chamarApi<{ previa: AulaApi[]; definitivo: AulaApi[] }>(`/admin/professores/${professorId}/horario`)
      : Promise.resolve({ previa: [], definitivo: [] }),
    obterDadosAcademicos(),
  ]);
  const estruturas = dados.estruturas.filter((e) => e.dias.length > 0 && e.blocos.length > 0);

  const semestresComPrevia = new Set(horario.previa.map((aula) => aula.numeroSemestre));
  const aulas = [
    ...horario.previa,
    ...horario.definitivo.filter((aula) => !semestresComPrevia.has(aula.numeroSemestre)),
  ];
  if (aulas.length === 0) return { horario: vazio, estruturas };

  return {
    horario: {
      aulas: aulas.map(converterAula),
      previa: horario.previa.length > 0,
      atualizadoEm: aulas.map((aula) => aula.geradaEm).sort().at(-1) ?? null,
      geracaoDaAula: Object.fromEntries(aulas.map((aula) => [String(aula.idAula), String(aula.idGeracao)])),
    },
    estruturas,
  };
}
