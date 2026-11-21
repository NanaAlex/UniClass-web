"use client";

import { useCallback, useEffect, useState } from "react";
import { criarNomes, type Nomes } from "@/lib/gestaoHorario";
import { listarProfessores } from "@/services/professores";
import { aplicarEdicoes, listarTravas, obterDadosEdicao, obterExecucao, type DadosEdicao } from "@/services/horarios";
import { listarSolicitacoes, marcarComoLida } from "@/services/solicitacoes";
import { ErroNaoEncontrado } from "@/services/simulacao";
import type { AcaoEdicao, Execucao, ProfessorResumo, Solicitacao, Trava } from "@/types";

export type DadosExecucao = {
  execucao: Execucao;
  travas: Trava[];
  edicao: DadosEdicao;
  professores: ProfessorResumo[];
  nomes: Nomes;
  solicitacoes: Solicitacao[];
};

/** Uma execução com a grade validada, as travas do período e o que a edição precisa. */
export function useExecucao(execucaoId: string) {
  const [dados, setDados] = useState<DadosExecucao | null>(null);
  const [estado, setEstado] = useState<"carregando" | "pronto" | "nao_encontrada" | "falhou">("carregando");

  const carregar = useCallback(async () => {
    setEstado("carregando");
    try {
      const [execucao, travas, edicao, professores, solicitacoes] = await Promise.all([
        obterExecucao(execucaoId),
        listarTravas(),
        obterDadosEdicao(),
        listarProfessores(),
        listarSolicitacoes({ tipo: "horario" }),
      ]);
      const resumos = professores.map(({ id, nome, fotoUrl }) => ({ id, nome, fotoUrl }));
      setDados({ execucao, travas, edicao, professores: resumos, nomes: criarNomes(edicao.disciplinas, resumos, edicao.turmas), solicitacoes });
      setEstado("pronto");
    } catch (erro) {
      setEstado(erro instanceof ErroNaoEncontrado ? "nao_encontrada" : "falhou");
    }
  }, [execucaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /** Tudo ou nada (a API repete as conferências); devolve as travas criadas. */
  async function registrar(acoes: AcaoEdicao[]) {
    const criadas = await aplicarEdicoes(execucaoId, acoes);
    const travas = await listarTravas();
    setDados((atual) => atual && { ...atual, travas });
    return criadas;
  }

  async function marcarLida(solicitacao: Solicitacao) {
    const atualizada = await marcarComoLida(solicitacao.id);
    setDados((atual) => atual && { ...atual, solicitacoes: atual.solicitacoes.map((s) => (s.id === atualizada.id ? atualizada : s)) });
  }

  return { dados, estado, recarregar: carregar, registrar, marcarLida };
}
