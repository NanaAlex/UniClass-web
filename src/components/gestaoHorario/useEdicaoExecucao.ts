"use client";

import { useMemo, useState } from "react";
import { aplicarAcao, trocarNoRascunho } from "@/lib/edicaoGrade";
import { mesmaCoordenada } from "@/lib/horario";
import { projetarPorProfessor } from "@/lib/simulacaoGeracao";
import type { DadosEdicao } from "@/services/horarios";
import type { AcaoEdicao, Coordenada, Execucao, GradeProfessor, GradeTurma, Trava } from "@/types";

export type PosicaoTurma = Coordenada & { turmaId: string };
export type AcaoPendente = { acao: AcaoEdicao; travas: Trava[] };

/**
 * Rascunho da edição sobre uma grade-base validada (RN-40). Cada gesto vira uma ação fixa (ET-08),
 * conferida na hora com as mesmas regras da API; nada é gravado até "Registrar travas". As trocas
 * aparecem na grade; as travas novas ficam marcadas como pendentes.
 */
export function useEdicaoExecucao(execucao: Execucao | null, travas: Trava[], dados: DadosEdicao | null, aoRecusar: (motivo: string) => void) {
  const [editando, setEditando] = useState(false);
  const [pendentes, setPendentes] = useState<AcaoPendente[]>([]);
  const [selecao, setSelecao] = useState<PosicaoTurma | null>(null);

  const travasPendentes = useMemo(() => pendentes.flatMap((p) => p.travas), [pendentes]);

  const porTurma: GradeTurma[] = useMemo(() => {
    let grades = execucao?.grade?.porTurma ?? [];
    for (const { acao } of pendentes) {
      if (acao.acao !== "trocar_posicoes") continue;
      grades = grades.map((g) => (g.turmaId === acao.origem.turmaId ? { ...g, posicoes: trocarNoRascunho(g.posicoes, acao.origem, acao.destino) } : g));
    }
    return grades;
  }, [execucao, pendentes]);

  const porProfessor: GradeProfessor[] = useMemo(() => {
    const base = execucao?.grade?.porProfessor ?? [];
    if (!execucao || !dados || !pendentes.some((p) => p.acao.acao === "trocar_posicoes")) return base;
    return projetarPorProfessor(porTurma, dados.estruturas, base.map((p) => p.professorId), execucao.aulasPorBloco);
  }, [execucao, dados, pendentes, porTurma]);

  /** Confere e acumula a ação; devolve false (com o motivo) se a API também a recusaria. */
  function adicionar(acao: AcaoEdicao): boolean {
    if (!execucao || !dados) return false;
    const r = aplicarAcao({ execucao, travas: [...travas, ...travasPendentes], ...dados }, acao);
    if (!r.ok) {
      aoRecusar(r.motivo);
      return false;
    }
    if (r.travas.length === 0) {
      aoRecusar("Nada a registrar: essas posições já estavam travadas.");
      return false;
    }
    setPendentes((atual) => [...atual, { acao, travas: r.travas }]);
    setSelecao(null);
    return true;
  }

  /** Primeiro clique escolhe o bloco; o segundo, o destino na MESMA turma (RN-64, CA-185). */
  function escolher(alvo: PosicaoTurma) {
    if (!selecao) return setSelecao(alvo);
    if (selecao.turmaId === alvo.turmaId && mesmaCoordenada(selecao, alvo)) return setSelecao(null);
    if (selecao.turmaId !== alvo.turmaId) {
      aoRecusar("A troca só é permitida entre posições da mesma turma.");
      return;
    }
    adicionar({ acao: "trocar_posicoes", origem: selecao, destino: alvo });
  }

  function iniciar() {
    setEditando(true);
    setPendentes([]);
    setSelecao(null);
  }

  function encerrar() {
    setEditando(false);
    setPendentes([]);
    setSelecao(null);
  }

  /** Desfaz a última ação do rascunho (ainda não registrada: não é um desbloqueio). */
  function desfazerUltima() {
    setPendentes((atual) => atual.slice(0, -1));
    setSelecao(null);
  }

  return {
    editando,
    pendentes,
    travasPendentes,
    selecao,
    porTurma,
    porProfessor,
    iniciar,
    encerrar,
    adicionar,
    escolher,
    desfazerUltima,
    cancelarSelecao: () => setSelecao(null),
  };
}
