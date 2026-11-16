"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { resumirMudancas } from "@/lib/resumoDados";
import { obterDadosAcademicos, salvarDadosAcademicos } from "@/services/administrador";
import type { DadosAcademicos } from "@/types";

/** Carrega os dados da aba Dados e guarda as edições locais até o administrador salvar (o back grava tudo ou nada). */
export function useDadosAcademicos() {
  /** Como está no banco: base do resumo do que falta salvar. */
  const [salvos, setSalvos] = useState<DadosAcademicos | null>(null);
  const [dados, setDados] = useState<DadosAcademicos | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      const doBanco = await obterDadosAcademicos();
      setSalvos(doBanco);
      setDados(doBanco);
    } catch {
      setFalhou(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atualizar = useCallback((transformar: (atuais: DadosAcademicos) => DadosAcademicos) => {
    setDados((atuais) => atuais && transformar(atuais));
  }, []);

  // Desfazer uma edição tira ela do resumo: "alterado" vem da comparação, não do clique
  const mudancas = useMemo(() => (salvos && dados ? resumirMudancas(salvos, dados) : []), [salvos, dados]);

  async function salvar() {
    if (!dados) return;
    setSalvando(true);
    try {
      const gravados = await salvarDadosAcademicos(dados);
      setSalvos(gravados);
      setDados(gravados);
    } finally {
      setSalvando(false);
    }
  }

  return { dados, falhou, mudancas, alterado: mudancas.length > 0, salvando, recarregar: carregar, atualizar, salvar };
}
