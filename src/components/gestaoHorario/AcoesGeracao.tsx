import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import type { ContextoGeracao } from "@/services/horarios";
import type { AcaoGeracao } from "./useAcoesHorario";
import estilos from "./GestaoHorario.module.css";

type AcoesGeracaoProps = {
  contexto: ContextoGeracao;
  /** Sem formulário lançado não há participantes (RN-20, RN-36). */
  semFormulario: boolean;
  travas: number;
  temExecucao: boolean;
  emProcessamento: boolean;
  emAndamento: AcaoGeracao | null;
  aoGerar: () => void;
};

const ID_MOTIVO = "motivo-gerar-indisponivel";

/** POST /admin/geracoes: participantes, pendentes (RN-37) e as travas que entram como restrições (RN-41). */
export function AcoesGeracao({ contexto, semFormulario, travas, temExecucao, emProcessamento, emAndamento, aoGerar }: AcoesGeracaoProps) {
  const pendentes = contexto.pendentes.length;
  const indisponivel = semFormulario || emProcessamento;

  return (
    <div className={estilos.blocoAcoes}>
      {indisponivel && (
        <div id={ID_MOTIVO}>
          <Aviso
            tipo="info"
            embutido
            titulo={emProcessamento ? "Há uma geração em processamento" : "Lance o formulário para gerar"}
            descricao={
              emProcessamento
                ? "Aguarde a conclusão: cada execução tem prazo único de 600 segundos."
                : "A geração usa as respostas enviadas à edição vigente do formulário."
            }
          />
        </div>
      )}

      <div className={estilos.linhaAcoes}>
        <div className={estilos.visibilidade}>
          <Etiqueta variante="neutra">
            {contexto.enviados} de {contexto.ativos} professores ativos responderam
          </Etiqueta>
          {pendentes > 0 && (
            <Etiqueta variante="aviso">{pendentes === 1 ? "1 pendente: geração antecipada" : `${pendentes} pendentes: geração antecipada`}</Etiqueta>
          )}
          <Etiqueta variante={travas > 0 ? "info" : "neutra"}>{travas === 1 ? "1 trava no período" : `${travas} travas no período`}</Etiqueta>
        </div>

        <div className={estilos.botoesGeracao}>
          <Botao
            onClick={aoGerar}
            carregando={emAndamento === "gerar"}
            disabled={indisponivel || emAndamento !== null}
            aria-describedby={indisponivel ? ID_MOTIVO : undefined}
          >
            {temExecucao ? "Gerar novamente" : "Gerar horário"}
          </Botao>
        </div>
      </div>
    </div>
  );
}
