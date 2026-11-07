import { rotuloTurma } from "@/lib/horario";
import type { Aula, DiaSemana, EstruturaTurno, HorarioProfessor, ProfessorResumo, Solicitacao, StatusSolicitacao, Turno } from "@/types";
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