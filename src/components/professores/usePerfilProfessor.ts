"use client";

import { useCallback, useEffect, useState } from "react";
import { obterProfessor } from "@/services/professores";
import { ErroNaoEncontrado } from "@/services/simulacao";
import { listarSolicitacoes } from "@/services/solicitacoes";
import type { ProfessorComSituacao, Solicitacao } from "@/types";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro" }
  | { tipo: "nao_encontrado" }
  | { tipo: "pronto"; professor: ProfessorComSituacao; solicitacoes: Solicitacao[] };

/** Dados do perfil (RF 8.6) e todos os pedidos de alteração do professor (RF 8.9). */
export function usePerfilProfessor(id: string) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });

  const carregar = useCallback(async () => {
    setEstado({ tipo: "carregando" });
    try {
      const [professor, solicitacoes] = await Promise.all([obterProfessor(id), listarSolicitacoes({ professorId: id })]);
      setEstado({ tipo: "pronto", professor, solicitacoes });
    } catch (erro) {
      setEstado({ tipo: erro instanceof ErroNaoEncontrado ? "nao_encontrado" : "erro" });
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atualizarProfessor = useCallback((professor: ProfessorComSituacao) => {
    setEstado((atual) => (atual.tipo === "pronto" ? { ...atual, professor } : atual));
  }, []);

  const atualizarSolicitacao = useCallback((nova: Solicitacao) => {
    setEstado((atual) =>
      atual.tipo === "pronto"
        ? { ...atual, solicitacoes: atual.solicitacoes.map((s) => (s.id === nova.id ? nova : s)) }
        : atual,
    );
  }, []);

  return { estado, recarregar: carregar, atualizarProfessor, atualizarSolicitacao };
}
