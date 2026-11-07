"use client";

import { useCallback, useEffect, useState } from "react";
import { listarDisciplinasDoFormulario, obterFormularioAtual, obterRespostaDoProfessor } from "@/services/formularios";
import type { Disciplina, Formulario, RespostaFormulario } from "@/types";

export type DadosResposta = {
  formulario: Formulario;
  resposta: RespostaFormulario | null;
  disciplinas: Disciplina[];
};

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "pronto"; dados: DadosResposta };

/** Formulário atual, resposta do professor e disciplinas disponíveis, carregados pelos services. */
export function useRespostaFormulario(professorId: string) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });

  const carregar = useCallback(async () => {
    setEstado({ tipo: "carregando" });
    try {
      const formulario = await obterFormularioAtual();
      const [resposta, disciplinas] = await Promise.all([
        obterRespostaDoProfessor(formulario.id, professorId),
        listarDisciplinasDoFormulario(formulario),
      ]);
      setEstado({ tipo: "pronto", dados: { formulario, resposta, disciplinas } });
    } catch {
      setEstado({ tipo: "erro" });
    }
  }, [professorId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { estado, recarregar: carregar };
}
