import type {
  DadosAcademicos,
  DiaSemana,
  Disciplina,
  EstruturaTurno,
  Formulario,
  HorarioBloco,
  ProfessorComSituacao,
  Turno,
} from "@/types";
import type { DadosLancamento } from "./formularios";
import { chamarApi } from "./api";

/*
   Área do administrador ligada ao back (rotas /admin)
   Abas Dados (CU-015 a CU-022) e Formulário (CU-023 a CU-028).
   Mesmo padrão de services/professor.ts (Adapter, ADR 010): cada
   função chama a rota, recebe o formato do back e CONVERTE para o
   formato que as telas já usam, então os componentes não mudam.
   As outras telas do administrador continuam nos services com mocks.
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

// Front -> back: as mesmas tabelas ao contrário
const DIAS_API = Object.fromEntries(
  Object.entries(DIAS).map(([api, dia]) => [dia, api]),
) as Record<DiaSemana, string>;
const TURNOS_API = Object.fromEntries(
  Object.entries(TURNOS).map(([api, turno]) => [turno, api]),
) as Record<Turno, string>;

/*
   Formatos que o back devolve
*/
type DadosApi = {
  turnos: {
    turno: string;
    dias: { id: number; diaSemana: string; emUso: boolean }[];
    blocos: {
      id: number;
      ordem: number;
      qtdAulas: number;
      emUso: boolean;
      aulas: { id: number; aula: number; inicio: string; fim: string }[];
    }[];
  }[];
  semestres: {
    id: number;
    numero: number;
    exclusaoBloqueada: boolean;
    turmas: { id: number; nome: string; turno: string; emUso: boolean }[];
  }[];
  materias: {
    id: number;
    nome: string;
    qtdAulasSemana: number;
    qtdProfessores: number;
    semestre: { numero: number };
    emUso: boolean;
  }[];
};

type FormularioApi = {
  id: number;
  nome: string;
  periodoLetivo: string | null;
  status: "NAO_INICIADO" | "ABERTO" | "ENCERRADO";
  inicio: string; // "AAAA-MM-DDTHH:MM", horário de Brasília
  fim: string;
  encerradoManualmente: boolean;
};

type ProfessorFormularioApi = {
  id: number;
  nome: string;
  dataEnvio: string | null;
};
type ProfessorVinculadoApi = { id: number; email: string; ativo: boolean };

/*
   Aba Dados: back -> front
   Cada bloco do back (ordem 1, 2, 3...) é um bloco ordinal da tela;
   K é o qtdAulas, único em todos os turnos (o back recusa tamanhos
   diferentes). O horário de relógio do bloco (início da 1ª aula e
   duração das aulas) fica guardado só para regravar: o back o exige.
*/
const horaCurta = (hora: string) => hora.slice(0, 5); // TIME do MySQL: "07:30:00"

function horarioDoBack(bloco: DadosApi["turnos"][number]["blocos"][number]): HorarioBloco | null {
  const aula = [...bloco.aulas].sort((a, b) => a.aula - b.aula)[0];
  if (!aula?.inicio || !aula.fim) return null;
  return { horaInicio: horaCurta(aula.inicio), duracaoAula: minutos(horaCurta(aula.fim)) - minutos(horaCurta(aula.inicio)) };
}

function converterDados(dados: DadosApi): DadosAcademicos {
  const porTurno = new Map(dados.turnos.map((t) => [TURNOS[t.turno], t]));
  // Sem nenhum bloco cadastrado, o tamanho padrão é 2 (o mesmo que a tela já usava)
  const comBlocos = dados.turnos.find((t) => t.blocos.length > 0);

  return {
    aulasPorBloco: comBlocos ? comBlocos.blocos[0].qtdAulas : 2,
    estruturas: (["manha", "tarde", "noite"] as Turno[]).map((turno) => {
      const doBack = porTurno.get(turno);
      const blocos = [...(doBack?.blocos ?? [])].sort((a, b) => a.ordem - b.ordem);
      return {
        turno,
        dias: (doBack?.dias ?? []).map((dia) => DIAS[dia.diaSemana]),
        diasEmUso: (doBack?.dias ?? []).filter((dia) => dia.emUso).map((dia) => DIAS[dia.diaSemana]),
        blocos: blocos.length,
        horarios: blocos.map(horarioDoBack),
        // Marca de uso de cada bloco, pelo índice ordinal (a ordem do back é o índice 1..B)
        blocosEmUso: blocos.filter((bloco) => bloco.emUso).map((bloco) => bloco.ordem),
      };
    }),
    semestres: dados.semestres.map((semestre) => ({
      id: String(semestre.id),
      numero: semestre.numero,
      exclusaoBloqueada: semestre.exclusaoBloqueada,
      turmaIds: semestre.turmas.map((turma) => String(turma.id)),
    })),
    turmas: dados.semestres.flatMap((semestre) =>
      semestre.turmas.map((turma) => ({
        id: String(turma.id),
        nome: turma.nome,
        semestre: semestre.numero,
        turno: TURNOS[turma.turno],
        emUso: turma.emUso,
      })),
    ),
    disciplinas: dados.materias.map(
      (materia): Disciplina => ({
        id: String(materia.id),
        nome: materia.nome,
        semestre: materia.semestre.numero,
        aulasPorSemana: materia.qtdAulasSemana,
        quantidadeProfessores: materia.qtdProfessores,
        emUso: materia.emUso,
      }),
    ),
  };
}

