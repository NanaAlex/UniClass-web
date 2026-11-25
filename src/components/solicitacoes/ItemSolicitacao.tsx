import { Botao } from "@/components/ui/Botao";
import { formatarData, iniciais } from "@/lib/formatacao";
import { rotuloAula, rotulosDia } from "@/lib/horario";
import { aguardandoAdministrador } from "@/lib/solicitacao";
import type { Solicitacao } from "@/types";
import { EtiquetaStatusSolicitacao } from "./EtiquetaStatusSolicitacao";
import estilos from "./ListaSolicitacoes.module.css";

export type PerfilLista = "administrador" | "professor";

export type AcoesSolicitacao = {
  aoMarcarComoLida?: (solicitacao: Solicitacao) => void;
  aoAprovar?: (solicitacao: Solicitacao) => void;
  aoRejeitar?: (solicitacao: Solicitacao) => void;
  /** Administrador: troca as ações rápidas por um botão que abre o pedido completo. */
  aoAbrir?: (solicitacao: Solicitacao) => void;
};

type ItemSolicitacaoProps = AcoesSolicitacao & {
  solicitacao: Solicitacao;
  perfil: PerfilLista;
  processando: boolean;
  /** Mostra quem pediu. Padrão: só para o administrador; no perfil do professor é redundante. */
  mostrarProfessor?: boolean;
};

export const rotulosTipo = {
  horario: "Alteração de horário",
  formulario: "Reabertura de formulário",
};

export function ItemSolicitacao({
  solicitacao,
  perfil,
  processando,
  mostrarProfessor = perfil === "administrador",
  aoMarcarComoLida,
  aoAprovar,
  aoRejeitar,
  aoAbrir,
}: ItemSolicitacaoProps) {
  const { tipo, professor, descricao, criadaEm, aula, resposta } = solicitacao;
  const ehAdmin = perfil === "administrador";
  const pendente = aguardandoAdministrador(solicitacao);

  return (
    <li className={[estilos.item, pendente && estilos.pendente].filter(Boolean).join(" ")}>
      {mostrarProfessor && (
        <span className={estilos.avatar} aria-hidden="true">
          {iniciais(professor.nome)}
        </span>
      )}

      <div className={estilos.corpo}>
        <div className={estilos.topo}>
          <div>
            <h3 className={estilos.titulo}>{mostrarProfessor ? professor.nome : rotulosTipo[tipo]}</h3>
            <p className={estilos.meta}>
              {mostrarProfessor && <span>{rotulosTipo[tipo]}</span>}
              {aula && (
                <span>
                  {rotulosDia[aula.dia].longo} · {rotuloAula(aula.posicao)} · {aula.disciplina}
                </span>
              )}
              <time dateTime={criadaEm}>{formatarData(criadaEm)}</time>
            </p>
          </div>
          <EtiquetaStatusSolicitacao solicitacao={solicitacao} />
        </div>

        <p className={estilos.descricao}>{descricao}</p>

        {resposta && (
          <div className={estilos.resposta}>
            <p className={estilos.rotuloResposta}>Resposta da coordenação</p>
            <p>{resposta}</p>
          </div>
        )}

        {ehAdmin && aoAbrir ? (
          <div className={estilos.acoes}>
            <Botao variante={pendente ? "secundario" : "fantasma"} tamanho="p" onClick={() => aoAbrir(solicitacao)}>
              {pendente ? "Analisar pedido" : "Ver detalhes"}
            </Botao>
          </div>
        ) : (
          ehAdmin &&
          pendente && (
            <div className={estilos.acoes}>
              {tipo === "horario" ? (
                <Botao variante="secundario" tamanho="p" carregando={processando} onClick={() => aoMarcarComoLida?.(solicitacao)}>
                  Marcar como lida
                </Botao>
              ) : (
                <>
                  <Botao variante="secundario" tamanho="p" disabled={processando} onClick={() => aoRejeitar?.(solicitacao)}>
                    Rejeitar
                  </Botao>
                  <Botao tamanho="p" carregando={processando} onClick={() => aoAprovar?.(solicitacao)}>
                    Aprovar e reabrir
                  </Botao>
                </>
              )}
            </div>
          )
        )}
      </div>
    </li>
  );
}
