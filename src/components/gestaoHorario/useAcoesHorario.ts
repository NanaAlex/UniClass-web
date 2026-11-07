"use client";

import { useState } from "react";
import type { PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { rotuloTurma } from "@/lib/horario";
import type { Grade, Turma } from "@/types";
import type { AcaoGeracao } from "./AcoesGeracao";
import type { useGestaoHorario } from "./useGestaoHorario";

type Acoes = Omit<ReturnType<typeof useGestaoHorario>, "dados" | "falhou" | "recarregar">;

type Contexto = {
  atuais: Grade[];
  turmas: Turma[];
  respostasPendentes: number;
  previasVisiveis: boolean;
};

const mensagemErro = (erro: unknown) => (erro instanceof Error ? erro.message : "Tente novamente em instantes.");

/** Confirmações, carregamento e avisos (toasts) das ações da aba Horários. */
export function useAcoesHorario(acoes: Acoes, { atuais, turmas, respostasPendentes, previasVisiveis }: Contexto) {
  const { mostrarAviso } = useAvisos();
  const [emAndamento, setEmAndamento] = useState<AcaoGeracao | null>(null);
  const [idAlternando, setIdAlternando] = useState<string | null>(null);
  const [turmasAfetadas, setTurmasAfetadas] = useState<string[]>([]);
  const [confirmacao, setConfirmacao] = useState<PedidoConfirmacao | null>(null);

  const nomeTurma = (id: string) => {
    const turma = turmas.find((t) => t.id === id);
    return turma ? rotuloTurma(turma) : "A turma";
  };

  /** Rejeita de novo em caso de erro: o ModalConfirmacao continua aberto para tentar outra vez. */
  async function executar(acao: AcaoGeracao | null, tarefa: () => Promise<void>, falha: string) {
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

  const gerar = () =>
    executar(
      "gerar",
      async () => {
        const afetadas = await acoes.gerar();
        setTurmasAfetadas(afetadas);
        mostrarAviso({
          tipo: "sucesso",
          titulo: afetadas.length ? "Nova versão gerada" : "Nada para gerar",
          descricao: afetadas.length
            ? `Turmas afetadas: ${afetadas.map(nomeTurma).join("; ")}. Elas aparecem com a etiqueta "Nova versão".`
            : "Todas as turmas estão bloqueadas.",
        });
      },
      "Não foi possível gerar o horário",
    );

  function pedirGeracao() {
    if (atuais.length === 0) return void gerar().catch(() => {});
    const bloqueadas = atuais.filter((g) => g.bloqueada).length;
    setConfirmacao({
      titulo: "Gerar uma nova versão?",
      descricao: `As aulas bloqueadas${bloqueadas ? ` e ${bloqueadas === 1 ? "a turma bloqueada" : `as ${bloqueadas} turmas bloqueadas`}` : ""} serão mantidas; o restante será refeito. A versão atual continua no histórico.`,
      rotuloAcao: "Gerar nova versão",
      variante: "primario",
      aoConfirmar: gerar,
    });
  }

  function pedirOficializacao() {
    setConfirmacao({
      titulo: "Oficializar o horário?",
      descricao: "As prévias atuais viram o horário oficial e ficam visíveis para todos os professores, que serão notificados.",
      rotuloAcao: "Oficializar horário",
      variante: "primario",
      aoConfirmar: () =>
        executar(
          "oficializar",
          async () => {
            await acoes.oficializar();
            mostrarAviso({ tipo: "sucesso", titulo: "Horário oficializado", descricao: "Os professores já podem consultar o horário." });
          },
          "Não foi possível oficializar",
        ),
    });
  }

  function pedirEncerramento() {
    setConfirmacao({
      titulo: "Encerrar formulário agora?",
      descricao: `${respostasPendentes === 1 ? "1 professor ainda não respondeu" : `${respostasPendentes} professores ainda não responderam`} e não poderá mais enviar a resposta.`,
      rotuloAcao: "Encerrar formulário",
      aoConfirmar: () =>
        executar(
          null,
          async () => {
            await acoes.encerrar();
            mostrarAviso({ tipo: "sucesso", titulo: "Formulário encerrado", descricao: "Agora você já pode gerar o horário." });
          },
          "Não foi possível encerrar o formulário",
        ),
    });
  }

  function alternarVisibilidade() {
    executar(
      "visibilidade",
      async () => {
        await acoes.alterarVisibilidade(!previasVisiveis);
        mostrarAviso({
          tipo: "sucesso",
          titulo: previasVisiveis ? "Prévia oculta" : "Prévia disponível",
          descricao: previasVisiveis ? "Os professores não veem mais a prévia." : "Os professores já podem ver a prévia das suas aulas.",
        });
      },
      "Não foi possível alterar a visibilidade",
    ).catch(() => {});
  }

  async function alternarBloqueio(grade: Grade) {
    setIdAlternando(grade.id);
    try {
      const { bloqueada } = await acoes.alternarBloqueioTurma(grade);
      mostrarAviso({
        tipo: "sucesso",
        titulo: bloqueada ? "Turma bloqueada" : "Turma desbloqueada",
        descricao: `${nomeTurma(grade.turmaId)} ${bloqueada ? "será mantida como está" : "será refeita"} na próxima geração.`,
      });
    } catch (erro) {
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível alterar o bloqueio", descricao: mensagemErro(erro) });
    } finally {
      setIdAlternando(null);
    }
  }

  return {
    emAndamento,
    idAlternando,
    turmasAfetadas,
    confirmacao,
    fecharConfirmacao: () => setConfirmacao(null),
    pedirGeracao,
    pedirOficializacao,
    pedirEncerramento,
    alternarVisibilidade,
    alternarBloqueio,
  };
}
