import type {
  BlocoGrade,
  Diagnostico,
  Disciplina,
  EstruturaTurno,
  Execucao,
  GradeProfessor,
  GradeTurma,
  ProvaNivel,
  RespostaFormulario,
  Trava,
  Turma,
} from "@/types";
import { custosDaGrade, justificativaDoStatus, LIMITE_EXECUCAO_SEGUNDOS } from "./geracao";
import { aulasDoBloco, chaveBloco, coordenadasDoTurno, mesmaCoordenada } from "./horario";

// Simulação local da regeneração, usada enquanto o front não chama a API do motor. Recompõe a
// grade-base aplicando as travas e confere as restrições obrigatórias. Nunca declara ótimo: sem o
// motor não há prova (RN-27, RN-67). Com a API, o resultado vem de POST /admin/geracoes.

export type EntradaSimulacao = {
  base: Execucao;
  travas: Trava[];
  respostas: RespostaFormulario[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  estruturas: EstruturaTurno[];
  contexto: { ativos: number; enviados: number; pendentes: number; antecipada: boolean };
};

const PROVAS_NAO_COMPROVADAS: ProvaNivel[] = [1, 2, 3, 4].map((nivel) => ({
  nivel: nivel as ProvaNivel["nivel"],
  objetivo: ["custo_primario", "max_media_docente", "amplitude_medias", "chave_canonica"][nivel - 1],
  comprovado: false,
  estado: "NAO_COMPROVADO",
}));

function aviso(codigo: string, mensagem: string, entidades: Record<string, unknown> = {}): Diagnostico {
  return { codigo, categoria: "simulacao", severidade: "aviso", etapa: "simulacao_front", mensagem, natureza: "comprovada", entidades };
}

export function projetarPorProfessor(porTurma: GradeTurma[], estruturas: EstruturaTurno[], professores: string[], K: number): GradeProfessor[] {
  const porCoordenada = new Map<string, BlocoGrade>();
  for (const t of porTurma) for (const b of t.posicoes) if (b.professorId) porCoordenada.set(`${b.professorId}|${chaveBloco(b.turno, b.dia, b.indice)}`, b);
  return professores.map((professorId) => ({
    professorId,
    posicoes: estruturas.flatMap((e) =>
      coordenadasDoTurno(e).map((c): BlocoGrade => {
        const b = porCoordenada.get(`${professorId}|${chaveBloco(c.turno, c.dia, c.indice)}`);
        return { ...c, aulas: aulasDoBloco(K, c.indice), turmaId: b?.turmaId ?? null, disciplinaId: b?.disciplinaId ?? null, professorId, travas: [] };
      }),
    ),
  }));
}

/** Restrições obrigatórias conferidas localmente (RN-08, RN-15, RN-16, RN-19, RN-20, RN-21). */
export function problemasDaGrade(porTurma: GradeTurma[], e: EntradaSimulacao): Diagnostico[] {
  const K = e.base.aulasPorBloco;
  const problemas: Diagnostico[] = [];
  const ocupacao = new Map<string, string>();
  const blocosProf = new Map<string, number>();
  for (const t of porTurma) {
    for (const d of e.disciplinas.filter((x) => x.semestre === t.semestre)) {
      const blocos = t.posicoes.filter((b) => b.disciplinaId === d.id);
      if (blocos.length * K !== d.aulasPorSemana) problemas.push(aviso("CARGA_DIVERGENTE", `${d.nome} ficaria com ${blocos.length * K} aulas na turma; exigidas ${d.aulasPorSemana}.`, { turma_id: t.turmaId, disciplina_id: d.id }));
      if (new Set(blocos.map((b) => b.professorId)).size > 1) problemas.push(aviso("RESPONSAVEL_MULTIPLO", `${d.nome} ficaria com mais de um professor na turma.`, { turma_id: t.turmaId }));
    }
    for (const b of t.posicoes) {
      if (!b.professorId || !b.disciplinaId) continue;
      const r = e.respostas.find((x) => x.professorId === b.professorId);
      const chave = chaveBloco(b.turno, b.dia, b.indice);
      if (!r?.interesses.some((i) => i.disciplinaId === b.disciplinaId)) problemas.push(aviso("DISCIPLINA_NAO_SELECIONADA", "Professor em disciplina que não selecionou.", { professor_id: b.professorId }));
      if (!r?.disponibilidade.includes(chave)) problemas.push(aviso("BLOCO_NAO_SELECIONADO", "Professor em bloco que não selecionou.", { professor_id: b.professorId, bloco: chave }));
      const k = `${b.professorId}|${chave}`;
      if (ocupacao.has(k) && ocupacao.get(k) !== t.turmaId) problemas.push(aviso("CONFLITO_PROFESSOR", "Professor em duas turmas no mesmo bloco.", { professor_id: b.professorId, bloco: chave }));
      ocupacao.set(k, t.turmaId);
      blocosProf.set(b.professorId, (blocosProf.get(b.professorId) ?? 0) + 1);
    }
  }
  for (const r of e.respostas) {
    const n = blocosProf.get(r.professorId) ?? 0;
    if (n === 0) problemas.push(aviso("PARTICIPANTE_SEM_DISCIPLINA", "Professor participante ficaria sem disciplina.", { professor_id: r.professorId }));
    if (n * K > 40) problemas.push(aviso("TETO_EXCEDIDO", "Professor passaria de 40 aulas semanais.", { professor_id: r.professorId }));
  }
  return problemas;
}

export function simularRegeneracao(e: EntradaSimulacao, id: string, inicio: Date): Execucao {
  const K = e.base.aulasPorBloco;
  const porTurma: GradeTurma[] = structuredClone(e.base.grade!.porTurma);
  const nomesTravas = (turmaId: string, b: BlocoGrade) =>
    e.travas.filter((t) => (t.tipo === "ocupacao" || t.tipo === "vaga_turma") && t.turmaId === turmaId && t.coordenada && mesmaCoordenada(t.coordenada, b)).map((t) => t.id);

  for (const t of porTurma) {
    for (const b of t.posicoes) {
      b.travas = nomesTravas(t.turmaId, b);
      const trava = e.travas.find((x) => b.travas.includes(x.id));
      if (trava?.tipo === "ocupacao") Object.assign(b, { disciplinaId: trava.disciplinaId!, professorId: trava.professorId!, turmaId: t.turmaId });
      if (trava?.tipo === "vaga_turma") Object.assign(b, { disciplinaId: null, professorId: null, turmaId: t.turmaId });
    }
    for (const f of e.travas.filter((x) => x.tipo === "fixacao_disciplina_professor" && x.semestre === t.semestre)) {
      for (const b of t.posicoes) if (b.disciplinaId === f.disciplinaId) b.professorId = f.professorId!;
    }
  }

  const problemas = problemasDaGrade(porTurma, e);
  const valida = problemas.length === 0;
  const status = valida ? "VALIDA_NAO_OTIMA" : "INCONCLUSIVA";
  const diagnosticos = valida
    ? [aviso("SIMULACAO_SEM_PROVA", "Simulação do front: a grade-base foi recomposta com as travas e conferida localmente; nenhum nível de otimização foi comprovado.")]
    : [aviso("SIMULACAO_SEM_SOLUCAO", "A simulação do front não resolve conflitos criados pelas travas; só o motor Prolog pode procurar outra grade.", {}), ...problemas.slice(0, 5)];
  const custos = valida ? custosDaGrade(porTurma, e.respostas, K) : null;
  const duracao = 1.2;

  return {
    id,
    periodoLetivo: e.base.periodoLetivo,
    status,
    iniciadaEm: inicio.toISOString(),
    concluidaEm: new Date(inicio.getTime() + duracao * 1000).toISOString(),
    publicadaEm: null,
    gradeBaseId: e.travas.length ? e.travas[e.travas.length - 1].origemExecucaoId : null,
    simulada: true,
    aulasPorBloco: K,
    painel: {
      totalTurmas: porTurma.length,
      turmasComGradeValidada: valida ? porTurma.length : null,
      professoresComAulas: custos?.professoresComAulas ?? null,
      participantes: e.respostas.length,
      professoresAtivos: e.contexto.ativos,
      respostasEnviadas: e.contexto.enviados,
      pendentes: e.contexto.pendentes,
      geracaoAntecipadaConfirmada: e.contexto.antecipada,
      custoTotal: custos?.total ?? null,
      parcelas: custos?.parcelas ?? null,
      piorMedia: custos?.piorMedia ?? null,
      amplitude: custos?.amplitude ?? null,
      duracaoSegundos: duracao,
      tempoPrimeiraGradeSegundos: valida ? duracao : null,
      limiteSegundos: LIMITE_EXECUCAO_SEGUNDOS,
      motivoTermino: "SIMULACAO_FRONT",
      provas: PROVAS_NAO_COMPROVADAS,
      justificativa: justificativaDoStatus(status, PROVAS_NAO_COMPROVADAS, diagnosticos, true),
      diagnosticos,
      publicavel: false,
    },
    grade: valida
      ? { porTurma, porProfessor: projetarPorProfessor(porTurma, e.estruturas, e.respostas.map((r) => r.professorId), K) }
      : null,
    travasAplicadas: e.travas,
  };
}
