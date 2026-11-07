"use client";

import { useCallback, useEffect, useState } from "react";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { motivoBloqueioSolicitacao, situacaoDoFormulario } from "@/lib/formulario";
import { obterFormularioAtual, obterRespostaDoProfessor } from "@/services/formularios";
import { criarSolicitacao, listarSolicitacoes } from "@/services/solicitacoes";
import type { Formulario, RespostaFormulario, Solicitacao, UsuarioLogado } from "@/types";
import { CartaoSituacaoFormulario } from "./CartaoSituacaoFormulario";
import { ModalSolicitarAlteracao } from "./ModalSolicitarAlteracao";
import { SecaoSolicitacoesFormulario } from "./SecaoSolicitacoesFormulario";
import estilos from "./PainelFormulario.module.css";

type Dados = {
  formulario: Formulario;
  resposta: RespostaFormulario | null;
  solicitacoes: Solicitacao[];
};

/** Aba Formulário do professor: situação do formulário atual e pedidos de alteração. */
export function PainelFormulario({ usuario }: { usuario: UsuarioLogado }) {
  const { mostrarAviso } = useAvisos();
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setFalhou(false);
    setDados(null);
    try {
      const formulario = await obterFormularioAtual();
      const [resposta, solicitacoes] = await Promise.all([
        obterRespostaDoProfessor(formulario.id, usuario.id),
        listarSolicitacoes({ professorId: usuario.id, tipo: "formulario" }),
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
    const nova = await criarSolicitacao({
      tipo: "formulario",
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
