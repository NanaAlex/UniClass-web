"use client";

import { useCallback, useEffect, useState } from "react";
import {
  atualizarPrazo,
  encerrarFormulario,
  lancarFormulario,
  obterFormularioAtual,
  type DadosLancamento,
} from "@/services/formularios";
import { listarProfessores } from "@/services/professores";
import type { Formulario, ProfessorComSituacao } from "@/types";

/** Formulário atual + professores do curso (quem respondeu sai de `formularioRespondidoEm`). */
export function useGestaoFormulario() {
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [professores, setProfessores] = useState<ProfessorComSituacao[] | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setFormulario(null);
    setProfessores(null);
    try {
      const [atual, lista] = await Promise.all([obterFormularioAtual(), listarProfessores()]);
      setFormulario(atual);
      setProfessores(lista);
    } catch {
      setFalhou(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function lancar(dados: DadosLancamento) {
    const novo = await lancarFormulario(dados);
    // As respostas são do formulário anterior: a situação de cada professor muda
    setProfessores(await listarProfessores());
    setFormulario(novo);
  }

  async function alterarPrazo(prazo: Pick<Formulario, "inicio" | "fim">) {
    if (formulario) setFormulario(await atualizarPrazo(formulario.id, prazo));
  }

  async function encerrar() {
    if (formulario) setFormulario(await encerrarFormulario(formulario.id));
  }

  return { formulario, professores, falhou, recarregar: carregar, lancar, alterarPrazo, encerrar };
}
