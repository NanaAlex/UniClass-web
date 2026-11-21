import type {
  AcaoEdicao,
  BlocoGrade,
  Coordenada,
  Disciplina,
  EstruturaTurno,
  Execucao,
  RespostaFormulario,
  Trava,
  Turma,
} from "@/types";
import { chaveBloco, coordenadasDoTurno, mesmaCoordenada, rotuloCoordenada } from "./horario";

// Edição e bloqueio sobre uma grade-base validada (RN-40 a RN-45, RN-52 a RN-58, RN-64, ET-08 a
// ET-11). O mesmo conjunto de verificações roda no backend (src/motor/edicao.ts): a interface impede
// o gesto inválido e a API repete a verificação. Nenhuma ação remove travas (seção 8).

export const TETO_AULAS_PROFESSOR = 40;

export type ContextoEdicao = {
  execucao: Execucao;
  /** Travas já registradas no período. */
  travas: Trava[];
  /** Respostas dos professores participantes (disciplinas e blocos selecionados). */
  respostas: RespostaFormulario[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  estruturas: EstruturaTurno[];
};

export type ResultadoAcao = { ok: true; travas: Trava[]; ignoradas: number } | { ok: false; motivo: string };

const recusa = (motivo: string): ResultadoAcao => ({ ok: false, motivo });

type NovaTrava = Omit<Trava, "id" | "origemExecucaoId" | "acao" | "criadaEm">;

function posicoesDaTurma(ctx: ContextoEdicao, turmaId: string): BlocoGrade[] {
  return ctx.execucao.grade?.porTurma.find((t) => t.turmaId === turmaId)?.posicoes ?? [];
}

function coordenadaExiste(ctx: ContextoEdicao, c: Coordenada) {
  const e = ctx.estruturas.find((x) => x.turno === c.turno);
  return Boolean(e && e.dias.includes(c.dia) && c.indice >= 1 && c.indice <= e.blocos);
}

function selecionouBloco(ctx: ContextoEdicao, professorId: string, c: Coordenada) {
  return Boolean(ctx.respostas.find((r) => r.professorId === professorId)?.disponibilidade.includes(chaveBloco(c.turno, c.dia, c.indice)));
}

function ocupacao(b: BlocoGrade, turmaId: string): NovaTrava {
  return { tipo: "ocupacao", turmaId, coordenada: { dia: b.dia, turno: b.turno, indice: b.indice }, disciplinaId: b.disciplinaId!, professorId: b.professorId! };
}

const vagaTurma = (turmaId: string, c: Coordenada): NovaTrava => ({ tipo: "vaga_turma", turmaId, coordenada: { dia: c.dia, turno: c.turno, indice: c.indice } });
const vagaProfessor = (professorId: string, c: Coordenada): NovaTrava => ({ tipo: "vaga_professor", professorId, coordenada: { dia: c.dia, turno: c.turno, indice: c.indice } });

/** Identidade lógica da trava, para não registrar a mesma restrição duas vezes. */
export function assinaturaTrava(t: Pick<Trava, "tipo" | "turmaId" | "professorId" | "semestre" | "disciplinaId" | "coordenada">) {
  const c = t.coordenada ? chaveBloco(t.coordenada.turno, t.coordenada.dia, t.coordenada.indice) : "";
  return [t.tipo, t.turmaId ?? "", t.professorId ?? "", t.semestre ?? "", t.disciplinaId ?? "", c].join("|");
}

const travadaNaTurma = (travas: Trava[], turmaId: string, c: Coordenada) =>
  travas.find((t) => (t.tipo === "ocupacao" || t.tipo === "vaga_turma") && t.turmaId === turmaId && t.coordenada && mesmaCoordenada(t.coordenada, c));

/** Contradições entre travas (RN-46, RN-49): o conjunto resultante precisa ser coerente. */
export function contradicaoEntreTravas(travas: NovaTrava[], ctx: ContextoEdicao): string | null {
  const K = ctx.execucao.aulasPorBloco;
  const ocup = travas.filter((t) => t.tipo === "ocupacao");
  for (let i = 0; i < ocup.length; i++) {
    for (let j = i + 1; j < ocup.length; j++) {
      const a = ocup[i];
      const b = ocup[j];
      const mesmaPos = a.turmaId === b.turmaId && mesmaCoordenada(a.coordenada!, b.coordenada!);
      if (mesmaPos && (a.disciplinaId !== b.disciplinaId || a.professorId !== b.professorId)) return "Duas travas fixam conteúdos diferentes na mesma posição da turma.";
      if (a.professorId === b.professorId && a.turmaId !== b.turmaId && mesmaCoordenada(a.coordenada!, b.coordenada!)) {
        return "O professor ficaria travado em duas turmas na mesma coordenada.";
      }
      if (a.turmaId === b.turmaId && a.disciplinaId === b.disciplinaId && a.professorId !== b.professorId) {
        return "As travas atribuiriam professores diferentes à mesma turma e disciplina.";
      }
    }
    const a = ocup[i];
    if (travas.some((t) => t.tipo === "vaga_turma" && t.turmaId === a.turmaId && mesmaCoordenada(t.coordenada!, a.coordenada!))) {
      return "A mesma posição ficaria travada como ocupada e como vaga.";
    }
    if (travas.some((t) => t.tipo === "vaga_professor" && t.professorId === a.professorId && mesmaCoordenada(t.coordenada!, a.coordenada!))) {
      return "O professor ficaria travado em aula e em vaga na mesma coordenada.";
    }
    const turma = ctx.turmas.find((t) => t.id === a.turmaId);
    if (travas.some((t) => t.tipo === "fixacao_disciplina_professor" && t.disciplinaId === a.disciplinaId && t.semestre === turma?.semestre && t.professorId !== a.professorId)) {
      return "A fixação da disciplina conflita com um bloco travado de outro professor.";
    }
  }
  const porObrigacao = new Map<string, number>();
  const porProfessor = new Map<string, number>();
  for (const t of ocup) {
    porObrigacao.set(`${t.turmaId}|${t.disciplinaId}`, (porObrigacao.get(`${t.turmaId}|${t.disciplinaId}`) ?? 0) + 1);
    porProfessor.set(t.professorId!, (porProfessor.get(t.professorId!) ?? 0) + 1);
  }
  for (const [chave, n] of Array.from(porObrigacao)) {
    const disc = ctx.disciplinas.find((d) => d.id === chave.split("|")[1]);
    if (disc && n > disc.aulasPorSemana / K) return `Há mais blocos travados de ${disc.nome} do que a carga da disciplina.`;
  }
  for (const n of Array.from(porProfessor.values())) {
    if (n * K > TETO_AULAS_PROFESSOR) return `As travas passariam de ${TETO_AULAS_PROFESSOR} aulas semanais para um professor.`;
  }
  return null;
}

/** Converte uma ação em travas, ou recusa com o motivo (o mesmo contrato da API). */
export function aplicarAcao(ctx: ContextoEdicao, acao: AcaoEdicao): ResultadoAcao {
  if (!ctx.execucao.grade) return recusa("Só uma grade completa e validada pode ser usada como base de edição.");
  const turma = (id: string) => ctx.turmas.find((t) => t.id === id);
  let novas: NovaTrava[] = [];

  switch (acao.acao) {
    case "bloquear_grade_turma": {
      const t = turma(acao.turmaId);
      if (!t) return recusa("Turma não encontrada na grade-base.");
      novas = posicoesDaTurma(ctx, t.id).map((b) => (b.disciplinaId ? ocupacao(b, t.id) : vagaTurma(t.id, b)));
      break;
    }
    case "bloquear_grade_professor": {
      const porCoordenada = new Map(
        (ctx.execucao.grade.porProfessor.find((p) => p.professorId === acao.professorId)?.posicoes ?? []).map((b) => [chaveBloco(b.turno, b.dia, b.indice), b]),
      );
      for (const e of ctx.estruturas) {
        for (const c of coordenadasDoTurno(e)) {
          const b = porCoordenada.get(chaveBloco(c.turno, c.dia, c.indice));
          novas.push(b?.disciplinaId && b.turmaId ? ocupacao(b, b.turmaId) : vagaProfessor(acao.professorId, c));
        }
      }
      break;
    }
    case "bloquear_bloco_turma": {
      const t = turma(acao.turmaId);
      if (!t || !coordenadaExiste(ctx, acao.coordenada) || acao.coordenada.turno !== t.turno) {
        return recusa("Posição inexistente ou fora do turno da turma.");
      }
      const b = posicoesDaTurma(ctx, t.id).find((x) => mesmaCoordenada(x, acao.coordenada));
      novas = [b?.disciplinaId ? ocupacao(b, t.id) : vagaTurma(t.id, acao.coordenada)];
      break;
    }
    case "bloquear_bloco_professor": {
      if (!coordenadaExiste(ctx, acao.coordenada)) return recusa("Coordenada inexistente.");
      const b = ctx.execucao.grade.porProfessor.find((p) => p.professorId === acao.professorId)?.posicoes.find((x) => mesmaCoordenada(x, acao.coordenada));
      novas = [b?.disciplinaId && b.turmaId ? ocupacao(b, b.turmaId) : vagaProfessor(acao.professorId, acao.coordenada)];
      break;
    }
    case "fixar_disciplina_professor_semestre": {
      const d = ctx.disciplinas.find((x) => x.id === acao.disciplinaId && x.semestre === acao.semestre);
      const r = ctx.respostas.find((x) => x.professorId === acao.professorId);
      if (!d) return recusa("Disciplina inexistente no semestre.");
      if (!r) return recusa("O professor não participa desta geração (sem resposta enviada).");
      if (!r.interesses.some((i) => i.disciplinaId === d.id)) {
        return recusa("O professor não selecionou esta disciplina no formulário; a fixação não pode liberá-la.");
      }
      const K = ctx.execucao.aulasPorBloco;
      const turmasSem = ctx.turmas.filter((t) => t.semestre === acao.semestre);
      for (const t of turmasSem) {
        const compativeis = r.disponibilidade.filter((k) => k.startsWith(`${t.turno}:`)).length;
        if (compativeis < d.aulasPorSemana / K) {
          return recusa(`${t.semestre}º ${t.nome}: o professor tem ${compativeis} blocos compatíveis e a disciplina exige ${d.aulasPorSemana / K}.`);
        }
        const outra = ctx.travas.find((x) => x.tipo === "ocupacao" && x.turmaId === t.id && x.disciplinaId === d.id && x.professorId !== acao.professorId);
        if (outra) return recusa(`${t.semestre}º ${t.nome}: há bloco travado desta disciplina com outro professor.`);
      }
      const aulasFixadas = ctx.travas
        .filter((x) => x.tipo === "fixacao_disciplina_professor" && x.professorId === acao.professorId && x.disciplinaId !== d.id)
        .reduce((soma, x) => soma + (ctx.disciplinas.find((y) => y.id === x.disciplinaId)?.aulasPorSemana ?? 0) * ctx.turmas.filter((t) => t.semestre === x.semestre).length, 0);
      const total = aulasFixadas + d.aulasPorSemana * turmasSem.length;
      if (total > TETO_AULAS_PROFESSOR) return recusa(`As fixações somariam ${total} aulas semanais para o professor (teto de ${TETO_AULAS_PROFESSOR}).`);
      novas = [{ tipo: "fixacao_disciplina_professor", semestre: acao.semestre, disciplinaId: d.id, professorId: acao.professorId }];
      break;
    }
    case "trocar_posicoes": {
      const { origem, destino } = acao;
      // RN-64, CA-185: troca só entre posições da MESMA turma, em qualquer visão
      if (origem.turmaId !== destino.turmaId) return recusa("A troca só é permitida entre posições da mesma turma.");
      const t = turma(origem.turmaId);
      if (!t) return recusa("Turma não encontrada na grade-base.");
      for (const c of [origem, destino]) {
        if (!coordenadaExiste(ctx, c) || c.turno !== t.turno) return recusa("Destino inexistente, em dia não letivo ou fora do turno da turma.");
      }
      if (mesmaCoordenada(origem, destino)) return recusa("Origem e destino são a mesma posição.");
      const posicoes = posicoesDaTurma(ctx, t.id);
      const bOrig = posicoes.find((x) => mesmaCoordenada(x, origem));
      const bDest = posicoes.find((x) => mesmaCoordenada(x, destino));
      if (!bOrig?.disciplinaId && !bDest?.disciplinaId) return recusa("As duas posições estão vazias.");
      for (const c of [origem, destino]) {
        if (travadaNaTurma(ctx.travas, t.id, c)) return recusa(`${rotuloCoordenada(c)} já está bloqueada; a troca contradiria a trava.`);
      }
      // O bloco inteiro (K aulas) muda de lugar; o professor precisa ter selecionado o destino
      const moverPara = (b: BlocoGrade | undefined, c: Coordenada) => (b?.disciplinaId ? { ...b, dia: c.dia, turno: c.turno, indice: c.indice } : undefined);
      const novoDestino = moverPara(bOrig, destino);
      const novaOrigem = moverPara(bDest, origem);
      for (const b of [novoDestino, novaOrigem]) {
        if (!b) continue;
        if (!selecionouBloco(ctx, b.professorId!, b)) return recusa(`O professor não selecionou o bloco de destino (${rotuloCoordenada(b)}).`);
        const bloqueio = ctx.travas.find(
          (x) => mesmaCoordenada(x.coordenada ?? { dia: "seg", turno: "manha", indice: -1 }, b) &&
            ((x.tipo === "vaga_professor" && x.professorId === b.professorId) || (x.tipo === "ocupacao" && x.professorId === b.professorId && x.turmaId !== t.id)),
        );
        if (bloqueio) return recusa(`O professor está bloqueado em ${rotuloCoordenada(b)}.`);
      }
      // Ao confirmar, as duas posições resultantes ficam bloqueadas (CA-109, CA-111, CA-139)
      novas = [novoDestino ? ocupacao(novoDestino, t.id) : vagaTurma(t.id, destino), novaOrigem ? ocupacao(novaOrigem, t.id) : vagaTurma(t.id, origem)];
      break;
    }
  }

  const existentes = new Set(ctx.travas.map(assinaturaTrava));
  const unicas = novas.filter((t, i) => !existentes.has(assinaturaTrava(t)) && novas.findIndex((x) => assinaturaTrava(x) === assinaturaTrava(t)) === i);
  const contradicao = contradicaoEntreTravas([...ctx.travas, ...unicas], ctx);
  if (contradicao) return recusa(contradicao);
  const agora = new Date().toISOString();
  return {
    ok: true,
    ignoradas: novas.length - unicas.length,
    travas: unicas.map((t, i) => ({ ...t, id: `tr-${Date.now()}-${i}`, origemExecucaoId: ctx.execucao.id, acao: acao.acao, criadaEm: agora })),
  };
}

/** Aplica, numa cópia da grade, o efeito visual de uma troca ainda não confirmada (rascunho). */
export function trocarNoRascunho(posicoes: BlocoGrade[], origem: Coordenada, destino: Coordenada): BlocoGrade[] {
  const a = posicoes.find((b) => mesmaCoordenada(b, origem));
  const b = posicoes.find((x) => mesmaCoordenada(x, destino));
  if (!a || !b) return posicoes;
  const conteudo = (x: BlocoGrade) => ({ disciplinaId: x.disciplinaId, professorId: x.professorId, turmaId: x.turmaId });
  return posicoes.map((x) => (x === a ? { ...x, ...conteudo(b) } : x === b ? { ...x, ...conteudo(a) } : x));
}

/** Texto para listar uma trava ("Ocupação fixa: Banco de Dados I · Fernanda · Terça · Manhã · Bloco 1"). */
export function descreverTrava(t: Trava, nomes: { disciplina: (id: string) => string; professor: (id: string) => string; turma: (id: string) => string }) {
  const onde = t.coordenada ? rotuloCoordenada(t.coordenada) : "";
  switch (t.tipo) {
    case "ocupacao":
      return `Bloco fixo em ${nomes.turma(t.turmaId!)}: ${nomes.disciplina(t.disciplinaId!)} com ${nomes.professor(t.professorId!)} — ${onde}`;
    case "vaga_turma":
      return `Vaga fixa em ${nomes.turma(t.turmaId!)} — ${onde}`;
    case "vaga_professor":
      return `${nomes.professor(t.professorId!)} sem aula — ${onde}`;
    default:
      return `${nomes.disciplina(t.disciplinaId!)} fixada com ${nomes.professor(t.professorId!)} em todas as turmas do ${t.semestre}º semestre`;
  }
}
