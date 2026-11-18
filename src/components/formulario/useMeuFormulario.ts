"use client";

import { useCallback, useEffect, useState } from "react";
import { carregarMeuFormulario } from "@/services/professor";
import type { DadosResposta } from "./useRespostaFormulario";

/* 
   indisponivel: a coordenação ainda não lançou nenhum formulário
*/
type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro" }
  | { tipo: "indisponivel" }
  | { tipo: "pronto"; dados: DadosResposta };

/* 
   Versão do useRespostaFormulario que busca no back os dados do
   professor logado (tela /professor/formulario/resposta).
   O useRespostaFormulario continua com os mocks, porque a tela
   do administrador (AbaFormularioProfessor) também usa ele.
*/
export function useMeuFormulario(professorId: string) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });

  const carregar = useCallback(async () => {
    setEstado({ tipo: "carregando" });
    try {
      const { formulario, resposta, disciplinas } = await carregarMeuFormulario(professorId);
      if (!formulario) return setEstado({ tipo: "indisponivel" });
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