/*
   Aba Dados: front -> back
   O que a tela criou ainda não tem id do banco (ex.: "t1a-171…",
   "disc-171…"): vai como null, e o back cria.
*/
const idDoBanco = (id: string) => (/^\d+$/.test(id) ? Number(id) : null);

function minutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function converterBlocos(estrutura: EstruturaTurno) {
  return Array.from({ length: estrutura.blocos }, (_, i) => {
    const horario = estrutura.horarios?.[i];
    // Antes de ir ao servidor: o back exige o horário de cada bloco
    if (!horario)
      throw new Error(
        `Informe o horário do bloco ${i + 1} do turno da ${estrutura.turno === "manha" ? "manhã" : estrutura.turno}.`,
      );
    return { horaInicio: horario.horaInicio, duracaoAula: horario.duracaoAula };
  });
}

function paraOBack(dados: DadosAcademicos) {
  // A numeração é a posição no back (CU-018): excluir um do meio deixaria uma lacuna
  const numeros = dados.semestres
    .map((semestre) => semestre.numero)
    .sort((a, b) => a - b);
  if (numeros.some((numero, i) => numero !== i + 1))
    throw new Error("Apenas o último semestre pode ser excluído.");

  return {
    turnos: dados.estruturas.map((estrutura) => ({
      turno: TURNOS_API[estrutura.turno],
      dias: estrutura.dias.map((dia) => DIAS_API[dia]),
      // K global (RN-09): o mesmo em todo turno que tem blocos
      qtdAulas: estrutura.blocos > 0 ? dados.aulasPorBloco : 0,
      blocos: converterBlocos(estrutura),
    })),
    semestres: [...dados.semestres]
      .sort((a, b) => a.numero - b.numero)
      .map((semestre) => ({
        numero: semestre.numero,
        turmas: dados.turmas
          .filter((turma) => turma.semestre === semestre.numero)
          .map((turma) => ({
            id: idDoBanco(turma.id),
            nome: turma.nome,
            turno: TURNOS_API[turma.turno],
          })),
      })),
    materias: dados.disciplinas.map((disciplina) => ({
      id: idDoBanco(disciplina.id),
      nome: disciplina.nome,
      qtdAulasSemana: disciplina.aulasPorSemana,
      // RN-19: um único responsável; a disciplina criada na tela já vem com 1
      qtdProfessores: disciplina.quantidadeProfessores ?? 1,
      numeroSemestre: disciplina.semestre,
    })),
  };
}

/** RF 7: dias, blocos, semestres, turmas e disciplinas do administrador (GET /admin/dados). */
export async function obterDadosAcademicos(): Promise<DadosAcademicos> {
  return converterDados(await chamarApi<DadosApi>("/admin/dados"));
}

/**
 * "Salvar dados": o back grava a aba inteira, tudo ou nada (PUT /admin/dados), e
 * devolve o que ficou gravado, já com os ids do banco.
 */
export async function salvarDadosAcademicos(
  dados: DadosAcademicos,
): Promise<DadosAcademicos> {
  const corpo = paraOBack(dados);
  return converterDados(
    await chamarApi<DadosApi>("/admin/dados", { method: "PUT", body: corpo }),
  );
}

/*
   Aba Formulário
   O back guarda o instante no horário de Brasília (RNF 9), sem fuso
   ("2026-12-01T08:00"); a tela trabalha com ISO 8601.
*/
const deBrasilia = (dataHora: string) => `${dataHora}:00-03:00`;

/*
   Período letivo: o back grava "2027/1" (formato da geração do
   escalonador); a tela mostra e deduz "2027.1".
*/
const periodoParaOBack = (periodo: string) => periodo.replace(".", "/");
const periodoParaATela = (periodo: string) => periodo.replace("/", ".");

