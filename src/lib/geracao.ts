import type { VarianteEtiqueta } from "@/components/ui/Etiqueta";
import type {
  BlocoGrade,
  Diagnostico,
  DiaSemana,
  Execucao,
  GradeTurma,
  Justificativa,
  NaturezaEvidencia,
  PainelGeracao,
  ProvaNivel,
  RespostaFormulario,
  StatusExecucao,
  Trava,
  Turno,
} from "@/types";
import { chaveBloco } from "./horario";

// Regras puras da geração do horário (RN-27, RN-59, RN-60, ET-12) e o mapeamento da resposta do
// backend (GET /admin/geracoes/:runId) para os tipos do front.

export const LIMITE_EXECUCAO_SEGUNDOS = 600;

export const rotulosStatus: Record<StatusExecucao, { rotulo: string; variante: VarianteEtiqueta }> = {
  OTIMA_COMPROVADA: { rotulo: "Ótima comprovada", variante: "sucesso" },
  VALIDA_NAO_OTIMA: { rotulo: "Válida, sem prova de ótimo", variante: "aviso" },
  INVIAVEL_COMPROVADA: { rotulo: "Inviável (comprovado)", variante: "perigo" },
  INCONCLUSIVA: { rotulo: "Inconclusiva", variante: "aviso" },
  ENTRADA_INVALIDA: { rotulo: "Entrada inválida", variante: "perigo" },
  ERRO_EXECUCAO: { rotulo: "Erro de execução", variante: "perigo" },
  EM_PROCESSAMENTO: { rotulo: "Em processamento", variante: "info" },
};

export const nomesNivel: Record<number, string> = {
  1: "Custo primário de preferências",
  2: "Maior média de penalidade por aula",
  3: "Amplitude entre as médias dos professores",
  4: "Desempate canônico",
};

export const rotulosNatureza: Record<NaturezaEvidencia, string> = {
  comprovada: "Comprovado",
  hipotese_preliminar: "Hipótese preliminar",
  falha_tecnica: "Falha técnica",
};

export const temGradeValidada = (e: Execucao) => e.grade !== null && (e.status === "OTIMA_COMPROVADA" || e.status === "VALIDA_NAO_OTIMA");

/** Só a grade ótima comprovada e ainda não publicada pode ser publicada (RN-29, CA-195). */
export function motivoParaNaoPublicar(e: Execucao): string | null {
  if (e.publicadaEm) return "Esta grade já foi publicada.";
  if (e.status === "VALIDA_NAO_OTIMA") {
    return "A grade é válida, mas não teve o ótimo comprovado. A publicação de grade não ótima depende de autorização institucional ainda não homologada.";
  }
  if (!temGradeValidada(e) || e.status !== "OTIMA_COMPROVADA") return "Só uma grade completa, validada e com ótimo comprovado pode ser publicada.";
  return null;
}

// ---- Mapeamento da resposta do backend -------------------------------------------------------

const DIA: Record<string, DiaSemana> = { SEGUNDA: "seg", TERCA: "ter", QUARTA: "qua", QUINTA: "qui", SEXTA: "sex", SABADO: "sab" };
const TURNO: Record<string, Turno> = { MANHA: "manha", TARDE: "tarde", NOITE: "noite" };

type JsonPosicao = { dia: string; turno: string; indice: number; aulas: number[]; turma_id: string | null; disciplina_id: string | null; professor_id: string | null; travas: string[] };

function posicao(p: JsonPosicao): BlocoGrade {
  return { dia: DIA[p.dia], turno: TURNO[p.turno], indice: p.indice, aulas: p.aulas, turmaId: p.turma_id, disciplinaId: p.disciplina_id, professorId: p.professor_id, travas: p.travas };
}

