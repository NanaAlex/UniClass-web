"use client";

import { useState } from "react";
import { GradeHorario } from "@/components/horario/GradeHorario";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { temGradeValidada } from "@/lib/geracao";
import { posicoesPorTurno, travasDaCoordenadaProfessor, travasDoProfessor } from "@/lib/gestaoHorario";
import { rotulosTurno } from "@/lib/horario";
import type { AcaoEdicao, BlocoGrade, Coordenada } from "@/types";
import { BarraEdicaoGrade } from "./BarraEdicaoGrade";
import { CabecalhoGrade } from "./CabecalhoGradeTurma";
import { EstadoGrade, GradeSemValidacao } from "./EstadosGrade";
import { ListaTravas } from "./ListaTravas";
import { useEdicaoExecucao } from "./useEdicaoExecucao";
import { useExecucao } from "./useExecucao";
import estilos from "./GradeTurma.module.css";

const AVISO_IRREVERSIVEL =
  "As travas passam a valer como restrições obrigatórias nas próximas gerações deste período e não podem ser removidas nesta versão do sistema.";

/**
 * Visão do professor numa execução validada: todas as coordenadas de todos os turnos (RN-69, CA-190),
 * travas por coordenada (ocupação ou vaga do professor) e trocas só dentro da mesma turma (RN-64).
 */
