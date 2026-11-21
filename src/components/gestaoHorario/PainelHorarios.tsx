"use client";

import { useRouter } from "next/navigation";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { ModalConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { situacaoDaGestao } from "@/lib/gestaoFormulario";
import { rotulosStatus, temGradeValidada } from "@/lib/geracao";
import { etapaAtual, execucaoSelecionada, execucaoVigente, hrefExecucao, ordenarExecucoes } from "@/lib/gestaoHorario";
import type { Execucao } from "@/types";
import { AcoesGeracao } from "./AcoesGeracao";
import { CartaoGeracaoHorario } from "./CartaoGeracaoHorario";
import { EsqueletoHorarios } from "./EsqueletoHorarios";
import { HistoricoExecucoes } from "./HistoricoExecucoes";
import { ListaHorarios } from "./ListaHorarios";
import { ListaTravas } from "./ListaTravas";
import { ModalGeracaoAntecipada } from "./ModalGeracaoAntecipada";
import { PedidosNaoLidos } from "./PedidosNaoLidos";
import { ResultadoExecucao } from "./ResultadoExecucao";
import { ResumoFormularioGeracao } from "./ResumoFormularioGeracao";
import { useAcoesHorario } from "./useAcoesHorario";
import { useGestaoHorario } from "./useGestaoHorario";
import estilos from "./GestaoHorario.module.css";

/** Aba Horários do administrador: gerar com o motor, ler o resultado, travar e publicar (RN-27 a RN-37, RN-59, RN-60). */
export function PainelHorarios({ execucaoId }: { execucaoId?: string }) {
  const router = useRouter();
  const { mostrarAviso } = useAvisos();

  function aoConcluirExecucao(e: Execucao) {
    const status = rotulosStatus[e.status];
    mostrarAviso({
      tipo: e.status === "OTIMA_COMPROVADA" ? "sucesso" : e.status === "VALIDA_NAO_OTIMA" || e.status === "INCONCLUSIVA" ? "aviso" : "perigo",
      titulo: `Geração concluída: ${status.rotulo.toLowerCase()}`,
      descricao: e.painel.justificativa?.titulo ?? "Veja o resultado da execução.",
    });
    router.replace(hrefExecucao(e.id), { scroll: false });
  }

  const { dados, falhou, recarregar, ...servicos } = useGestaoHorario(aoConcluirExecucao);
  const acoes = useAcoesHorario(
    {
      ...servicos,
      // A nova execução (EM_PROCESSAMENTO) passa a ser a exibida
      gerar: async (confirmada) => {
        const nova = await servicos.gerar(confirmada);
        router.replace(hrefExecucao(nova.id), { scroll: false });
        return nova;
      },
    },
    { pendentes: dados?.contexto.pendentes ?? [], travas: dados?.travas.length ?? 0 },
  );

  if (falhou) return <ErroCarregamento titulo="Não foi possível carregar os horários" aoTentarNovamente={recarregar} />;
  if (!dados) return <EsqueletoHorarios />;

  const { formulario, contexto, execucoes, travas, turmas, nomes, solicitacoes } = dados;
  const situacaoFormulario = situacaoDaGestao(formulario);
  const semFormulario = situacaoFormulario === "sem_formulario" || situacaoFormulario === "agendado";
  const selecionada = execucaoSelecionada(execucoes, execucaoId);
  const vigente = execucaoVigente(execucoes);
  const emProcessamento = execucoes.some((e) => e.status === "EM_PROCESSAMENTO");
  const ultimaValidada = ordenarExecucoes(execucoes).find(temGradeValidada) ?? null;
  const professores = nomesDosProfessores(selecionada, nomes.professor);

  return (
    <div className={estilos.painel}>
      <CartaoGeracaoHorario etapa={etapaAtual(!semFormulario, execucoes)}>
        <ResumoFormularioGeracao
          formulario={formulario}
          situacao={situacaoFormulario}
          respondidos={contexto.enviados}
          total={contexto.ativos}
          aoEncerrar={() => acoes.pedirEncerramento(contexto.pendentes.length)}
        />
        <AcoesGeracao
          contexto={contexto}
          semFormulario={semFormulario}
          travas={travas.length}
          temExecucao={execucoes.length > 0}
          emProcessamento={emProcessamento}
          emAndamento={acoes.emAndamento}
          aoGerar={acoes.pedirGeracao}
        />
      </CartaoGeracaoHorario>

      <PedidosNaoLidos solicitacoes={solicitacoes} turmas={turmas} execucaoId={ultimaValidada?.id ?? null} />

      {!selecionada ? (
        <EstadoVazio
          contorno
          titulo="Nenhuma geração neste período"
          descricao="Gere o horário para ver o resultado do motor: status, custo, prova de ótimo e a grade de cada turma."
        />
      ) : (
        <>
          <ResultadoExecucao execucao={selecionada} publicando={acoes.emAndamento === "publicar"} aoPublicar={acoes.pedirPublicacao} />
          {temGradeValidada(selecionada) ? (
            <ListaHorarios execucao={selecionada} turmas={turmas} professores={professores} travas={travas} />
          ) : (
            selecionada.status !== "EM_PROCESSAMENTO" && (
              <EstadoVazio
                contorno
                titulo="Sem grade nesta execução"
                descricao="Só uma grade completa e aprovada pela validação independente é exibida. Corrija o que os diagnósticos apontam e gere novamente."
              />
            )
          )}
        </>
      )}

      <ListaTravas
        id="titulo-travas-periodo"
        titulo="Travas do período"
        travas={travas}
        nomes={nomes}
        mensagemVazia="Nenhuma trava registrada. Abra a grade de uma turma ou de um professor para travar posições."
      />

      {execucoes.length > 0 && <HistoricoExecucoes execucoes={execucoes} selecionadaId={selecionada?.id ?? null} vigenteId={vigente?.id ?? null} />}

      <ModalGeracaoAntecipada pendentes={acoes.antecipada} aoFechar={acoes.fecharAntecipada} aoConfirmar={acoes.confirmarAntecipada} />
      <ModalConfirmacao pedido={acoes.confirmacao} aoFechar={acoes.fecharConfirmacao} />
    </div>
  );
}

function nomesDosProfessores(execucao: Execucao | null, nome: (id: string) => string) {
  return (execucao?.grade?.porProfessor ?? []).map((p) => ({ id: p.professorId, nome: nome(p.professorId) }));
}
