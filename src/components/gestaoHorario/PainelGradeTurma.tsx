"use client";

import { useState } from "react";
import { GradeHorario } from "@/components/horario/GradeHorario";
import { Aviso } from "@/components/ui/Aviso";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { hrefGrade, hrefHorarios, idsAulasComPedido } from "@/lib/gestaoHorario";
import { rotuloTurma } from "@/lib/horario";
import { BarraEdicaoGrade } from "./BarraEdicaoGrade";
import { CabecalhoGradeTurma } from "./CabecalhoGradeTurma";
import { PendenciasHorario } from "./PendenciasHorario";
import { SecaoSolicitacoesGrade } from "./SecaoSolicitacoesGrade";
import { useEdicaoGrade } from "./useEdicaoGrade";
import { useGradeTurma } from "./useGradeTurma";
import estilos from "./GradeTurma.module.css";

/** RF 3.3, 3.4, 3.11, 3.14: grade de uma turma, edição manual, bloqueios e pedidos de alteração. */
export function PainelGradeTurma({ gradeId }: { gradeId: string }) {
  const { mostrarAviso } = useAvisos();
  const { dados, estado, recarregar, salvar, alternarBloqueioTurma, marcarLida } = useGradeTurma(gradeId);
  const edicao = useEdicaoGrade(dados?.grade.aulas ?? [], dados?.outrasGrades ?? [], (motivo) =>
    mostrarAviso({ tipo: "aviso", titulo: "Não é possível mover esta aula", descricao: motivo }),
  );
  const [salvando, setSalvando] = useState(false);
  const [alternando, setAlternando] = useState(false);
  const [confirmacao, setConfirmacao] = useState<PedidoConfirmacao | null>(null);

  if (estado === "falhou") {
    return <ErroCarregamento titulo="Não foi possível carregar o horário" aoTentarNovamente={recarregar} />;
  }

  if (estado === "nao_encontrada") {
    return (
      <EstadoVazio
        contorno
        titulo="Horário não encontrado"
        descricao="Esta versão não existe ou foi removida."
        acao={
          <LinkBotao href={hrefHorarios} variante="secundario">
            Voltar para Horários
          </LinkBotao>
        }
      />
    );
  }

  if (!dados) {
    return (
      <div className={estilos.painel} aria-busy="true" aria-label="Carregando horário">
        <Esqueleto largura="120px" altura="32px" />
        <Esqueleto largura="40%" altura="2rem" />
        <Esqueleto largura="30%" />
        <Esqueleto forma="bloco" altura="420px" />
      </div>
    );
  }

  const { grade, turma, estrutura, idAtual, solicitacoes } = dados;
  const atual = grade.id === idAtual;

  async function salvarEdicao() {
    setSalvando(true);
    try {
      await salvar(edicao.aulas);
      mostrarAviso({ tipo: "sucesso", titulo: "Horário atualizado", descricao: `${edicao.alteracoes === 1 ? "1 aula alterada" : `${edicao.alteracoes} aulas alteradas`} no ${rotuloTurma(turma)}.` });
      edicao.encerrar();
    } catch {
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível salvar", descricao: "Suas alterações continuam aqui. Tente novamente." });
    } finally {
      setSalvando(false);
    }
  }

  function descartar() {
    if (edicao.alteracoes === 0) return edicao.encerrar();
    setConfirmacao({
      titulo: "Descartar alterações?",
      descricao: `${edicao.alteracoes === 1 ? "1 aula alterada será perdida" : `${edicao.alteracoes} aulas alteradas serão perdidas`}.`,
      rotuloAcao: "Descartar",
      aoConfirmar: edicao.encerrar,
    });
  }

  async function alternarBloqueio() {
    setAlternando(true);
    try {
      const bloqueada = await alternarBloqueioTurma();
      mostrarAviso({
        tipo: "sucesso",
        titulo: bloqueada ? "Turma bloqueada" : "Turma desbloqueada",
        descricao: bloqueada ? "A próxima geração mantém esta grade como está." : "A próxima geração refaz as aulas não bloqueadas.",
      });
    } catch {
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível alterar o bloqueio", descricao: "Tente novamente em instantes." });
    } finally {
      setAlternando(false);
    }
  }

  return (
    <div className={estilos.painel}>
      <CabecalhoGradeTurma
        grade={grade}
        turma={turma}
        atual={atual}
        editando={edicao.editando}
        alternandoBloqueio={alternando}
        aoEditar={edicao.iniciar}
        aoAlternarBloqueio={alternarBloqueio}
      />

      {!atual && (
        <div className={estilos.versaoAntiga}>
          <Aviso tipo="info" embutido titulo="Você está vendo uma versão antiga" descricao="Ela fica no histórico e não pode ser editada." />
          <LinkBotao href={hrefGrade(idAtual)} variante="secundario">Ver versão atual</LinkBotao>
        </div>
      )}

      {edicao.editando && (
        <BarraEdicaoGrade alteracoes={edicao.alteracoes} salvando={salvando} aoDescartar={descartar} aoSalvar={salvarEdicao} />
      )}

      <PendenciasHorario atuais={[grade]} pedidosNaoLidos={[]} naTurma />

      <GradeHorario
        estrutura={estrutura}
        aulas={edicao.aulas}
        modo={edicao.editando ? "editar" : "visualizar"}
        rotuloAcessivel={`Horário do ${rotuloTurma(turma)}, versão ${grade.versao}`}
        infoSecundaria="professor"
        mostrarBloqueio
        idAulaSelecionada={edicao.idSelecionada ?? undefined}
        aoEscolherHorario={edicao.editando ? edicao.escolher : undefined}
        aoAlternarBloqueio={edicao.alternar}
        idsComPedido={atual ? idsAulasComPedido(edicao.aulas, solicitacoes) : undefined}
        mensagemVazia="Esta versão não tem aulas alocadas."
      />

      {atual && <SecaoSolicitacoesGrade solicitacoes={solicitacoes} aoMarcarLida={marcarLida} />}
      <ModalConfirmacao pedido={confirmacao} aoFechar={() => setConfirmacao(null)} />
    </div>
  );
}
