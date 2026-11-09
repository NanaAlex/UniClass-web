"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { criarNomes, type Nomes } from "@/lib/gestaoHorario";
import { listarDisciplinas, listarTurmas } from "@/services/academico";
import { encerrarFormulario, obterFormularioAtual } from "@/services/formularios";
import {
  gerarHorario,
  listarExecucoes,
  listarTravas,
  obterContextoGeracao,
  publicarExecucao,
  type ContextoGeracao,
} from "@/services/horarios";
import { listarProfessores } from "@/services/professores";
import { listarSolicitacoes } from "@/services/solicitacoes";
import type { Execucao, Formulario, Solicitacao, Trava, Turma } from "@/types";

export type DadosHorarios = {
  formulario: Formulario;
  contexto: ContextoGeracao;
  execucoes: Execucao[];
  travas: Trava[];
  turmas: Turma[];
  nomes: Nomes;
  /** Pedidos de alteração de horário (RF 3.4, RF 4.4). */
  solicitacoes: Solicitacao[];
};

const INTERVALO_ACOMPANHAMENTO_MS = 1500;

/** Tudo o que a aba Horários precisa. Enquanto houver execução em processamento, acompanha o status. */
export function useGestaoHorario(aoConcluirExecucao: (execucao: Execucao) => void) {
  const [dados, setDados] = useState<DadosHorarios | null>(null);
  const [falhou, setFalhou] = useState(false);
  const aoConcluir = useRef(aoConcluirExecucao);
  aoConcluir.current = aoConcluirExecucao;

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      const [formulario, contexto, execucoes, travas, turmas, disciplinas, professores, solicitacoes] = await Promise.all([
        obterFormularioAtual(),
        obterContextoGeracao(),
        listarExecucoes(),
        listarTravas(),
        listarTurmas(),
        listarDisciplinas(),
        listarProfessores(),
        listarSolicitacoes({ tipo: "horario" }),
      ]);
      const nomes = criarNomes(disciplinas, professores, turmas);
      setDados({ formulario, contexto, execucoes, travas, turmas, nomes, solicitacoes });
    } catch {
      setFalhou(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const emProcessamento = dados?.execucoes.find((e) => e.status === "EM_PROCESSAMENTO")?.id;

  useEffect(() => {
    if (!emProcessamento) return;
    const timer = setInterval(async () => {
      const execucoes = await listarExecucoes();
      setDados((atual) => atual && { ...atual, execucoes });
      const concluida = execucoes.find((e) => e.id === emProcessamento);
      if (concluida && concluida.status !== "EM_PROCESSAMENTO") aoConcluir.current(concluida);
    }, INTERVALO_ACOMPANHAMENTO_MS);
    return () => clearInterval(timer);
  }, [emProcessamento]);

  async function gerar(confirmarGeracaoAntecipada: boolean) {
    const nova = await gerarHorario({ confirmarGeracaoAntecipada });
    setDados((atual) => atual && { ...atual, execucoes: [nova, ...atual.execucoes] });
    return nova;
  }

  async function publicar(id: string) {
    const publicada = await publicarExecucao(id);
    setDados((atual) => atual && { ...atual, execucoes: atual.execucoes.map((e) => (e.id === id ? publicada : e)) });
  }

  async function encerrar() {
    if (!dados) return;
    const formulario = await encerrarFormulario(dados.formulario.id);
    const contexto = await obterContextoGeracao();
    setDados((atual) => atual && { ...atual, formulario, contexto });
  }

  return { dados, falhou, recarregar: carregar, gerar, publicar, encerrar };
}
