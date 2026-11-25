"use client";

import { useCallback, useEffect, useState } from "react";
import { listarTurmas } from "@/services/academico";
import { encerrarFormulario, obterFormularioAtual } from "@/services/formularios";
import {
  alterarBloqueioGrade,
  alterarVisibilidadeHorario,
  gerarHorario,
  listarGrades,
  oficializarHorario,
} from "@/services/horarios";
import { listarProfessores } from "@/services/professores";
import { listarSolicitacoes } from "@/services/solicitacoes";
import type { Formulario, Grade, ProfessorComSituacao, Solicitacao, Turma } from "@/types";

export type DadosHorarios = {
  grades: Grade[];
  turmas: Turma[];
  formulario: Formulario;
  professores: ProfessorComSituacao[];
  /** Pedidos de alteração de horário (RF 3.4, RF 4.4). */
  solicitacoes: Solicitacao[];
};

/** Tudo o que a aba Horários precisa: grades (com histórico), turmas, formulário e pendências. */
export function useGestaoHorario() {
  const [dados, setDados] = useState<DadosHorarios | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      const [grades, turmas, formulario, professores, solicitacoes] = await Promise.all([
        listarGrades(),
        listarTurmas(),
        obterFormularioAtual(),
        listarProfessores(),
        listarSolicitacoes({ tipo: "horario" }),
      ]);
      setDados({ grades, turmas, formulario, professores, solicitacoes });
    } catch {
      setFalhou(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atualizar = (parcial: Partial<DadosHorarios>) => setDados((atual) => (atual ? { ...atual, ...parcial } : atual));

  async function gerar() {
    const resultado = await gerarHorario();
    atualizar({ grades: resultado.grades });
    return resultado.turmasAfetadas;
  }

  async function oficializar() {
    atualizar({ grades: await oficializarHorario() });
  }

  async function alterarVisibilidade(visivel: boolean) {
    atualizar({ grades: await alterarVisibilidadeHorario(visivel) });
  }

  async function alternarBloqueioTurma(grade: Grade) {
    const atualizada = await alterarBloqueioGrade(grade.id, !grade.bloqueada);
    setDados((atual) => atual && { ...atual, grades: atual.grades.map((g) => (g.id === atualizada.id ? atualizada : g)) });
    return atualizada;
  }

  async function encerrar() {
    if (dados) atualizar({ formulario: await encerrarFormulario(dados.formulario.id) });
  }

  return { dados, falhou, recarregar: carregar, gerar, oficializar, alterarVisibilidade, alternarBloqueioTurma, encerrar };
}
