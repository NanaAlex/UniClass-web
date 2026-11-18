import { aulasDoBloco, chaveBloco } from "@/lib/horario";
import type { AulaReferenciada, BlocoGrade, ChaveBloco, DiaSemana, Disciplina, EstruturaTurno, Formulario, HorarioProfessor, NivelInteresse, RespostaFormulario, ProfessorResumo, Solicitacao, StatusSolicitacao, Turma, Turno } from "@/types";
import { chamarApi, ErroApi } from "./api";

/* 
   Área do professor ligada ao back (rotas /professor)
   As telas do administrador continuam usando os services com
   mocks (horarios.ts, solicitacoes.ts, academico.ts). Por isso
   as funções do professor ficam separadas aqui.

   Cada função busca o dado no formato do back e CONVERTE para o
   formato que as telas usam (padrão Adapter, ADR 010). O back
   trabalha por AULA (slot, posição contínua no turno); as telas
   trabalham por BLOCO ordinal de K aulas (RN-10, RN-11, RN-16).
   As conversões entre os dois ficam todas aqui, explícitas.
*/

const DIAS: Record<string, DiaSemana> = {
  SEGUNDA: "seg",
  TERCA: "ter",
  QUARTA: "qua",
  QUINTA: "qui",
  SEXTA: "sex",
  SABADO: "sab",
};

const TURNOS: Record<string, Turno> = {
  MANHA: "manha",
  TARDE: "tarde",
  NOITE: "noite",
};

// O front não tem "cancelada"; um pedido cancelado aparece como rejeitado
const STATUS: Record<string, StatusSolicitacao> = {
  PENDENTE: "pendente",
  APROVADA: "aprovada",
  REJEITADA: "rejeitada",
  CANCELADA: "rejeitada",
};

/* 
   Formatos que o back devolve
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

type EstruturaApi = {
  turno: string;
  dias: string[];
  blocos: { ordem: number; aulas: { posicao: number; inicio: string; fim: string }[] }[];
};

type SolicitacaoHorarioApi = {
  id: number;
  aula: { idAula: number; materia: string; turma: string; dia: string; posicao: number } | null;
  motivo: string;
  status: string;
  dataEnvio: string;
};

type FormularioAtualApi = {
  id: number;
  nome: string;
  status: "NAO_INICIADO" | "ABERTO" | "ENCERRADO";
  dataInicio: string | null;
  dataFim: string | null;
  respondido: boolean;
};

type DadosFormularioApi = {
  dias: { id: number; diaSemana: string; turno: string }[];
  // bloco: índice ordinal do bloco no turno (bloco_aula.ordem); posicao: aula contando o turno inteiro
  slots: { id: number; turno: string; bloco: number; posicao: number; inicio: string; fim: string }[];
  materias: { id: number; nome: string; aulasPorSemana: number; qtdProfessores: number; numeroSemestre: number }[];
};

type RespostaApi = {
  status: "ENVIADA" | "LIBERADA_PARA_ALTERACAO";
  dataEnvio: string;
  disponibilidades: { diaSemana: string; turno: string; posicao: number; disponivel: boolean }[];
  preferenciasTurno: { diaSemana: string; turno: string; nota: number }[];
  interesses: { idMateria: number; nota: number }[];
};

type SolicitacaoFormularioApi = {
  id: number;
  motivo: string;
  status: string;
  dataSolicitacao: string;
  dataAnalise: string | null;
};

/* 
   O que a tela de formulário recebe
   formulario = null: a coordenação ainda não lançou nenhum
*/
export type MeuFormulario = {
  formulario: Formulario | null;
  resposta: RespostaFormulario | null;
  disciplinas: Disciplina[];
};

/* 
   O que a tela de horário recebe: a grade por blocos, a estrutura
   dos turnos, as disciplinas e turmas das aulas (para os nomes) e,
   para situar os pedidos de alteração, o bloco de cada aula.
*/
export type MeuHorario = {
  horario: HorarioProfessor;
  estruturas: EstruturaTurno[];
  disciplinas: Disciplina[];
  turmas: Turma[];
  blocoDaAula: Map<string, { turno: Turno; indice: number }>;
};

/* 
   Busca a prévia ou o definitivo
   O back responde 404 quando não há horário (CU-052); aqui o
   404 vira lista vazia, e a tela mostra "Horário indisponível".
 */
