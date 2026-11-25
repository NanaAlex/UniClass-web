"use client";

import { useCallback, useEffect, useState } from "react";
import { maisRecentes, solicitacoesDaTurma } from "@/lib/gestaoHorario";
import { listarEstruturasTurno, listarTurmas } from "@/services/academico";
import { alterarBloqueioGrade, listarGrades, salvarEdicaoGrade } from "@/services/horarios";
import { listarSolicitacoes, marcarComoLida } from "@/services/solicitacoes";
import type { Aula, EstruturaTurno, Grade, Solicitacao, Turma } from "@/types";

type DadosGrade = {
  grade: Grade;
  turma: Turma;
  estrutura: EstruturaTurno;
  /** Versão atual da turma: as antigas são só leitura. */
  idAtual: string;
  /** Horário atual das outras turmas do turno, para checar choque de professor (RF 3.9). */
  outrasGrades: Grade[];
  solicitacoes: Solicitacao[];
};

/** Uma versão da grade de uma turma, com os pedidos de alteração que citam a turma. */
export function useGradeTurma(gradeId: string) {
  const [dados, setDados] = useState<DadosGrade | null>(null);
  const [estado, setEstado] = useState<"carregando" | "pronto" | "nao_encontrada" | "falhou">("carregando");

  const carregar = useCallback(async () => {
    setEstado("carregando");
    try {
      const [grades, turmas, estruturas, solicitacoes] = await Promise.all([
        listarGrades(),
        listarTurmas(),
        listarEstruturasTurno(),
        listarSolicitacoes({ tipo: "horario" }),
      ]);
      const grade = grades.find((g) => g.id === gradeId);
      const turma = turmas.find((t) => t.id === grade?.turmaId);
      const estrutura = estruturas.find((e) => e.turno === grade?.turno);
      if (!grade || !turma || !estrutura) return setEstado("nao_encontrada");

      const atuais = maisRecentes(grades);
      setDados({
        grade,
        turma,
        estrutura,
        idAtual: atuais.find((g) => g.turmaId === turma.id)?.id ?? grade.id,
        outrasGrades: atuais.filter((g) => g.turmaId !== turma.id && g.turno === grade.turno),
        solicitacoes: solicitacoesDaTurma(solicitacoes, turma),
      });
      setEstado("pronto");
    } catch {
      setEstado("falhou");
    }
  }, [gradeId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const trocarGrade = (grade: Grade) => setDados((atual) => atual && { ...atual, grade });

  async function salvar(aulas: Aula[]) {
    if (dados) trocarGrade(await salvarEdicaoGrade(dados.grade.id, aulas));
  }

  async function alternarBloqueioTurma() {
    if (!dados) return;
    const atualizada = await alterarBloqueioGrade(dados.grade.id, !dados.grade.bloqueada);
    trocarGrade(atualizada);
    return atualizada.bloqueada;
  }

  async function marcarLida(solicitacao: Solicitacao) {
    const atualizada = await marcarComoLida(solicitacao.id);
    setDados((atual) => atual && { ...atual, solicitacoes: atual.solicitacoes.map((s) => (s.id === atualizada.id ? atualizada : s)) });
  }

  return { dados, estado, recarregar: carregar, salvar, alternarBloqueioTurma, marcarLida };
}