function paraBrasilia(iso: string) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(new Date(iso))
      .map((parte) => [parte.type, parte.value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`;
}

/*
   Status do back -> tela. O programado fica "aberto" com início futuro
   (a tela o mostra como agendado). O encerrado pela data também fica
   "aberto", com o término vencido: é o que a tela pode prorrogar
   (RF 2.8). Só o encerrado na mão é "encerrado".
*/
function converterFormulario(formulario: FormularioApi): Formulario {
  return {
    id: String(formulario.id),
    nome: formulario.nome,
    periodoLetivo: formulario.periodoLetivo
      ? periodoParaATela(formulario.periodoLetivo)
      : "—",
    status:
      formulario.status === "ENCERRADO" && formulario.encerradoManualmente
        ? "encerrado"
        : "aberto",
    inicio: deBrasilia(formulario.inicio),
    fim: deBrasilia(formulario.fim),
    // Edição = id do formulário no back, a mesma convenção do snapshot da geração (form_version = id_formulario)
    edicao: formulario.id,
    // Usados só na tela do professor (a rota da lista não devolve K, dias nem blocos)
    aulasPorBloco: 0,
    estruturas: [],
    disciplinaIds: [],
  };
}

type ListaFormulariosApi = { formularios: FormularioApi[] };

/** A tela mostra o formulário mais recente (o back lista do mais recente ao mais antigo). null: nenhum lançado. */
export async function obterFormularioAtual(): Promise<Formulario | null> {
  const { formularios } =
    await chamarApi<ListaFormulariosApi>("/admin/formularios");
  return formularios.length ? converterFormulario(formularios[0]) : null;
}

/** RF 2.7, RF 2.8 (CU-023): início agora ou passado abre na hora; futuro fica programado. */
export async function lancarFormulario(
  dados: DadosLancamento,
): Promise<Formulario> {
  const { formularios } = await chamarApi<ListaFormulariosApi>(
    "/admin/formularios",
    {
      method: "POST",
      body: {
        nome: dados.nome,
        periodoLetivo: periodoParaOBack(dados.periodoLetivo),
        dataInicio: paraBrasilia(dados.inicio),
        dataFim: paraBrasilia(dados.fim),
      },
    },
  );
  return converterFormulario(formularios[0]);
}

/**
 * RF 2.8 (CU-024): altera o período. Prorrogar um formulário encerrado pela data
 * volta a abri-lo (CU-023, /abrir), como a tela já fazia.
 */
export async function atualizarPrazo(
  id: string,
  prazo: Pick<Formulario, "inicio" | "fim">,
): Promise<Formulario> {
  const { formularios } = await chamarApi<ListaFormulariosApi>(
    `/admin/formularios/${id}/datas`,
    {
      method: "PUT",
      body: {
        dataInicio: paraBrasilia(prazo.inicio),
        dataFim: paraBrasilia(prazo.fim),
      },
    },
  );
  const atualizado = formularios.find(
    (formulario) => String(formulario.id) === id,
  )!;
  if (atualizado.status !== "ENCERRADO" || atualizado.encerradoManualmente)
    return converterFormulario(atualizado);

  const reaberto = await chamarApi<ListaFormulariosApi>(
    `/admin/formularios/${id}/abrir`,
    { method: "POST" },
  );
  return converterFormulario(
    reaberto.formularios.find((formulario) => String(formulario.id) === id)!,
  );
}

/** RF 2.7 (CU-025): encerra na hora; a partir daqui nenhuma resposta é aceita (RF 2.12). */
export async function encerrarFormulario(id: string): Promise<Formulario> {
  const { formularios } = await chamarApi<ListaFormulariosApi>(
    `/admin/formularios/${id}/encerrar`,
    { method: "POST" },
  );
  return converterFormulario(
    formularios.find((formulario) => String(formulario.id) === id)!,
  );
}

/*
   RF 2.10, RF 2.11 (CU-027, CU-028): quem respondeu e quem não
   respondeu. A rota do formulário traz nome e data de envio; o e-mail
   e a situação da conta vêm da lista de professores vinculados.
*/
export async function listarProfessoresDoFormulario(
  idFormulario: string,
): Promise<ProfessorComSituacao[]> {
  const [{ professores }, vinculados] = await Promise.all([
    chamarApi<{ professores: ProfessorFormularioApi[] }>(
      `/admin/formularios/${idFormulario}/professores`,
    ),
    chamarApi<{ professores: ProfessorVinculadoApi[] }>("/admin/professores"),
  ]);
  const porId = new Map(
    vinculados.professores.map((professor) => [professor.id, professor]),
  );

  return professores.map((professor) => {
    const vinculado = porId.get(professor.id);
    return {
      id: String(professor.id),
      nome: professor.nome,
      email: vinculado?.email ?? "",
      // Quem respondeu e depois foi desvinculado não está na lista de vinculados
      statusConta: vinculado && !vinculado.ativo ? "desativada" : "ativa",
      areas: [],
      criadoEm: "",
      formularioRespondidoEm: professor.dataEnvio
        ? deBrasilia(professor.dataEnvio.slice(0, 16))
        : null,
      pedidosAbertos: { horario: 0, formulario: 0 },
    };
  });
}