async function buscarAulas(tipo: "previa" | "definitivo"): Promise<AulaApi[]> {
  try {
    const { aulas } = await chamarApi<{ aulas: AulaApi[] }>(`/professor/horario/${tipo}`);
    return aulas;
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return [];
    throw erro;
  }
}

/* 
   Dias e blocos de cada turno (RF 2.3)
   São as colunas e linhas da grade do horário. Cada bloco do back
   (ordem) é um bloco ordinal; K = aulas por bloco.
*/
async function buscarEstruturas(): Promise<EstruturaApi[]> {
  const { estruturas } = await chamarApi<{ estruturas: EstruturaApi[] }>("/professor/horario/estruturas");
  return estruturas;
}

export async function listarMinhasEstruturas(): Promise<EstruturaTurno[]> {
  return (await buscarEstruturas()).map((estrutura) => ({
    turno: TURNOS[estrutura.turno],
    dias: estrutura.dias.map((dia) => DIAS[dia]),
    blocos: estrutura.blocos.length,
  }));
}

/*
   Aula do back -> bloco da grade (RN-10): o bloco i reúne as aulas
   ((i−1)·K+1) até i·K do turno, logo o índice do bloco de uma aula é
   ⌈posição/K⌉. Aulas do mesmo dia, turno e bloco formam um bloco só.
*/
function blocosDasAulas(aulas: AulaApi[], K: number, professorId: string): BlocoGrade[] {
  const blocos = new Map<string, BlocoGrade>();
  for (const aula of aulas) {
    const indice = Math.ceil(aula.posicao / K);
    const chave = `${aula.dia}|${aula.turno}|${indice}`;
    if (blocos.has(chave)) continue;
    blocos.set(chave, {
      dia: DIAS[aula.dia],
      turno: TURNOS[aula.turno],
      indice,
      aulas: aulasDoBloco(K, indice),
      turmaId: String(aula.idTurma),
      disciplinaId: String(aula.idMateria),
      professorId,
      travas: [],
    });
  }
  return Array.from(blocos.values());
}

/*
   Horário do professor (RF 3.12, RF 3.16)
   CU-041: se a coordenação liberou uma prévia, mostra a prévia
   (ela é a versão mais nova, ainda em análise).
   CU-049: sem prévia liberada, mostra o horário definitivo.
   O back identifica o professor pelo token; o professorId só
   preenche o responsável de cada bloco.
*/
export async function obterMeuHorario(professorId: string): Promise<MeuHorario> {
  const [previa, estruturasApi] = await Promise.all([buscarAulas("previa"), buscarEstruturas()]);
  const aulas = previa.length > 0 ? previa : await buscarAulas("definitivo");

  // K: o back exige o mesmo tamanho de bloco em todos os turnos (RN-09)
  const tamanhos = new Set(estruturasApi.flatMap((e) => e.blocos.map((b) => b.aulas.length)));
  if (tamanhos.size > 1) throw new Error("Os blocos têm quantidades diferentes de aulas; não é possível montar a grade (RN-09).");
  const K = tamanhos.size ? Array.from(tamanhos)[0] : 0;
  if (aulas.length > 0 && K === 0) throw new Error("Há aulas no horário, mas nenhum bloco cadastrado para situá-las.");

  const disciplinas = new Map<string, Disciplina>();
  const turmas = new Map<string, Turma>();
  const blocoDaAula = new Map<string, { turno: Turno; indice: number }>();
  for (const aula of aulas) {
    const turno = TURNOS[aula.turno];
    disciplinas.set(String(aula.idMateria), {
      id: String(aula.idMateria),
      nome: aula.materia,
      semestre: aula.numeroSemestre,
      aulasPorSemana: aula.aulasPorSemana,
      quantidadeProfessores: aula.qtdProfessores,
    });
    turmas.set(String(aula.idTurma), { id: String(aula.idTurma), nome: aula.turma, semestre: aula.numeroSemestre, turno });
    blocoDaAula.set(String(aula.idAula), { turno, indice: Math.ceil(aula.posicao / K) });
  }

  return {
    horario: {
      posicoes: aulas.length ? blocosDasAulas(aulas, K, professorId) : [],
      publicadoEm: aulas.map((aula) => aula.geradaEm).sort().at(-1) ?? null,
      aulasPorBloco: K,
    },
    estruturas: estruturasApi.map((estrutura) => ({
      turno: TURNOS[estrutura.turno],
      dias: estrutura.dias.map((dia) => DIAS[dia]),
      blocos: estrutura.blocos.length,
    })),
    disciplinas: Array.from(disciplinas.values()),
    turmas: Array.from(turmas.values()),
    blocoDaAula,
  };
}