/** Formato (snake_case) de GET /admin/geracoes/:runId no backend. Campos ausentes viram null. */
export type JsonExecucao = {
  painel: {
    run_id: string;
    periodo_letivo_id: string;
    status: string;
    total_turmas_abrangidas?: number | null;
    turmas_com_grade_validada?: number | null;
    professores_distintos_com_aulas_atribuidas?: number | null;
    total_professores_participantes?: number | null;
    professores_ativos?: number | null;
    respostas_enviadas?: number | null;
    pendentes_de_formulario?: number | null;
    geracao_antecipada_confirmada?: boolean | null;
    custo_primario_total?: number | null;
    parcelas_penalidade?: { dia_turno: number; disciplina: number } | null;
    max_media_docente?: string | null;
    amplitude_medias?: string | null;
    duracao_execucao_segundos?: number | null;
    tempo_primeira_grade_segundos?: number | null;
    limite_execucao_segundos?: number | null;
    motivo_termino?: string | null;
    prova_por_nivel?: { nivel: number; objetivo: string; comprovado: boolean; estado: string }[] | null;
    justificativa?: { titulo: string; texto: string; niveis_comprovados: number[]; niveis_nao_comprovados: number[] } | null;
    diagnosticos?: {
      codigo: string;
      categoria: string;
      severidade: string;
      etapa: string;
      mensagem: string;
      natureza_evidencia: string;
      entidades?: Record<string, unknown>;
    }[];
    publicavel?: boolean;
  };
  iniciada_em: string;
  concluida_em?: string | null;
  publicada_em?: string | null;
  grade_base_run_id?: string | null;
  grade?: {
    K: number;
    por_turma: { turma_id: string; semestre_id: string; turno: string; posicoes: JsonPosicao[] }[];
    por_professor: { professor_id: string; posicoes: JsonPosicao[] }[];
  } | null;
};

/** Resposta de GET /admin/geracoes/:runId → Execucao. Ao integrar com a API, basta trocar a origem do JSON. */
export function mapearExecucao(json: JsonExecucao, extras: Partial<Execucao> = {}): Execucao {
  const p = json.painel;
  const painel: PainelGeracao = {
    totalTurmas: p.total_turmas_abrangidas ?? null,
    turmasComGradeValidada: p.turmas_com_grade_validada ?? null,
    professoresComAulas: p.professores_distintos_com_aulas_atribuidas ?? null,
    participantes: p.total_professores_participantes ?? null,
    professoresAtivos: p.professores_ativos ?? null,
    respostasEnviadas: p.respostas_enviadas ?? null,
    pendentes: p.pendentes_de_formulario ?? null,
    geracaoAntecipadaConfirmada: Boolean(p.geracao_antecipada_confirmada),
    custoTotal: p.custo_primario_total ?? null,
    parcelas: p.parcelas_penalidade ? { diaTurno: p.parcelas_penalidade.dia_turno, disciplina: p.parcelas_penalidade.disciplina } : null,
    piorMedia: p.max_media_docente ?? null,
    amplitude: p.amplitude_medias ?? null,
    duracaoSegundos: p.duracao_execucao_segundos ?? null,
    tempoPrimeiraGradeSegundos: p.tempo_primeira_grade_segundos ?? null,
    limiteSegundos: p.limite_execucao_segundos ?? null,
    motivoTermino: p.motivo_termino ?? null,
    provas: p.prova_por_nivel
      ? p.prova_por_nivel.map((x) => ({ nivel: x.nivel as ProvaNivel["nivel"], objetivo: x.objetivo, comprovado: x.comprovado, estado: x.estado }))
      : null,
    justificativa: p.justificativa
      ? { titulo: p.justificativa.titulo, texto: p.justificativa.texto, niveisComprovados: p.justificativa.niveis_comprovados, niveisNaoComprovados: p.justificativa.niveis_nao_comprovados }
      : null,
    diagnosticos: (p.diagnosticos ?? []).map(
      (d): Diagnostico => ({
        codigo: d.codigo,
        categoria: d.categoria,
        severidade: d.severidade as Diagnostico["severidade"],
        etapa: d.etapa,
        mensagem: d.mensagem,
        natureza: d.natureza_evidencia as NaturezaEvidencia,
        entidades: d.entidades ?? {},
      }),
    ),
    publicavel: Boolean(p.publicavel),
  };
  const grade = json.grade;
  return {
    id: p.run_id,
    periodoLetivo: p.periodo_letivo_id,
    status: p.status as StatusExecucao,
    iniciadaEm: json.iniciada_em,
    concluidaEm: json.concluida_em ?? null,
    publicadaEm: json.publicada_em ?? null,
    gradeBaseId: json.grade_base_run_id ?? null,
    simulada: false,
    aulasPorBloco: grade?.K ?? 2,
    painel,
    grade: grade
      ? {
          porTurma: grade.por_turma.map((t): GradeTurma => ({
            turmaId: t.turma_id,
            semestre: Number(String(t.semestre_id).replace(/D/g, "")),
            turno: TURNO[t.turno],
            posicoes: t.posicoes.map(posicao),
          })),
          porProfessor: grade.por_professor.map((x) => ({ professorId: x.professor_id, posicoes: x.posicoes.map(posicao) })),
        }
      : null,
    travasAplicadas: [],
    ...extras,
  };
}

