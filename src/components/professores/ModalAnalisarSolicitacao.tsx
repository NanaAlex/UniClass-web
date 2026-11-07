"use client";

import { useEffect, useState } from "react";
import { EtiquetaStatusSolicitacao } from "@/components/solicitacoes/EtiquetaStatusSolicitacao";
import { rotulosTipo } from "@/components/solicitacoes/ItemSolicitacao";
import { AreaTexto } from "@/components/ui/AreaTexto";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import { formatarData } from "@/lib/formatacao";
import { rotuloAula, rotulosDia } from "@/lib/horario";
import { aguardandoAdministrador, LIMITES_DESCRICAO } from "@/lib/solicitacao";
import type { Solicitacao } from "@/types";
import estilos from "./ModalAnalisarSolicitacao.module.css";

type Decisao = "lida" | "aprovada" | "rejeitada";

type ModalAnalisarSolicitacaoProps = {
  solicitacao: Solicitacao | null;
  aoFechar: () => void;
  aoDecidir: (solicitacao: Solicitacao, decisao: Decisao, resposta: string) => Promise<void>;
  /** Pedido de formulário: atalho para a resposta atual do professor. */
  aoVerFormulario: () => void;
};

/** RF 9.5, RF 9.6: o pedido completo e a decisão. Horário não tem aceite (RF 3.4): só "marcar como lida". */
export function ModalAnalisarSolicitacao({ solicitacao, aoFechar, aoDecidir, aoVerFormulario }: ModalAnalisarSolicitacaoProps) {
  const [resposta, setResposta] = useState("");
  const [emAndamento, setEmAndamento] = useState<Decisao | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setResposta("");
    setFalhou(false);
  }, [solicitacao?.id]);

  const pendente = solicitacao ? aguardandoAdministrador(solicitacao) : false;
  const ocupado = emAndamento !== null;

  async function decidir(decisao: Decisao) {
    if (!solicitacao) return;
    setEmAndamento(decisao);
    setFalhou(false);
    try {
      await aoDecidir(solicitacao, decisao, resposta);
    } catch {
      setFalhou(true);
    } finally {
      setEmAndamento(null);
    }
  }

  const rodape = !solicitacao ? null : !pendente ? (
    <Botao variante="secundario" onClick={aoFechar}>
      Fechar
    </Botao>
  ) : solicitacao.tipo === "horario" ? (
    <Botao onClick={() => decidir("lida")} carregando={emAndamento === "lida"}>
      Marcar como lida
    </Botao>
  ) : (
    <>
      <Botao variante="secundario" onClick={() => decidir("rejeitada")} carregando={emAndamento === "rejeitada"} disabled={ocupado}>
        Recusar
      </Botao>
      <Botao onClick={() => decidir("aprovada")} carregando={emAndamento === "aprovada"} disabled={ocupado}>
        Aprovar e reabrir formulário
      </Botao>
    </>
  );

  return (
    <Modal aberto={solicitacao !== null} aoFechar={ocupado ? () => {} : aoFechar} titulo={solicitacao ? rotulosTipo[solicitacao.tipo] : ""} rodape={rodape}>
      {solicitacao && (
        <div className={estilos.conteudo}>
          <p className={estilos.meta}>
            <EtiquetaStatusSolicitacao solicitacao={solicitacao} />
            <span>
              Enviada em <time dateTime={solicitacao.criadaEm}>{formatarData(solicitacao.criadaEm)}</time>
            </span>
          </p>

          {solicitacao.aula && (
            <dl className={estilos.aula}>
              <div><dt>Aula</dt><dd>{rotulosDia[solicitacao.aula.dia].longo} · {rotuloAula(solicitacao.aula.posicao)}</dd></div>
              <div><dt>Disciplina</dt><dd>{solicitacao.aula.disciplina}</dd></div>
              <div><dt>Turma</dt><dd>{solicitacao.aula.turma}</dd></div>
            </dl>
          )}

          <figure className={estilos.pedido}>
            <figcaption className={estilos.rotulo}>Motivo do pedido</figcaption>
            <blockquote>{solicitacao.descricao}</blockquote>
          </figure>

          {solicitacao.tipo === "formulario" && (
            <Botao variante="fantasma" tamanho="p" onClick={aoVerFormulario} className={estilos.atalho}>
              Ver a resposta atual do formulário
            </Botao>
          )}

          {falhou && <Aviso tipo="perigo" embutido titulo="Não foi possível concluir" descricao="Sua resposta continua aqui. Tente novamente." />}

          {pendente ? (
            <AreaTexto
              rotulo="Resposta ao professor (opcional)"
              dica="O professor vê esta mensagem junto com a situação do pedido."
              maxLength={LIMITES_DESCRICAO.maximo}
              mostrarContador
              rows={3}
              value={resposta}
              disabled={ocupado}
              onChange={(evento) => setResposta(evento.target.value)}
            />
          ) : (
            solicitacao.resposta && (
              <div className={estilos.pedido}>
                <p className={estilos.rotulo}>Sua resposta</p>
                <p>{solicitacao.resposta}</p>
              </div>
            )
          )}
        </div>
      )}
    </Modal>
  );
}