/* 
   Pedidos de alteração de horário do professor (RF 9.1)
   O back não devolve o professor (é sempre quem está logado).
   O nome fica vazio porque, na tela do professor, a lista não
   mostra quem pediu (ItemSolicitacao: mostrarProfessor = false).
   O back cita a aula (dia e posição, sem turno); o bloco vem do
   horário carregado (blocoDaAula). Sem ele, o pedido fica sem
   bloco, em vez de um bloco presumido.
 */
export async function listarMinhasSolicitacoesHorario(
  professorId: string,
  blocoDaAula: Map<string, { turno: Turno; indice: number }> = new Map(),
): Promise<Solicitacao[]> {
  const { solicitacoes } = await chamarApi<{ solicitacoes: SolicitacaoHorarioApi[] }>("/professor/horario/solicitacoes");

  return solicitacoes.map((solicitacao) => {
    const bloco = solicitacao.aula ? blocoDaAula.get(String(solicitacao.aula.idAula)) : undefined;
    return {
      id: String(solicitacao.id),
      tipo: "horario",
      status: STATUS[solicitacao.status] ?? "pendente",
      professor: { id: professorId, nome: "" },
      descricao: solicitacao.motivo,
      criadaEm: solicitacao.dataEnvio,
      aula:
        solicitacao.aula && bloco
          ? {
              dia: DIAS[solicitacao.aula.dia],
              turno: bloco.turno,
              indice: bloco.indice,
              disciplina: solicitacao.aula.materia,
              turma: solicitacao.aula.turma,
            }
          : undefined,
    };
  });
}

/* 
   Envia um pedido de alteração de horário (RF 3.4, RF 9.3, CU-053)
   O back só aceita pedidos sobre uma prévia liberada e identifica a
   aula pelo id (idAula) e a geração (idGeracao). Devolve a
   solicitação já no formato da tela, para entrar na lista sem
   recarregar.
*/
export async function solicitarAlteracaoHorario(dados: {
  professor: ProfessorResumo;
  idAula: string;
  idGeracao: string;
  aula: AulaReferenciada;
  descricao: string;
}): Promise<Solicitacao> {
  const { idSolicitacao } = await chamarApi<{ idSolicitacao: number }>("/professor/horario/solicitacoes", {
    method: "POST",
    body: {
      idGeracao: Number(dados.idGeracao),
      idAula: Number(dados.idAula),
      motivo: dados.descricao,
    },
  });

  return {
    id: String(idSolicitacao),
    tipo: "horario",
    status: "pendente",
    professor: dados.professor,
    descricao: dados.descricao.trim(),
    criadaEm: new Date().toISOString(),
    aula: dados.aula,
  };
}

/* 
   Dias e aulas do formulário -> estruturas da grade
   Agrupa por turno; cada valor de "bloco" é um bloco ordinal
   (1..B, sem lacunas, RN-35) e todos têm K aulas (RN-09). Fora
   disso, a conversão para blocos não é segura: a tela recebe o erro.
*/
function montarEstruturas(dados: DadosFormularioApi): { estruturas: EstruturaTurno[]; aulasPorBloco: number } {
  const estruturas: EstruturaTurno[] = [];
  const tamanhos = new Set<number>();

  for (const turnoApi of ["MANHA", "TARDE", "NOITE"]) {
    const dias = dados.dias.filter((dia) => dia.turno === turnoApi).map((dia) => DIAS[dia.diaSemana]);
    const slots = dados.slots.filter((slot) => slot.turno === turnoApi);
    if (dias.length === 0 || slots.length === 0) continue;

    const ordens = Array.from(new Set(slots.map((slot) => slot.bloco))).sort((a, b) => a - b);
    if (ordens.some((ordem, i) => ordem !== i + 1)) {
      throw new Error("Os blocos do formulário não estão numerados 1, 2, 3... sem lacunas; avise a coordenação.");
    }
    for (const ordem of ordens) tamanhos.add(slots.filter((slot) => slot.bloco === ordem).length);

    estruturas.push({ turno: TURNOS[turnoApi], dias, blocos: ordens.length });
  }

  if (tamanhos.size > 1) throw new Error("Os blocos do formulário não têm todos a mesma quantidade de aulas; avise a coordenação.");
  return { estruturas, aulasPorBloco: tamanhos.size ? Array.from(tamanhos)[0] : 0 };
}