// ---- Custo e equidade (CP-02, CP-03, CP-08), usados pela simulação local ---------------------

const PHI: Record<number, number> = { 5: 0, 4: 1, 3: 3, 2: 6, 1: 10 };

function mdc(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : mdc(b, a % b);
}

function fracao(num: number, den: number) {
  const g = mdc(num, den) || 1;
  const n = num / g;
  const d = den / g;
  return d === 1 ? String(n) : `${n}/${d}`;
}

/** C = Σ K·[3·φ(nota dia/turno) + 2·φ(nota disciplina)] por bloco ocupado; médias racionais exatas. */
export function custosDaGrade(porTurma: GradeTurma[], respostas: RespostaFormulario[], K: number) {
  const porProf = new Map<string, { custo: number; aulas: number }>();
  let diaTurno = 0;
  let disciplina = 0;
  for (const t of porTurma) {
    for (const b of t.posicoes) {
      if (!b.disciplinaId || !b.professorId) continue;
      const r = respostas.find((x) => x.professorId === b.professorId);
      const notaD = r?.interesses.find((i) => i.disciplinaId === b.disciplinaId)?.nivel ?? 1;
      const notaDT = r?.prioridadesPeriodo[`${b.turno}:${b.dia}`] ?? 1;
      const cDT = K * 3 * PHI[notaDT];
      const cD = K * 2 * PHI[notaD];
      diaTurno += cDT;
      disciplina += cD;
      const acc = porProf.get(b.professorId) ?? { custo: 0, aulas: 0 };
      acc.custo += cDT + cD;
      acc.aulas += K;
      porProf.set(b.professorId, acc);
    }
  }
  const medias = Array.from(porProf.values()).map((v) => ({ n: v.custo, d: v.aulas }));
  const maior = medias.reduce<{ n: number; d: number } | null>((m, x) => (!m || x.n * m.d > m.n * x.d ? x : m), null);
  const menor = medias.reduce<{ n: number; d: number } | null>((m, x) => (!m || x.n * m.d < m.n * x.d ? x : m), null);
  return {
    total: diaTurno + disciplina,
    parcelas: { diaTurno, disciplina },
    professoresComAulas: porProf.size,
    piorMedia: maior ? fracao(maior.n, maior.d) : null,
    amplitude: maior && menor ? fracao(maior.n * menor.d - menor.n * maior.d, maior.d * menor.d) : null,
  };
}

// ---- Justificativa do status (RN-60) -----------------------------------------------------------

