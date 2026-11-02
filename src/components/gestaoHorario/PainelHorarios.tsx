"use client";

import { useState } from "react";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { ModalConfirmacao } from "@/components/ui/ModalConfirmacao";
import { separarPorResposta, situacaoDaGestao } from "@/lib/gestaoFormulario";
import { etapaAtual, maisRecentes, pedidosNaoLidos, previasVisiveis } from "@/lib/gestaoHorario";
import { AcoesGeracao } from "./AcoesGeracao";
import { CartaoGeracaoHorario } from "./CartaoGeracaoHorario";
import { EsqueletoHorarios } from "./EsqueletoHorarios";
import { ListaHorarios } from "./ListaHorarios";
import { ModalHistoricoVersoes } from "./ModalHistoricoVersoes";
import { PendenciasHorario } from "./PendenciasHorario";
import { ResumoFormularioGeracao } from "./ResumoFormularioGeracao";
import { useAcoesHorario } from "./useAcoesHorario";
import { useGestaoHorario } from "./useGestaoHorario";
import estilos from "./GestaoHorario.module.css";

/** Aba Horários do administrador: gerar, revisar, bloquear e oficializar (RF 3, RF 4, RF 8.11–8.12). */
export function PainelHorarios() {
  const { dados, falhou, recarregar, ...servicos } = useGestaoHorario();
  const [historicoAberto, setHistoricoAberto] = useState(false);

  const atuais = dados ? maisRecentes(dados.grades) : [];
  const { responderam, pendentes } = separarPorResposta(dados?.professores ?? []);
  const visiveis = previasVisiveis(atuais);
  const acoes = useAcoesHorario(servicos, {
    atuais,
    turmas: dados?.turmas ?? [],
    respostasPendentes: pendentes.length,
    previasVisiveis: visiveis,
  });

  if (falhou) {
    return (
      <ErroCarregamento titulo="Não foi possível carregar os horários" aoTentarNovamente={recarregar} />
    );
  }

  if (!dados) return <EsqueletoHorarios />;

  const { grades, turmas, formulario, solicitacoes } = dados;
  const situacaoFormulario = situacaoDaGestao(formulario);

  return (
    <div className={estilos.painel}>
      <CartaoGeracaoHorario etapa={etapaAtual(situacaoFormulario, atuais)}>
        <ResumoFormularioGeracao
          formulario={formulario}
          situacao={situacaoFormulario}
          respondidos={responderam.length}
          total={responderam.length + pendentes.length}
          aoEncerrar={acoes.pedirEncerramento}
        />
        <AcoesGeracao
          aguardandoFormulario={situacaoFormulario !== "encerrado"}
          respostasPendentes={pendentes.length}
          temHorario={atuais.length > 0}
          temPrevia={atuais.some((g) => g.status === "previa")}
          previasVisiveis={visiveis}
          emAndamento={acoes.emAndamento}
          aoGerar={acoes.pedirGeracao}
          aoOficializar={acoes.pedirOficializacao}
          aoAlternarVisibilidade={acoes.alternarVisibilidade}
          aoAbrirHistorico={() => setHistoricoAberto(true)}
        />
      </CartaoGeracaoHorario>

      {atuais.length === 0 ? (
        <EstadoVazio
          contorno
          titulo="Nenhum horário gerado"
          descricao={
            situacaoFormulario === "encerrado"
              ? "Gere o horário para ver a prévia de cada turma. Você poderá revisar, ajustar e bloquear aulas antes de oficializar."
              : "Assim que o formulário for encerrado, gere o horário para ver a prévia de cada turma."
          }
        />
      ) : (
        <>
          <PendenciasHorario atuais={atuais} pedidosNaoLidos={pedidosNaoLidos(solicitacoes, atuais, turmas)} />
          <ListaHorarios
            atuais={atuais}
            turmas={turmas}
            turmasAfetadas={acoes.turmasAfetadas}
            idAlternando={acoes.idAlternando}
            aoAlternarBloqueio={acoes.alternarBloqueio}
          />
        </>
      )}

      <ModalHistoricoVersoes aberto={historicoAberto} aoFechar={() => setHistoricoAberto(false)} grades={grades} turmas={turmas} />
      <ModalConfirmacao pedido={acoes.confirmacao} aoFechar={acoes.fecharConfirmacao} />
    </div>
  );
}
