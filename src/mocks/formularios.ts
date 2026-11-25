import type { ChaveHorario, Formulario, RespostaFormulario } from "@/types";
import { disciplinas, estruturasTurno } from "./academico";

/**
 * O João (p2, professor logado) ainda não respondeu, então a aba Formulário abre no preenchimento.
 * Para ver os outros estados, troque `status` ("rascunho" = indisponível, "encerrado") ou adicione
 * uma resposta com `professorId: "p2"` em `respostasFormulario` (`edicaoLiberada: true` = edição liberada).
 *
 * Aba Formulário do administrador: "rascunho" = sem formulário ativo (tela de lançamento),
 * "aberto" = acompanhamento das respostas, "encerrado" = resumo final + lançar um novo.
 * `inicio` futuro = agendado; `fim` passado com status "aberto" = encerrado pela data (pode prorrogar).
 */
export const formularioAtual: Formulario = {
  id: "f2027-1",
  nome: "Disponibilidade 2027.1",
  periodoLetivo: "2027.1",
  status: "aberto",
  inicio: "2026-10-15T03:00:00Z",
  fim: "2026-11-05T02:59:00Z",
  estruturas: estruturasTurno,
  disciplinaIds: disciplinas.map((d) => d.id),
};

/** Monta as chaves de um turno inteiro para os dias informados. */
function manhaDe(...dias: ("seg" | "ter" | "qua" | "qui" | "sex")[]): ChaveHorario[] {
  return dias.flatMap((dia) => [1, 2, 3, 4].map((p) => `manha:${dia}:${p}` as ChaveHorario));
}

export const respostasFormulario: RespostaFormulario[] = [
  {
    id: "r1", formularioId: formularioAtual.id, professorId: "p1", enviadaEm: "2026-10-16T14:22:00Z", edicaoLiberada: false,
    disponibilidade: manhaDe("seg", "ter", "sex"),
    interesses: [{ disciplinaId: "mat", nivel: 5 }, { disciplinaId: "est", nivel: 4 }],
    prioridadesPeriodo: {},
  },
  {
    id: "r3", formularioId: formularioAtual.id, professorId: "p3", enviadaEm: "2026-10-17T19:40:00Z", edicaoLiberada: false,
    disponibilidade: manhaDe("ter", "qui"),
    interesses: [{ disciplinaId: "web1", nivel: 5 }, { disciplinaId: "ihc", nivel: 4 }, { disciplinaId: "web2", nivel: 3 }],
    prioridadesPeriodo: {},
  },
  {
    id: "r4", formularioId: formularioAtual.id, professorId: "p4", enviadaEm: "2026-10-18T08:10:00Z", edicaoLiberada: true,
    disponibilidade: manhaDe("ter", "sex"),
    interesses: [{ disciplinaId: "ing1", nivel: 5 }, { disciplinaId: "ing2", nivel: 5 }],
    prioridadesPeriodo: {},
  },
  {
    id: "r5", formularioId: formularioAtual.id, professorId: "p7", enviadaEm: "2026-10-19T16:55:00Z", edicaoLiberada: false,
    disponibilidade: manhaDe("qua", "qui", "sex"),
    interesses: [{ disciplinaId: "bd1", nivel: 5 }, { disciplinaId: "bd2", nivel: 5 }, { disciplinaId: "dados", nivel: 3 }],
    prioridadesPeriodo: {},
  },
  {
    id: "r6", formularioId: formularioAtual.id, professorId: "p8", enviadaEm: "2026-10-20T11:30:00Z", edicaoLiberada: false,
    disponibilidade: manhaDe("seg", "qua"),
    interesses: [{ disciplinaId: "arq", nivel: 5 }, { disciplinaId: "seg", nivel: 3 }],
    prioridadesPeriodo: {},
  },
  {
    // Pediu a reabertura (solicitação s2) para incluir a quinta à noite
    id: "r7", formularioId: formularioAtual.id, professorId: "p6", enviadaEm: "2026-10-19T21:05:00Z", edicaoLiberada: false,
    disponibilidade: manhaDe("ter", "qua"),
    interesses: [{ disciplinaId: "red", nivel: 5 }, { disciplinaId: "so", nivel: 4 }, { disciplinaId: "nuv", nivel: 4 }],
    prioridadesPeriodo: { "manha:ter": 4, "manha:qua": 3 },
  },
];
