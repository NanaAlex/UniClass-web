import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { ListaSolicitacoes } from "@/components/solicitacoes/ListaSolicitacoes";
import { Botao } from "@/components/ui/Botao";
import type { Solicitacao } from "@/types";
import estilos from "./PainelFormulario.module.css";

type SecaoSolicitacoesFormularioProps = {
  solicitacoes: Solicitacao[];
  carregando: boolean;
  /** Por que o botão está desabilitado; null libera o pedido. */
  motivoBloqueio: string | null;
  semResposta: boolean;
  aoSolicitar: () => void;
};

/** RF 2.15, RF 2.16: pedidos de alteração do formulário e o status de cada um. */
export function SecaoSolicitacoesFormulario({
  solicitacoes,
  carregando,
  motivoBloqueio,
  semResposta,
  aoSolicitar,
}: SecaoSolicitacoesFormularioProps) {
  return (
    <section className={estilos.secao} aria-labelledby="titulo-solicitacoes">
      <CabecalhoSecao
        id="titulo-solicitacoes"
        titulo="Suas solicitações"
        descricao="Pedidos para alterar uma resposta já enviada."
        acoes={
          <div className={estilos.acaoSecao}>
            <Botao
              variante="secundario"
              onClick={aoSolicitar}
              disabled={carregando || motivoBloqueio !== null}
              aria-describedby={motivoBloqueio ? "motivo-bloqueio" : undefined}
            >
              Solicitar alteração
            </Botao>
            {motivoBloqueio && !carregando && (
              <p id="motivo-bloqueio" className={estilos.motivo}>
                {motivoBloqueio}
              </p>
            )}
          </div>
        }
      />

      <ListaSolicitacoes
        solicitacoes={solicitacoes}
        perfil="professor"
        carregando={carregando}
        mensagemVazia={
          semResposta
            ? "Depois de enviar sua resposta, você poderá pedir alterações por aqui."
            : "Você ainda não pediu alterações neste formulário."
        }
      />
    </section>
  );
}
