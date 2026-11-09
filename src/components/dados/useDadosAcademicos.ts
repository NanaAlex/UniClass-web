"use client";

import { useCallback, useEffect, useState } from "react";
import { obterDadosAcademicos, salvarDadosAcademicos } from "@/services/academico";
import type { DadosAcademicos } from "@/types";

/** Carrega os dados da aba Dados e guarda as edições locais até o administrador salvar. */
export function useDadosAcademicos() {
  const [dados, setDados] = useState<DadosAcademicos | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [alterado, setAlterado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      setDados(await obterDadosAcademicos());
      setAlterado(false);
    } catch {
      setFalhou(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atualizar = useCallback((transformar: (atuais: DadosAcademicos) => DadosAcademicos) => {
    setDados((atuais) => atuais && transformar(atuais));
    setAlterado(true);
  }, []);

  /** Rejeita com ConfirmacaoEstruturalNecessaria quando a mudança encerra a edição do formulário (RN-38). */
  async function salvar(confirmarAlteracaoEstrutural = false) {
    if (!dados) return null;
    setSalvando(true);
    try {
      const resultado = await salvarDadosAcademicos(dados, { confirmarAlteracaoEstrutural });
      setDados(resultado.dados);
      setAlterado(false);
      return resultado;
    } finally {
      setSalvando(false);
    }
  }

  return { dados, falhou, alterado, salvando, recarregar: carregar, atualizar, salvar };
}