export function justificativaDoStatus(status: StatusExecucao, provas: ProvaNivel[], diagnosticos: Diagnostico[], simulada: boolean): Justificativa | null {
  const comprovados = provas.filter((p) => p.comprovado).map((p) => p.nivel);
  const pendentes = provas.filter((p) => !p.comprovado).map((p) => p.nivel);
  const lista = (ns: number[]) => ns.map((n) => nomesNivel[n].toLowerCase()).join("; ");
  if (status === "VALIDA_NAO_OTIMA") {
    return {
      titulo: "Grade completa e válida, sem prova de ótimo",
      texto:
        (simulada
          ? "Simulação do front: sem o motor Prolog, a grade-base foi recomposta com as travas e conferida localmente. "
          : "A grade cumpre todas as obrigações e foi aprovada pela validação independente. ") +
        `Não comprovados: ${lista(pendentes)}. A publicação de grade não ótima depende de autorização institucional ainda não homologada.`,
      niveisComprovados: comprovados,
      niveisNaoComprovados: pendentes,
    };
  }
  if (status === "INCONCLUSIVA") {
    return {
      titulo: "Execução inconclusiva",
      texto:
        "Nenhuma grade completa foi confirmada e também não houve prova de inviabilidade. Isso não significa que montar a grade seja impossível." +
        (diagnosticos.length ? ` ${diagnosticos[0].mensagem}` : ""),
      niveisComprovados: [],
      niveisNaoComprovados: [1, 2, 3, 4],
    };
  }
  return null;
}

/** Chave "turma|turno:dia:indice" para localizar posições. */
export const chavePosicao = (turmaId: string, b: { turno: Turno; dia: DiaSemana; indice: number }) => `${turmaId}|${chaveBloco(b.turno, b.dia, b.indice)}`;

/** Travas que incidem sobre a posição da turma (ocupação ou vaga). */
export function travasDaPosicao(travas: Trava[], turmaId: string, b: { turno: Turno; dia: DiaSemana; indice: number }) {
  return travas.filter(
    (t) => (t.tipo === "ocupacao" || t.tipo === "vaga_turma") && t.turmaId === turmaId && t.coordenada &&
      t.coordenada.dia === b.dia && t.coordenada.turno === b.turno && t.coordenada.indice === b.indice,
  );
}

// ---- Rótulos do painel (RN-59) ----------------------------------------------------------------

export const tipoAvisoStatus: Record<StatusExecucao, "sucesso" | "aviso" | "perigo" | "info"> = {
  OTIMA_COMPROVADA: "sucesso",
  VALIDA_NAO_OTIMA: "aviso",
  INVIAVEL_COMPROVADA: "perigo",
  INCONCLUSIVA: "aviso",
  ENTRADA_INVALIDA: "perigo",
  ERRO_EXECUCAO: "perigo",
  EM_PROCESSAMENTO: "info",
};

export function rotuloMotivoTermino(motivo: string | null) {
  if (!motivo) return "—";
  if (motivo.startsWith("LIMITE_TEMPO")) return "Prazo de execução atingido";
  const rotulos: Record<string, string> = {
    BUSCA_CONCLUIDA: "Busca concluída",
    ENTRADA_INVALIDA: "Entrada rejeitada na pré-validação",
    INCONCLUSIVA: "Sem grade e sem prova de inviabilidade",
    SUPERVISOR_INTERROMPIDO: "Execução interrompida pelo supervisor",
    FALHA_INICIALIZACAO_MOTOR: "Falha ao iniciar o motor",
    SIMULACAO_FRONT: "Simulação local do front (sem motor)",
  };
  return rotulos[motivo] ?? motivo;
}

export const rotulosEstadoProva: Record<string, string> = {
  COMPROVADO: "Comprovado",
  NAO_COMPROVADO: "Não comprovado",
  NAO_COMPROVADO_LIMITE_TEMPO: "Não comprovado: prazo esgotado",
  NAO_COMPROVADO_FALHA_INTERNA: "Não comprovado: falha interna",
  NAO_EXECUTADO: "Não executado: depende do nível anterior",
};

/** "29/3" → "29/3 (≈ 9,67)": a média é racional exata (CP-08); o decimal é só leitura. */
export function formatarRacional(valor: string | null) {
  if (valor === null) return "—";
  const [n, d] = valor.split("/").map(Number);
  if (!d) return valor;
  return `${valor} (≈ ${(n / d).toLocaleString("pt-BR", { maximumFractionDigits: 2 })})`;
}

export function formatarSegundos(s: number | null) {
  if (s === null) return "—";
  return s < 60 ? `${s.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;
}
