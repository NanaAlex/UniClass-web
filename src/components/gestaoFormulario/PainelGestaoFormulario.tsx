"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { separarPorResposta, situacaoDaGestao } from "@/lib/gestaoFormulario";
import type { DadosLancamento } from "@/services/formularios";
import type { Formulario } from "@/types";
import { CartaoLancarFormulario } from "./CartaoLancarFormulario";
import { CartaoResumoFormulario } from "./CartaoResumoFormulario";
import { EsqueletoGestaoFormulario } from "./EsqueletoGestaoFormulario";
import { ListaRespostasFormulario } from "./ListaRespostasFormulario";
import { ModalEditarPrazo } from "./ModalEditarPrazo";
import { useGestaoFormulario } from "./useGestaoFormulario";
import estilos from "./GestaoFormulario.module.css";

const mensagemErro = (erro: unknown) => (erro instanceof Error ? erro.message : "Tente novamente em instantes.");

/** Aba Formulário do administrador: lançar, acompanhar e encerrar (RF 2.7–2.11). */
export function PainelGestaoFormulario() {
  const { mostrarAviso } = useAvisos();
  const { formulario, professores, falhou, recarregar, lancar, alterarPrazo, encerrar } = useGestaoFormulario();
  const [editandoPrazo, setEditandoPrazo] = useState(false);
  const [confirmacao, setConfirmacao] = useState<PedidoConfirmacao | null>(null);

  if (falhou) {
    return (
      <ErroCarregamento titulo="Não foi possível carregar o formulário" aoTentarNovamente={recarregar} />
    );
  }

  if (!formulario || !professores) return <EsqueletoGestaoFormulario />;

  const situacao = situacaoDaGestao(formulario);
  const { responderam, pendentes } = separarPorResposta(professores);

  async function aoLancar(dados: DadosLancamento) {
    try {
      await lancar(dados);
      const agendado = new Date(dados.inicio).getTime() > Date.now();
      mostrarAviso({
        tipo: "sucesso",
        titulo: agendado ? "Formulário agendado" : "Formulário lançado",
        descricao: agendado
          ? "Os professores serão notificados quando o período de respostas começar."
          : "Os professores foram notificados e já podem responder.",
      });
    } catch (erro) {
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível lançar o formulário", descricao: mensagemErro(erro) });
      throw erro;
    }
  }

  async function aoSalvarPrazo(prazo: Pick<Formulario, "inicio" | "fim">) {
    try {
      await alterarPrazo(prazo);
      setEditandoPrazo(false);
      mostrarAviso({ tipo: "sucesso", titulo: "Prazo atualizado", descricao: "Os professores veem a nova data no formulário." });
    } catch (erro) {
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível atualizar o prazo", descricao: mensagemErro(erro) });
      throw erro;
    }
  }

  function pedirEncerramento() {
    setConfirmacao({
      titulo: "Encerrar formulário agora?",
      descricao: `${pendentes.length === 1 ? "1 professor ainda não respondeu" : `${pendentes.length} professores ainda não responderam`} e não poderá mais enviar a resposta. Esta ação não pode ser desfeita.`,
      rotuloAcao: "Encerrar formulário",
      aoConfirmar: async () => {
        try {
          await encerrar();
          mostrarAviso({ tipo: "sucesso", titulo: "Formulário encerrado", descricao: "As respostas recebidas já podem ser usadas na geração do horário." });
        } catch (erro) {
          mostrarAviso({ tipo: "perigo", titulo: "Não foi possível encerrar o formulário", descricao: mensagemErro(erro) });
          throw erro;
        }
      },
    });
  }

  return (
    <div className={estilos.painel}>
      {(situacao === "sem_formulario" || situacao === "encerrado") && <CartaoLancarFormulario aoLancar={aoLancar} />}

      {situacao === "sem_formulario" ? (
        <EstadoVazio
          contorno
          titulo="Nenhum formulário ativo"
          descricao="Lance um formulário para coletar a disponibilidade e as preferências dos professores. Ele usa os dias, horários e disciplinas cadastrados em Dados."
        />
      ) : (
        <>
          {situacao === "encerrado" && <CabecalhoSecao titulo="Último formulário" />}
          <CartaoResumoFormulario
            formulario={formulario}
            situacao={situacao}
            respondidos={responderam.length}
            total={responderam.length + pendentes.length}
            aoEditarPrazo={() => setEditandoPrazo(true)}
            aoEncerrar={pedirEncerramento}
          />
          <ListaRespostasFormulario responderam={responderam} pendentes={pendentes} encerrado={situacao === "encerrado"} />
        </>
      )}

      {editandoPrazo && (
        <ModalEditarPrazo
          formulario={formulario}
          inicioBloqueado={situacao !== "agendado"}
          aoFechar={() => setEditandoPrazo(false)}
          aoSalvar={aoSalvarPrazo}
        />
      )}
      <ModalConfirmacao pedido={confirmacao} aoFechar={() => setConfirmacao(null)} />
    </div>
  );
}