export function PainelGradeProfessor({ execucaoId, professorId }: { execucaoId: string; professorId: string }) {
  const { mostrarAviso } = useAvisos();
  const { dados, estado, recarregar, registrar } = useExecucao(execucaoId);
  const edicao = useEdicaoExecucao(dados?.execucao ?? null, dados?.travas ?? [], dados?.edicao ?? null, (motivo) =>
    mostrarAviso({ tipo: "aviso", titulo: "Ação recusada", descricao: motivo }),
  );
  const [registrando, setRegistrando] = useState(false);
  const [confirmacao, setConfirmacao] = useState<PedidoConfirmacao | null>(null);

  if (!dados || estado !== "pronto") return <EstadoGrade estado={estado} aoTentarNovamente={recarregar} />;
  const { execucao, travas, nomes } = dados;
  if (!temGradeValidada(execucao)) return <GradeSemValidacao execucaoId={execucaoId} />;
  const projecao = edicao.porProfessor.find((p) => p.professorId === professorId);
  if (!projecao) return <EstadoGrade estado="nao_encontrada" aoTentarNovamente={recarregar} />;

  const nome = nomes.professor(professorId);
  const K = execucao.aulasPorBloco;
  const ocupados = projecao.posicoes.filter((b) => b.disciplinaId).length;
  const travadas = projecao.posicoes.filter((b) => travasDaCoordenadaProfessor(travas, professorId, b).length > 0).length;
  const travaDe = (c: Coordenada) =>
    travasDaCoordenadaProfessor(travas, professorId, c).length > 0
      ? "existente"
      : travasDaCoordenadaProfessor(edicao.travasPendentes, professorId, c).length > 0
        ? "pendente"
        : null;

  /** Bloco ocupado: escolhe a posição da turma dele. Coordenada vaga: destino na turma do bloco escolhido. */
  function escolher(b: BlocoGrade) {
    const turmaId = b.turmaId ?? edicao.selecao?.turmaId;
    if (!turmaId) return;
    edicao.escolher({ dia: b.dia, turno: b.turno, indice: b.indice, turmaId });
  }

  async function enviar(acoes: AcaoEdicao[], aoConcluir?: () => void) {
    setRegistrando(true);
    try {
      const criadas = await registrar(acoes);
      mostrarAviso({
        tipo: "sucesso",
        titulo: criadas.length === 1 ? "1 trava registrada" : `${criadas.length} travas registradas`,
        descricao: "Gere o horário novamente para obter uma grade que respeite as travas.",
      });
      aoConcluir?.();
    } catch (erro) {
      mostrarAviso({ tipo: "perigo", titulo: "Nenhuma trava foi registrada", descricao: erro instanceof Error ? erro.message : "Tente novamente." });
      throw erro;
    } finally {
      setRegistrando(false);
    }
  }

  function pedirRegistro() {
    const total = edicao.travasPendentes.length;
    setConfirmacao({
      titulo: `Registrar ${total === 1 ? "1 trava" : `${total} travas`}?`,
      descricao: AVISO_IRREVERSIVEL,
      rotuloAcao: "Registrar travas",
      variante: "primario",
      aoConfirmar: () => enviar(edicao.pendentes.map((p) => p.acao), edicao.encerrar),
    });
  }

  function pedirTravarProfessor() {
    setConfirmacao({
      titulo: `Travar a grade inteira de ${nome}?`,
      descricao: `Cada coordenada do professor fica como está: as aulas viram ocupações fixas e as demais, vagas fixas do professor. ${AVISO_IRREVERSIVEL}`,
      rotuloAcao: "Travar grade do professor",
      variante: "primario",
      aoConfirmar: () => enviar([{ acao: "bloquear_grade_professor", professorId }]),
    });
  }

  function descartar() {
    if (edicao.pendentes.length === 0) return edicao.encerrar();
    setConfirmacao({
      titulo: "Descartar o rascunho?",
      descricao: "As ações ainda não registradas serão perdidas. Nenhuma trava foi gravada.",
      rotuloAcao: "Descartar",
      aoConfirmar: edicao.encerrar,
    });
  }

  return (
    <div className={estilos.painel}>
      <CabecalhoGrade
        titulo={`Horário de ${nome}`}
        execucao={execucao}
        resumoTravas={`${ocupados * K} aulas (${ocupados} blocos) · ${travadas} coordenadas travadas`}
        editando={edicao.editando}
        tudoTravado={travadas === projecao.posicoes.length}
        rotuloTravarTudo="Travar grade do professor"
        travandoTudo={registrando && !edicao.editando}
        aoEditar={edicao.iniciar}
        aoTravarTudo={pedirTravarProfessor}
      />

      {edicao.editando && (
        <BarraEdicaoGrade
          instrucao="Clique num bloco e depois noutra coordenada para trocá-lo dentro da mesma turma (a troca entre turmas não é permitida). Use o cadeado para travar uma coordenada: uma aula vira ocupação fixa; um horário vago, vaga fixa do professor."
          pendentes={edicao.pendentes}
          nomes={nomes}
          registrando={registrando}
          aoDesfazerUltima={edicao.desfazerUltima}
          aoDescartar={descartar}
          aoRegistrar={pedirRegistro}
        />
      )}

      <div className={estilos.turnos}>
        {posicoesPorTurno(projecao.posicoes).map(({ turno, posicoes }) => {
          const estrutura = dados.edicao.estruturas.find((e) => e.turno === turno);
          if (!estrutura) return null;
          return (
            <section key={turno} aria-labelledby={`turno-${turno}`}>
              <h2 id={`turno-${turno}`} className={estilos.tituloTurno}>
                {rotulosTurno[turno]}
              </h2>
              <GradeHorario
                estrutura={estrutura}
                aulasPorBloco={K}
                posicoes={posicoes}
                nomes={nomes}
                rotuloAcessivel={`Horário de ${nome}, ${rotulosTurno[turno].toLowerCase()}`}
                infoSecundaria="turma"
                modo={edicao.editando ? "editar" : "visualizar"}
                travaDe={travaDe}
                selecionada={edicao.selecao}
                aoEscolher={edicao.editando ? escolher : undefined}
                aoTravar={
                  edicao.editando
                    ? (b) => edicao.adicionar({ acao: "bloquear_bloco_professor", professorId, coordenada: { dia: b.dia, turno: b.turno, indice: b.indice } })
                    : undefined
                }
              />
            </section>
          );
        })}
      </div>

      <ListaTravas
        id="titulo-travas-professor"
        titulo="Travas deste professor"
        travas={travasDoProfessor(travas, professorId)}
        nomes={nomes}
        mensagemVazia="Nenhuma coordenada deste professor foi travada."
      />

      <ModalConfirmacao pedido={confirmacao} aoFechar={() => setConfirmacao(null)} />
    </div>
  );
}
