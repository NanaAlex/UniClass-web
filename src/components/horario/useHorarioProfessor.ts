"use client";

import { useCallback, useEffect, useState } from "react";
import { criarNomes, type Nomes } from "@/lib/gestaoHorario";
import { listarDisciplinas, listarEstruturasTurno, listarTurmas } from "@/services/academico";
import { obterHorarioDoProfessor } from "@/services/horarios";
import { listarSolicitacoes } from "@/services/solicitacoes";
import type { EstruturaTurno, HorarioProfessor, Solicitacao } from "@/types";

type Dados = {
  horario: HorarioProfessor;
  estruturas: EstruturaTurno[];
  nomes: Nomes;
  solicitacoes: Solicitacao[];
};

/** Horário publicado do professor (grade vigente), a estrutura dos turnos e os pedidos de alteração. */
export function useHorarioProfessor(professorId: string) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      const [horario, estruturas, disciplinas, turmas, solicitacoes] = await Promise.all([
        obterHorarioDoProfessor(professorId),
        listarEstruturasTurno(),
        listarDisciplinas(),
        listarTurmas(),
        listarSolicitacoes({ professorId, tipo: "horario" }),
      ]);
      setDados({ horario, estruturas, nomes: criarNomes(disciplinas, [], turmas), solicitacoes });
    } catch {
      setFalhou(true);
    }
  }, [professorId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function adicionarSolicitacao(nova: Solicitacao) {
    setDados((atuais) => atuais && { ...atuais, solicitacoes: [nova, ...atuais.solicitacoes] });
  }

  return { dados, falhou, recarregar: carregar, adicionarSolicitacao };
}
