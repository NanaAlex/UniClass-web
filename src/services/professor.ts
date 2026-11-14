import { rotuloTurma } from "@/lib/horario";
import type { Aula, ChaveHorario, DiaSemana, Disciplina, EstruturaTurno, Formulario, HorarioProfessor, NivelInteresse, RespostaFormulario, ProfessorResumo, Solicitacao, StatusSolicitacao, Turno } from "@/types";
import { chamarApi, ErroApi } from "./api";

/* 
   Área do professor ligada ao back (rotas /professor)
   As telas do administrador continuam usando os services com
   mocks (horarios.ts, solicitacoes.ts, academico.ts). Por isso
   as funções do professor ficam separadas aqui.

   Cada função busca o dado no formato do back e CONVERTE para o
   formato que as telas já usam (padrão Adapter, ADR 010). Assim
   os componentes não precisam mudar.
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
   Aula do back -> Aula do front
   Os ids viram texto, como em todo o front.
*/
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
      turno, // a matéria não tem turno no banco (migration 003); usa o da turma
    },
    turma: {
      id: String(aula.idTurma),
      nome: aula.turma,
      semestre: aula.numeroSemestre,
      turno,
    },
    bloqueada: aula.bloqueada,
  };
}

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
   Horário do professor (RF 3.12, RF 3.16)
   CU-041: se a coordenação liberou uma prévia, mostra a prévia
   (ela é a versão mais nova, ainda em análise).
   CU-049: sem prévia liberada, mostra o horário definitivo.
   geracaoDaAula guarda a geração de cada aula: o pedido de
   alteração precisa dela (idGeracao no POST).
*/
export async function obterMeuHorario(): Promise<HorarioProfessor> {
  const previa = await buscarAulas("previa");
  const aulas = previa.length > 0 ? previa : await buscarAulas("definitivo");

  return {
    aulas: aulas.map(converterAula),
    previa: previa.length > 0,
    atualizadoEm: aulas.map((aula) => aula.geradaEm).sort().at(-1) ?? null,
    geracaoDaAula: Object.fromEntries(aulas.map((aula) => [String(aula.idAula), String(aula.idGeracao)])),
  };
}

/* 
   Dias e blocos de cada turno (RF 2.3)
   São as colunas e linhas da grade do horário.
*/
export async function listarMinhasEstruturas(): Promise<EstruturaTurno[]> {
  const { estruturas } = await chamarApi<{ estruturas: EstruturaApi[] }>("/professor/horario/estruturas");

  return estruturas.map((estrutura) => ({
    turno: TURNOS[estrutura.turno],
    dias: estrutura.dias.map((dia) => DIAS[dia]),
    blocos: estrutura.blocos.map((bloco) => ({ aulas: bloco.aulas })),
  }));
}

/* 
   Pedidos de alteração de horário do professor (RF 9.1)
   O back não devolve o professor (é sempre quem está logado).
   O nome fica vazio porque, na tela do professor, a lista não
   mostra quem pediu (ItemSolicitacao: mostrarProfessor = false).
 */
export async function listarMinhasSolicitacoesHorario(professorId: string): Promise<Solicitacao[]> {
  const { solicitacoes } = await chamarApi<{ solicitacoes: SolicitacaoHorarioApi[] }>("/professor/horario/solicitacoes");

  return solicitacoes.map((solicitacao) => ({
    id: String(solicitacao.id),
    tipo: "horario",
    status: STATUS[solicitacao.status] ?? "pendente",
    professor: { id: professorId, nome: "" },
    descricao: solicitacao.motivo,
    criadaEm: solicitacao.dataEnvio,
    aula: solicitacao.aula
      ? {
          dia: DIAS[solicitacao.aula.dia],
          posicao: solicitacao.aula.posicao,
          disciplina: solicitacao.aula.materia,
          turma: solicitacao.aula.turma,
        }
      : undefined,
  }));
}

