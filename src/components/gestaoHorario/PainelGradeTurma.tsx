"use client";

import { useState } from "react";
import { GradeHorario } from "@/components/horario/GradeHorario";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { temGradeValidada } from "@/lib/geracao";
import {
  blocosComPedido,
  gradeTurmaTravada,
  posicoesTravadas,
  solicitacoesDaTurma,
  travasDaPosicaoTurma,
  travasDaTurma,
} from "@/lib/gestaoHorario";
import { rotuloTurma } from "@/lib/horario";
import type { AcaoEdicao, Coordenada } from "@/types";
import { BarraEdicaoGrade } from "./BarraEdicaoGrade";
import { CabecalhoGrade } from "./CabecalhoGradeTurma";
import { EstadoGrade, GradeSemValidacao } from "./EstadosGrade";
import { ListaTravas } from "./ListaTravas";
import { ModalFixarDisciplina } from "./ModalFixarDisciplina";
import { SecaoSolicitacoesGrade } from "./SecaoSolicitacoesGrade";
import { useEdicaoExecucao } from "./useEdicaoExecucao";
import { useExecucao } from "./useExecucao";
import estilos from "./GradeTurma.module.css";

const AVISO_IRREVERSIVEL =
  "As travas passam a valer como restrições obrigatórias nas próximas gerações deste período e não podem ser removidas nesta versão do sistema. A grade só muda quando você gerar novamente.";

/** Grade de uma turma numa execução validada: trocas na mesma turma, travas e fixações (RN-40 a RN-58, RN-64). */
export function PainelGradeTurma({ execucaoId, turmaId }: { execucaoId: string; turmaId: string }) {
  const { mostrarAviso } = useAvisos();
  const { dados, estado, recarregar, registrar, marcarLida } = useExecucao(execucaoId);
  const edicao = useEdicaoExecucao(dados?.execucao ?? null, dados?.travas ?? [], dados?.edicao ?? null, (motivo) =>
    mostrarAviso({ tipo: "aviso", titulo: "Ação recusada", descricao: motivo }),
  );
  const [registrando, setRegistrando] = useState(false);
  const [fixando, setFixando] = useState(false);
  const [confirmacao, setConfirmacao] = useState<PedidoConfirmacao | null>(null);

  const carregamento = <EstadoGrade estado={estado} aoTentarNovamente={recarregar} />;
  if (!dados || estado !== "pronto") return carregamento;

  const { execucao, travas, nomes } = dados;
  const turma = dados.edicao.turmas.find((t) => t.id === turmaId);
  const estrutura = dados.edicao.estruturas.find((e) => e.turno === turma?.turno);
  if (!turma || !estrutura) return <EstadoGrade estado="nao_encontrada" aoTentarNovamente={recarregar} />;
  if (!temGradeValidada(execucao)) return <GradeSemValidacao execucaoId={execucaoId} />;

  const grade = edicao.porTurma.find((g) => g.turmaId === turmaId);
  if (!grade) {
    return <EstadoVazio contorno titulo="Turma fora desta execução" descricao="A turma não fazia parte do snapshot desta geração." />;
  }

  const solicitacoes = solicitacoesDaTurma(dados.solicitacoes, turma);
  const travadas = posicoesTravadas(grade, travas);
  const travaDe = (c: Coordenada) =>
    travasDaPosicaoTurma(travas, turmaId, c).length > 0 ? "existente" : travasDaPosicaoTurma(edicao.travasPendentes, turmaId, c).length > 0 ? "pendente" : null;

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

  function pedirTravarTurma() {
    setConfirmacao({
      titulo: `Travar a grade inteira de ${rotuloTurma(turma!)}?`,
      descricao: `Todas as posições da turma (ocupadas e vagas) ficam como estão nesta grade. ${AVISO_IRREVERSIVEL}`,
      rotuloAcao: "Travar grade da turma",
      variante: "primario",
      aoConfirmar: () => enviar([{ acao: "bloquear_grade_turma", turmaId }]),
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
        titulo={`Horário do ${rotuloTurma(turma)}`}
        execucao={execucao}
        resumoTravas={`${travadas} de ${grade.posicoes.length} posições travadas`}
        editando={edicao.editando}
        tudoTravado={gradeTurmaTravada(grade, travas)}
        rotuloTravarTudo="Travar grade da turma"
        travandoTudo={registrando && !edicao.editando}
        aoEditar={edicao.iniciar}
        aoTravarTudo={pedirTravarTurma}
      />

      {!execucao.publicadaEm && !edicao.editando && execucao.status !== "OTIMA_COMPROVADA" && (
        <Aviso
          tipo="info"
          embutido
          titulo="Grade válida, sem prova de ótimo"
          descricao="Ela pode servir de base para travas e trocas, mas não pode ser publicada. Gere novamente para obter outra execução."
        />
      )}

      {edicao.editando && (
        <BarraEdicaoGrade
          instrucao="Clique num bloco e depois em outra posição desta turma para trocá-los: o bloco inteiro muda de lugar e as duas posições ficam travadas. Use o cadeado para travar uma posição como está."
          pendentes={edicao.pendentes}
          nomes={nomes}
          registrando={registrando}
          extras={
            <Botao variante="secundario" onClick={() => setFixando(true)} disabled={registrando}>
              Fixar professor de disciplina
            </Botao>
          }
          aoDesfazerUltima={edicao.desfazerUltima}
          aoDescartar={descartar}
          aoRegistrar={pedirRegistro}
        />
      )}

      <GradeHorario
        estrutura={estrutura}
        aulasPorBloco={execucao.aulasPorBloco}
        posicoes={grade.posicoes}
        nomes={nomes}
        rotuloAcessivel={`Horário do ${rotuloTurma(turma)}`}
        infoSecundaria="professor"
        modo={edicao.editando ? "editar" : "visualizar"}
        travaDe={travaDe}
        selecionada={edicao.selecao?.turmaId === turmaId ? edicao.selecao : null}
        aoEscolher={edicao.editando ? (b) => edicao.escolher({ dia: b.dia, turno: b.turno, indice: b.indice, turmaId }) : undefined}
        aoTravar={
          edicao.editando
            ? (b) => edicao.adicionar({ acao: "bloquear_bloco_turma", turmaId, coordenada: { dia: b.dia, turno: b.turno, indice: b.indice } })
            : undefined
        }
        comPedido={blocosComPedido(solicitacoes)}
      />

      <ListaTravas
        id="titulo-travas-turma"
        titulo="Travas desta turma"
        travas={travasDaTurma(travas, turma)}
        nomes={nomes}
        mensagemVazia="Nenhuma posição desta turma foi travada e nenhuma disciplina do semestre foi fixada."
      />

      <SecaoSolicitacoesGrade solicitacoes={solicitacoes} aoMarcarLida={marcarLida} />

      <ModalFixarDisciplina
        aberto={fixando}
        semestre={turma.semestre}
        disciplinas={dados.edicao.disciplinas.filter((d) => d.semestre === turma.semestre)}
        respostas={dados.edicao.respostas}
        nomes={nomes}
        aoFechar={() => setFixando(false)}
        aoFixar={(disciplinaId, professorId) => edicao.adicionar({ acao: "fixar_disciplina_professor_semestre", semestre: turma.semestre, disciplinaId, professorId })}
      />
      <ModalConfirmacao pedido={confirmacao} aoFechar={() => setConfirmacao(null)} />
    </div>
  );
}
