"use client";

import { useCallback, useEffect, useState } from "react";
import { listarMinhasEstruturas, listarMinhasSolicitacoesHorario, obterMeuHorario } from "@/services/professor";
import type { EstruturaTurno, HorarioProfessor, Solicitacao } from "@/types";

type Dados = {
  horario: HorarioProfessor;
  estruturas: EstruturaTurno[];
  solicitacoes: Solicitacao[];
};

/** Carrega o horário do professor, a estrutura dos turnos e os pedidos de alteração de horário (do back). */
export function useHorarioProfessor(professorId: string) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      // O back identifica o professor pelo token; o professorId só preenche as solicitações
      const [horario, estruturas, solicitacoes] = await Promise.all([
        obterMeuHorario(),
        listarMinhasEstruturas(),
        listarMinhasSolicitacoesHorario(professorId),
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