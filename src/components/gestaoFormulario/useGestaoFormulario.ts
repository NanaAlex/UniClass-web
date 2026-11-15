"use client";

import { useCallback, useEffect, useState } from "react";
import {
  atualizarPrazo,
  encerrarFormulario,
  lancarFormulario,
  listarProfessoresDoFormulario,
  obterFormularioAtual,
} from "@/services/administrador";
import type { DadosLancamento } from "@/services/formularios";
import type { Formulario, ProfessorComSituacao } from "@/types";

// Sem formulário lançado não há quem tenha respondido
const listarProfessores = (formulario: Formulario | null) =>
  formulario ? listarProfessoresDoFormulario(formulario.id) : Promise.resolve([]);

/**
 * Formulário atual + professores do curso (quem respondeu sai de `formularioRespondidoEm`).
 * `formulario`: undefined enquanto carrega · null quando nenhum foi lançado.
 */
export function useGestaoFormulario() {
  const [formulario, setFormulario] = useState<Formulario | null | undefined>(undefined);
  const [professores, setProfessores] = useState<ProfessorComSituacao[] | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setFormulario(undefined);
    setProfessores(null);
    try {
      const atual = await obterFormularioAtual();
      setProfessores(await listarProfessores(atual));
      setFormulario(atual);
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
    setProfessores(await listarProfessores(novo));
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
