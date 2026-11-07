"use client";

import { useCallback, useEffect, useState } from "react";
import { listarEstruturasTurno } from "@/services/academico";
import { obterHorarioDoProfessor } from "@/services/horarios";
import { listarSolicitacoes } from "@/services/solicitacoes";
import type { EstruturaTurno, HorarioProfessor, Solicitacao } from "@/types";

type Dados = {
  horario: HorarioProfessor;
  estruturas: EstruturaTurno[];
  solicitacoes: Solicitacao[];
};

/** Carrega o horário do professor, a estrutura dos turnos e os pedidos de alteração de horário. */
export function useHorarioProfessor(professorId: string) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      const [horario, estruturas, solicitacoes] = await Promise.all([
        obterHorarioDoProfessor(professorId),
        listarEstruturasTurno(),
        listarSolicitacoes({ professorId, tipo: "horario" }),
      ]);
      setDados({ horario, estruturas, solicitacoes });
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