/* 
   Envia um pedido de alteração de horário (RF 3.4, RF 9.3, CU-053)
   O back só aceita pedidos sobre uma prévia liberada. Devolve a
   solicitação já no formato da tela, para entrar na lista sem
   recarregar.
*/
export async function solicitarAlteracaoHorario(dados: {
  professor: ProfessorResumo;
  aula: Aula;
  idGeracao: string;
  descricao: string;
}): Promise<Solicitacao> {
  const { idSolicitacao } = await chamarApi<{ idSolicitacao: number }>("/professor/horario/solicitacoes", {
    method: "POST",
    body: {
      idGeracao: Number(dados.idGeracao),
      idAula: Number(dados.aula.id),
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
    aula: {
      dia: dados.aula.dia,
      posicao: dados.aula.posicao,
      disciplina: dados.aula.disciplina.nome,
      turma: rotuloTurma(dados.aula.turma),
    },
  };
}

/* 
   Dias e aulas do formulário -> estruturas da grade
   Agrupa por turno, e as aulas de cada turno por bloco.
*/
function montarEstruturas(dados: DadosFormularioApi): EstruturaTurno[] {
  const estruturas: EstruturaTurno[] = [];

  for (const turnoApi of ["MANHA", "TARDE", "NOITE"]) {
    const dias = dados.dias.filter((dia) => dia.turno === turnoApi).map((dia) => DIAS[dia.diaSemana]);
    const slots = dados.slots.filter((slot) => slot.turno === turnoApi);
    if (dias.length === 0 || slots.length === 0) continue;

    // Um bloco para cada valor diferente de "bloco", na ordem em que vieram
    const ordens = Array.from(new Set(slots.map((slot) => slot.bloco)));
    const blocos = ordens.map((ordem) => ({
      aulas: slots
        .filter((slot) => slot.bloco === ordem)
        .map((slot) => ({ posicao: slot.posicao, inicio: slot.inicio, fim: slot.fim })),
    }));

    estruturas.push({ turno: TURNOS[turnoApi], dias, blocos });
  }

  return estruturas;
}

/* 
   Matéria do back -> Disciplina do front
   A matéria não tem turno no banco (migration 003); como o
   formulário não usa esse campo, fica o primeiro turno da grade.
*/
function converterMateria(materia: DadosFormularioApi["materias"][number], turno: Turno): Disciplina {
  return {
    id: String(materia.id),
    nome: materia.nome,
    semestre: materia.numeroSemestre,
    aulasPorSemana: materia.aulasPorSemana,
    quantidadeProfessores: materia.qtdProfessores,
    turno,
  };
}

/* 
   Resposta do back -> RespostaFormulario do front
   - disponibilidade: só os horários marcados como disponíveis,
     no formato "noite:seg:3"
   - prioridadesPeriodo: nota de cada dia/turno, "noite:seg"
*/
function converterResposta(resposta: RespostaApi, formularioId: string, professorId: string): RespostaFormulario {
  return {
    id: formularioId, // cada professor tem uma resposta por formulário
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
  const estruturas = montarEstruturas(dados);
  const disciplinas = dados.materias.map((materia) => converterMateria(materia, estruturas[0]?.turno ?? "noite"));

  const inicio = atual.dataInicio ?? new Date().toISOString();

  const formulario: Formulario = {
    id: String(atual.id),
    nome: atual.nome,
    periodoLetivo: "—", // o formulário não tem período letivo no banco
    // NAO_INICIADO vira "aberto" com início no futuro: a tela mostra "Indisponível"
    status: atual.status === "ENCERRADO" ? "encerrado" : "aberto",
    inicio,
    fim: atual.dataFim ?? inicio,
    estruturas,
    disciplinaIds: disciplinas.map((disciplina) => disciplina.id),
  };

  const resposta = atual.respondido
    ? converterResposta(
        await chamarApi<RespostaApi>(`/professor/formularios/${atual.id}/resposta`),
        formulario.id,
        professorId,
      )
    : null;

  return { formulario, resposta, disciplinas };
}

/* 
   Envia a resposta (RF 2.2, RF 2.4, RF 2.6, CU-033)
   O back trabalha com ids (idDiaLetivo, idSlot, idMateria) e a
   tela com chaves ("noite:seg:3"). Por isso busca de novo os
   dados do formulário para achar o id de cada dia e de cada aula.
   Manda TODOS os horários da grade: os marcados com
   disponivel = true e os outros com false ("não posso", RF 4.5).
   Se o back recusar (prazo, 409 já respondeu...), o erro com a
   mensagem dele aparece no AssistenteFormulario.
*/
export async function enviarMinhaResposta(
  dados: Pick<RespostaFormulario, "formularioId" | "disponibilidade" | "interesses" | "prioridadesPeriodo">,
): Promise<void> {
  const formulario = await chamarApi<DadosFormularioApi>(`/professor/formularios/${dados.formularioId}`);
  const marcados = new Set(dados.disponibilidade);

  // "noite:seg" -> id do dia letivo
  const idDoPeriodo = new Map(formulario.dias.map((dia) => [`${TURNOS[dia.turno]}:${DIAS[dia.diaSemana]}`, dia.id]));

  // Cada dia com cada aula do mesmo turno
  const disponibilidades = formulario.dias.flatMap((dia) =>
    formulario.slots
      .filter((slot) => slot.turno === dia.turno)
      .map((slot) => ({
        idDiaLetivo: dia.id,
        idSlot: slot.id,
        disponivel: marcados.has(`${TURNOS[dia.turno]}:${DIAS[dia.diaSemana]}:${slot.posicao}` as ChaveHorario),
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