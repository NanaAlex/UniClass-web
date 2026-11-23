"use client";

import { useCallback, useEffect, useState } from "react";
import { obterRespostaDoProfessor } from "@/services/gestaoProfessores";
import type { Disciplina, Formulario, RespostaFormulario } from "@/types";

export type DadosResposta = {
  formulario: Formulario;
  resposta: RespostaFormulario | null;
  disciplinas: Disciplina[];
};

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "pronto"; dados: DadosResposta };

/** Formulário mais recente do admin, resposta do professor e disciplinas, vindos do back (CU-012). */
export function useRespostaFormulario(professorId: string) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });

  const carregar = useCallback(async () => {
    setEstado({ tipo: "carregando" });
    try {
      setEstado({ tipo: "pronto", dados: await obterRespostaDoProfessor(professorId) });
    } catch {
      setEstado({ tipo: "erro" });
    }
  }, [professorId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { estado, recarregar: carregar };
}