/* 
   Matéria do back -> Disciplina do front
   A matéria não tem turno no banco (migration 003): o turno é da turma.
*/
function converterMateria(materia: DadosFormularioApi["materias"][number]): Disciplina {
  return {
    id: String(materia.id),
    nome: materia.nome,
    semestre: materia.numeroSemestre,
    aulasPorSemana: materia.aulasPorSemana,
    quantidadeProfessores: materia.qtdProfessores,
  };
}

/* 
   Disponibilidade por aula (back) -> blocos selecionados (tela)
   RN-11, RN-16: o bloco só volta como selecionado se TODAS as suas
   aulas estiverem disponíveis naquele dia — a mesma regra que o
   snapshot do motor usa (snapshotMysql). Seleção parcial não vira
   bloco inteiro.
*/
function blocosSelecionados(dados: DadosFormularioApi, resposta: RespostaApi): ChaveBloco[] {
  const marcadas = new Set(
    resposta.disponibilidades.filter((item) => item.disponivel).map((item) => `${item.turno}|${item.diaSemana}|${item.posicao}`),
  );
  const chaves: ChaveBloco[] = [];

  for (const dia of dados.dias) {
    const posicoesDoBloco = new Map<number, number[]>();
    for (const slot of dados.slots.filter((s) => s.turno === dia.turno)) {
      posicoesDoBloco.set(slot.bloco, [...(posicoesDoBloco.get(slot.bloco) ?? []), slot.posicao]);
    }
    for (const [indice, posicoes] of Array.from(posicoesDoBloco).sort((a, b) => a[0] - b[0])) {
      if (posicoes.every((posicao) => marcadas.has(`${dia.turno}|${dia.diaSemana}|${posicao}`))) {
        chaves.push(chaveBloco(TURNOS[dia.turno], DIAS[dia.diaSemana], indice));
      }
    }
  }

  return chaves;
}

