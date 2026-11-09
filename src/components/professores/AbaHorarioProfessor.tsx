"use client";

import { useCallback, useEffect, useState } from "react";
import { QuadroHorarioProfessor } from "@/components/horario/QuadroHorarioProfessor";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { rotulosStatus, temGradeValidada } from "@/lib/geracao";
import { criarNomes, execucaoVigente, hrefGradeProfessor, ordenarExecucoes, type Nomes } from "@/lib/gestaoHorario";
import { nomeExibido } from "@/lib/professores";
import { listarDisciplinas, listarEstruturasTurno, listarTurmas } from "@/services/academico";
import { listarExecucoes } from "@/services/horarios";
import type { EstruturaTurno, Execucao, ProfessorComSituacao } from "@/types";
import estilos from "./PainelPerfilProfessor.module.css";

type Dados = { execucao: Execucao | null; estruturas: EstruturaTurno[]; nomes: Nomes };

/**
 * RF 8.8: a grade do professor na execução mais relevante para o administrador: a vigente (publicada)
 * ou, sem publicação, a última com grade validada, identificada como não publicada.
 */
export function AbaHorarioProfessor({ professor }: { professor: ProfessorComSituacao }) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      const [execucoes, estruturas, disciplinas, turmas] = await Promise.all([listarExecucoes(), listarEstruturasTurno(), listarDisciplinas(), listarTurmas()]);
      const execucao = execucaoVigente(execucoes) ?? ordenarExecucoes(execucoes).find(temGradeValidada) ?? null;
      setDados({ execucao, estruturas, nomes: criarNomes(disciplinas, [], turmas) });
    } catch {
      setFalhou(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (falhou) return <ErroCarregamento titulo="Não foi possível carregar o horário" aoTentarNovamente={carregar} />;

  if (!dados) {
    return (
      <div className={estilos.esqueleto} aria-busy="true" aria-label="Carregando horário">
        <Esqueleto largura="40%" altura="1.5rem" />
        <Esqueleto largura="180px" />
        <Esqueleto forma="bloco" altura="360px" />
      </div>
    );
  }

  const { execucao } = dados;
  const projecao = execucao?.grade?.porProfessor.find((p) => p.professorId === professor.id);

  if (!execucao || !projecao || projecao.posicoes.every((b) => !b.disciplinaId)) {
    return (
      <EstadoVazio
        contorno
        titulo="Nenhuma aula na grade"
        descricao={`${nomeExibido(professor)} não tem aulas na grade publicada nem na última grade validada. Professores sem resposta enviada não participam da geração.`}
      />
    );
  }

  const status = rotulosStatus[execucao.status];

  return (
    <>
      <QuadroHorarioProfessor
        nomeProfessor={nomeExibido(professor)}
        posicoes={projecao.posicoes}
        aulasPorBloco={execucao.aulasPorBloco}
        estruturas={dados.estruturas}
        nomes={dados.nomes}
        situacao={execucao.publicadaEm ? { rotulo: "Publicado", variante: "sucesso" } : { rotulo: `Não publicado · ${status.rotulo}`, variante: "aviso" }}
        publicadoEm={execucao.publicadaEm}
      />
      <LinkBotao href={hrefGradeProfessor(execucao.id, professor.id)} variante="secundario">
        Abrir na aba Horários para travar
      </LinkBotao>
    </>
  );
}
