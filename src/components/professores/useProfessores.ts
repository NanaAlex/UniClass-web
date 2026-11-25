"use client";

import { useCallback, useEffect, useState } from "react";
import { listarProfessores } from "@/services/professores";
import type { ProfessorComSituacao } from "@/types";

/** Carrega os professores do curso uma vez; busca e filtros são aplicados na tela. */
export function useProfessores() {
  const [professores, setProfessores] = useState<ProfessorComSituacao[] | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setProfessores(null);
    try {
      setProfessores(await listarProfessores());
    } catch {
      setFalhou(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function adicionar(novos: ProfessorComSituacao[]) {
    setProfessores((atuais) => atuais && [...atuais, ...novos]);
  }

  return { professores, falhou, recarregar: carregar, adicionar };
}
