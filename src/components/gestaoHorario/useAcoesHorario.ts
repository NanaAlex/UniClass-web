"use client";

import { useState } from "react";
import type { PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { ConfirmacaoGeracaoNecessaria } from "@/services/horarios";
import type { Execucao, ProfessorResumo } from "@/types";
import type { useGestaoHorario } from "./useGestaoHorario";

type Acoes = Pick<ReturnType<typeof useGestaoHorario>, "gerar" | "publicar" | "encerrar">;

export type AcaoGeracao = "gerar" | "publicar";

const mensagemErro = (erro: unknown) => (erro instanceof Error ? erro.message : "Tente novamente em instantes.");

/** Confirmações, carregamento e avisos (toasts) das ações da aba Horários. */
export function useAcoesHorario(acoes: Acoes, { pendentes, travas }: { pendentes: ProfessorResumo[]; travas: number }) {
  const { mostrarAviso } = useAvisos();
  const [emAndamento, setEmAndamento] = useState<AcaoGeracao | null>(null);
  const [confirmacao, setConfirmacao] = useState<PedidoConfirmacao | null>(null);
  /** RN-37, CA-83: lista nominal dos pendentes antes da geração antecipada. */
  const [antecipada, setAntecipada] = useState<ProfessorResumo[] | null>(null);

  async function executar(acao: AcaoGeracao, tarefa: () => Promise<void>, falha: string) {
    setEmAndamento(acao);
    try {
      await tarefa();
    } catch (erro) {
      mostrarAviso({ tipo: "perigo", titulo: falha, descricao: mensagemErro(erro) });
      throw erro;
    } finally {
      setEmAndamento(null);
    }
  }

  const gerar = (confirmada: boolean) =>
    executar(
      "gerar",
      async () => {
        try {
          await acoes.gerar(confirmada);
        } catch (erro) {
          if (erro instanceof ConfirmacaoGeracaoNecessaria) {
            setAntecipada(erro.pendentes);
            return;
          }
          throw erro;
        }
        setAntecipada(null);
        mostrarAviso({
          tipo: "info",
          titulo: "Geração iniciada",
          descricao: `O motor tem até 600 segundos. ${travas > 0 ? `As ${travas} travas do período entram como restrições obrigatórias.` : ""}`.trim(),
        });
      },
      "Não foi possível iniciar a geração",
    );

  function pedirGeracao() {
    if (pendentes.length > 0) return setAntecipada(pendentes);
    gerar(false).catch(() => {});
  }

  function pedirPublicacao(execucao: Execucao) {
    setConfirmacao({
      titulo: "Publicar esta grade?",
      descricao:
        "A grade ótima comprovada passa a ser a vigente: os professores veem o próprio horário com todas as coordenadas. A publicação anterior continua no histórico.",
      rotuloAcao: "Publicar grade",
      variante: "primario",
      aoConfirmar: () =>
        executar(
          "publicar",
          async () => {
            await acoes.publicar(execucao.id);
            mostrarAviso({ tipo: "sucesso", titulo: "Grade publicada", descricao: "Os professores já podem consultar o horário." });
          },
          "Não foi possível publicar",
        ),
    });
  }

  function pedirEncerramento(respostasPendentes: number) {
    setConfirmacao({
      titulo: "Encerrar formulário agora?",
      descricao: `${respostasPendentes === 1 ? "1 professor ainda não respondeu" : `${respostasPendentes} professores ainda não responderam`} e não poderá mais enviar a resposta.`,
      rotuloAcao: "Encerrar formulário",
      aoConfirmar: async () => {
        try {
          await acoes.encerrar();
          mostrarAviso({ tipo: "sucesso", titulo: "Formulário encerrado", descricao: "A próxima geração usa as respostas enviadas até agora." });
        } catch (erro) {
          mostrarAviso({ tipo: "perigo", titulo: "Não foi possível encerrar o formulário", descricao: mensagemErro(erro) });
          throw erro;
        }
      },
    });
  }

  return {
    emAndamento,
    confirmacao,
    fecharConfirmacao: () => setConfirmacao(null),
    antecipada,
    fecharAntecipada: () => setAntecipada(null),
    confirmarAntecipada: () => gerar(true),
    pedirGeracao,
    pedirPublicacao,
    pedirEncerramento,
  };
}
