"use client";

import { useCallback, useEffect, useState } from "react";
import { criarNomes, type Nomes } from "@/lib/gestaoHorario";
import { listarMinhasSolicitacoesHorario, obterMeuHorario } from "@/services/professor";
import type { EstruturaTurno, HorarioProfessor, Solicitacao } from "@/types";

type Dados = {
  horario: HorarioProfessor;
  estruturas: EstruturaTurno[];
  nomes: Nomes;
  solicitacoes: Solicitacao[];
};

/** Horário do professor por blocos, a estrutura dos turnos e os pedidos de alteração de horário (do back). */
export function useHorarioProfessor(professorId: string) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      // O back identifica o professor pelo token; o professorId só preenche o responsável e as solicitações
      const meu = await obterMeuHorario(professorId);
      // Os pedidos citam aulas; o bloco de cada aula vem do horário carregado
      const solicitacoes = await listarMinhasSolicitacoesHorario(professorId, meu.blocoDaAula);
      setDados({ horario: meu.horario, estruturas: meu.estruturas, nomes: criarNomes(meu.disciplinas, [], meu.turmas), solicitacoes });
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
