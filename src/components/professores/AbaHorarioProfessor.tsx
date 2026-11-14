"use client";

import { useCallback, useEffect, useState } from "react";
import { QuadroHorarioProfessor } from "@/components/horario/QuadroHorarioProfessor";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { nomeExibido } from "@/lib/professores";
import { obterHorarioDoProfessor, type HorarioDoProfessor } from "@/services/gestaoProfessores";
import type { ProfessorComSituacao } from "@/types";
import estilos from "./PainelPerfilProfessor.module.css";

type Dados = HorarioDoProfessor;

/** RF 8.8: aulas do professor na grade mais recente de cada turma, inclusive prévias ainda ocultas. */
export function AbaHorarioProfessor({ professor }: { professor: ProfessorComSituacao }) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      setDados(await obterHorarioDoProfessor(professor.id));
    } catch {
      setFalhou(true);
    }
  }, [professor.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (falhou) {
    return (
      <ErroCarregamento titulo="Não foi possível carregar o horário" aoTentarNovamente={carregar} />
    );
  }

  if (!dados) {
    return (
      <div className={estilos.esqueleto} aria-busy="true" aria-label="Carregando horário">
        <Esqueleto largura="40%" altura="1.5rem" />
        <Esqueleto largura="180px" />
        <Esqueleto forma="bloco" altura="360px" />
      </div>
    );
  }

  if (dados.horario.aulas.length === 0) {
    return (
      <EstadoVazio
        contorno
        titulo="Nenhuma aula no horário"
        descricao={`${nomeExibido(professor)} não tem aulas nas grades geradas até agora.`}
      />
    );
  }

  return <QuadroHorarioProfessor nomeProfessor={nomeExibido(professor)} horario={dados.horario} estruturas={dados.estruturas} />;
}
