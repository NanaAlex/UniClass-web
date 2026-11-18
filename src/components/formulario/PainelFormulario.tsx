"use client";

import { useCallback, useEffect, useState } from "react";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { motivoBloqueioSolicitacao, situacaoDoFormulario } from "@/lib/formulario";
import { carregarMeuFormulario, listarMinhasSolicitacoesFormulario, solicitarAlteracaoFormulario } from "@/services/professor";
import type { Formulario, RespostaFormulario, Solicitacao, UsuarioLogado } from "@/types";
import { CartaoSituacaoFormulario } from "./CartaoSituacaoFormulario";
import { ModalSolicitarAlteracao } from "./ModalSolicitarAlteracao";
import { SecaoSolicitacoesFormulario } from "./SecaoSolicitacoesFormulario";
import estilos from "./PainelFormulario.module.css";

type Dados = {
  formulario: Formulario | null; // null: a coordenação ainda não lançou nenhum formulário
  resposta: RespostaFormulario | null;
  solicitacoes: Solicitacao[];
};

/** Aba Formulário do professor: situação do formulário atual e pedidos de alteração (do back). */
export function PainelFormulario({ usuario }: { usuario: UsuarioLogado }) {
  const { mostrarAviso } = useAvisos();
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      const [{ formulario, resposta }, solicitacoes] = await Promise.all([
        carregarMeuFormulario(usuario.id),
        listarMinhasSolicitacoesFormulario(usuario.id),
      ]);
      setDados({ formulario, resposta, solicitacoes });
    } catch {
      setFalhou(true);
    }
  }, [usuario.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function solicitar(descricao: string) {
    if (!dados?.formulario) return;
    const nova = await solicitarAlteracaoFormulario({
      formularioId: dados.formulario.id,
      professor: { id: usuario.id, nome: usuario.nome },
      descricao,
    });
    setDados((atuais) => atuais && { ...atuais, solicitacoes: [nova, ...atuais.solicitacoes] });
    mostrarAviso({ tipo: "sucesso", titulo: "Solicitação enviada", descricao: "Avisaremos quando a coordenação responder." });
  }

  if (falhou) {
    return (
      <ErroCarregamento titulo="Não foi possível carregar o formulário" aoTentarNovamente={carregar} />
    );
  }

  const situacao = dados ? situacaoDoFormulario(dados.formulario, dados.resposta) : "indisponivel";

  return (
    <>
      {dados ? (
        <CartaoSituacaoFormulario formulario={dados.formulario} resposta={dados.resposta} situacao={situacao} />
      ) : (
        <div className={estilos.esqueletoCartao} aria-busy="true" aria-label="Carregando formulário">
          <Esqueleto largura="140px" altura="24px" />
          <Esqueleto largura="45%" altura="1.75rem" />
          <Esqueleto largura="70%" />
          <Esqueleto forma="bloco" altura="56px" />
        </div>
      )}

      <SecaoSolicitacoesFormulario
        solicitacoes={dados?.solicitacoes ?? []}
        carregando={!dados}
        motivoBloqueio={dados ? motivoBloqueioSolicitacao(situacao, dados.solicitacoes) : null}
        semResposta={!dados?.resposta}
        aoSolicitar={() => setModalAberto(true)}
      />

      <ModalSolicitarAlteracao aberto={modalAberto} aoFechar={() => setModalAberto(false)} aoEnviar={solicitar} />
    </>
  );
}