/*
   Resposta do back -> RespostaFormulario do front
   - disponibilidade: os blocos inteiramente disponíveis, "noite:seg:2"
   - prioridadesPeriodo: nota de cada dia/turno, "noite:seg"
*/
function converterResposta(resposta: RespostaApi, dados: DadosFormularioApi, formularioId: string, professorId: string): RespostaFormulario {
  return {
    id: formularioId, // cada professor tem uma resposta por formulário
    formularioId,
    professorId,
    enviadaEm: resposta.dataEnvio,
    disponibilidade: blocosSelecionados(dados, resposta),
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

/* 
   Formulário atual, resposta e matérias (RF 2.1, RF 2.3, RF 2.5, RF 2.14)
   1. GET /professor/formularios/atual       -> qual é o formulário
   2. GET /professor/formularios/:id          -> dias, aulas e matérias
   3. GET /professor/formularios/:id/resposta -> só se já respondeu
   Sem formulário, devolve tudo vazio e a tela mostra "Indisponível".
*/
export async function carregarMeuFormulario(professorId: string): Promise<MeuFormulario> {
  const { formulario: atual } = await chamarApi<{ formulario: FormularioAtualApi | null }>("/professor/formularios/atual");
  if (!atual) return { formulario: null, resposta: null, disciplinas: [] };

  const dados = await chamarApi<DadosFormularioApi>(`/professor/formularios/${atual.id}`);
  const { estruturas, aulasPorBloco } = montarEstruturas(dados);
  const disciplinas = dados.materias.map(converterMateria);

  const inicio = atual.dataInicio ?? new Date().toISOString();

  const formulario: Formulario = {
    id: String(atual.id),
    nome: atual.nome,
    periodoLetivo: "—", // a rota do formulário atual não devolve o período letivo
    // Edição = id do formulário no back, a mesma convenção do snapshot da geração (form_version = id_formulario)
    edicao: atual.id,
    // NAO_INICIADO vira "aberto" com início no futuro: a tela mostra "Indisponível"
    status: atual.status === "ENCERRADO" ? "encerrado" : "aberto",
    inicio,
    fim: atual.dataFim ?? inicio,
    aulasPorBloco,
    estruturas,
    disciplinaIds: disciplinas.map((disciplina) => disciplina.id),
  };

  const resposta = atual.respondido
    ? converterResposta(
        await chamarApi<RespostaApi>(`/professor/formularios/${atual.id}/resposta`),
        dados,
        formulario.id,
        professorId,
      )
    : null;

  return { formulario, resposta, disciplinas };
}

/* 
   Envia a resposta (RF 2.2, RF 2.4, RF 2.6, CU-033)
   O back trabalha com ids (idDiaLetivo, idSlot, idMateria) e a
   tela com chaves de bloco ("noite:seg:2"). Por isso busca de novo
   os dados do formulário para achar o id de cada dia e de cada aula.
   Manda TODOS os horários da grade: as aulas dos blocos marcados com
   disponivel = true e as outras com false ("não posso", RF 4.5).
   RN-16: a aula é disponível quando o SEU BLOCO foi selecionado
   (slot.bloco, índice ordinal no turno) — nunca pela posição da aula,
   que só coincide com o índice do bloco quando K = 1.
   Se o back recusar (prazo, 409 já respondeu...), o erro com a
   mensagem dele aparece no AssistenteFormulario.
*/
export async function enviarMinhaResposta(
  dados: Pick<RespostaFormulario, "formularioId" | "disponibilidade" | "interesses" | "prioridadesPeriodo">,
): Promise<void> {
  const formulario = await chamarApi<DadosFormularioApi>(`/professor/formularios/${dados.formularioId}`);
  const blocosMarcados = new Set<ChaveBloco>(dados.disponibilidade);

  // "noite:seg" -> id do dia letivo
  const idDoPeriodo = new Map(formulario.dias.map((dia) => [`${TURNOS[dia.turno]}:${DIAS[dia.diaSemana]}`, dia.id]));

  // Cada dia com cada aula do mesmo turno
  const disponibilidades = formulario.dias.flatMap((dia) =>
    formulario.slots
      .filter((slot) => slot.turno === dia.turno)
      .map((slot) => ({
        idDiaLetivo: dia.id,
        idSlot: slot.id,
        disponivel: blocosMarcados.has(chaveBloco(TURNOS[dia.turno], DIAS[dia.diaSemana], slot.bloco)),
      })),
  );

  const preferenciasTurno = Object.entries(dados.prioridadesPeriodo)
    .filter(([periodo]) => idDoPeriodo.has(periodo))
    .map(([periodo, nota]) => ({ idDiaLetivo: idDoPeriodo.get(periodo), nota }));

  const interesses = dados.interesses.map((item) => ({ idMateria: Number(item.disciplinaId), nota: item.nivel }));

  await chamarApi(`/professor/formularios/${dados.formularioId}/resposta`, {
    method: "POST",
    body: { disponibilidades, preferenciasTurno, interesses },
  });
}

/* 
   Pedidos para alterar a resposta do formulário (RF 2.15, RF 2.16)
   Mesmo motivo do horário: o nome do professor fica vazio.
*/
export async function listarMinhasSolicitacoesFormulario(professorId: string): Promise<Solicitacao[]> {
  const { solicitacoes } = await chamarApi<{ solicitacoes: SolicitacaoFormularioApi[] }>("/professor/solicitacoes");

  return solicitacoes.map((solicitacao) => ({
    id: String(solicitacao.id),
    tipo: "formulario",
    status: STATUS[solicitacao.status] ?? "pendente",
    professor: { id: professorId, nome: "" },
    descricao: solicitacao.motivo,
    criadaEm: solicitacao.dataSolicitacao,
    respondidaEm: solicitacao.dataAnalise ?? undefined,
  }));
}

/* 
   Envia o pedido de alteração da resposta (RF 2.15)
   Devolve a solicitação já no formato da tela, para entrar na
   lista sem recarregar.
*/
export async function solicitarAlteracaoFormulario(dados: {
  formularioId: string;
  professor: ProfessorResumo;
  descricao: string;
}): Promise<Solicitacao> {
  const { idSolicitacao } = await chamarApi<{ idSolicitacao: number }>(
    `/professor/formularios/${dados.formularioId}/solicitacoes`,
    { method: "POST", body: { motivo: dados.descricao } },
  );

  return {
    id: String(idSolicitacao),
    tipo: "formulario",
    status: "pendente",
    professor: dados.professor,
    descricao: dados.descricao.trim(),
    criadaEm: new Date().toISOString(),
  };
}
