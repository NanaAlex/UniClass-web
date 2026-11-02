import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeOlho, IconeOlhoFechado } from "@/components/ui/Icones";
import estilos from "./GestaoHorario.module.css";

export type AcaoGeracao = "gerar" | "oficializar" | "visibilidade";

type AcoesGeracaoProps = {
  /** O formulário ainda recebe respostas: gerar fica indisponível. */
  aguardandoFormulario: boolean;
  respostasPendentes: number;
  temHorario: boolean;
  temPrevia: boolean;
  previasVisiveis: boolean;
  emAndamento: AcaoGeracao | null;
  aoGerar: () => void;
  aoOficializar: () => void;
  aoAlternarVisibilidade: () => void;
  aoAbrirHistorico: () => void;
};

const ID_MOTIVO = "motivo-gerar-indisponivel";

/** RF 3.1, RF 3.18, RF 3.19, RF 8.11–8.12. Uma ação primária por vez, conforme a etapa. */
export function AcoesGeracao({
  aguardandoFormulario,
  respostasPendentes,
  temHorario,
  temPrevia,
  previasVisiveis,
  emAndamento,
  aoGerar,
  aoOficializar,
  aoAlternarVisibilidade,
  aoAbrirHistorico,
}: AcoesGeracaoProps) {
  const ocupado = emAndamento !== null;

  return (
    <div className={estilos.blocoAcoes}>
      {aguardandoFormulario && (
        <div id={ID_MOTIVO} className={estilos.motivo}>
          <Aviso
            tipo="info"
            embutido
            titulo={`Encerre o formulário para ${temHorario ? "gerar uma nova versão" : "gerar o horário"}`}
            descricao={
              respostasPendentes > 0
                ? `${respostasPendentes === 1 ? "1 professor ainda não respondeu" : `${respostasPendentes} professores ainda não responderam`}. O escalonador usa as respostas recebidas até o encerramento.`
                : "Todos já responderam. Encerre o formulário para usar as respostas na geração."
            }
          />
        </div>
      )}

      <div className={estilos.linhaAcoes}>
        {temPrevia ? (
          <div className={estilos.visibilidade}>
            <Etiqueta variante={previasVisiveis ? "info" : "neutra"}>
              {previasVisiveis ? "Prévia visível para os professores" : "Prévia oculta dos professores"}
            </Etiqueta>
            <Botao
              variante="fantasma"
              tamanho="p"
              icone={previasVisiveis ? <IconeOlhoFechado /> : <IconeOlho />}
              carregando={emAndamento === "visibilidade"}
              disabled={ocupado}
              onClick={aoAlternarVisibilidade}
            >
              {previasVisiveis ? "Ocultar" : "Disponibilizar para visualização"}
            </Botao>
          </div>
        ) : (
          <span />
        )}

        <div className={estilos.botoesGeracao}>
          {temHorario && (
            <Botao variante="secundario" onClick={aoAbrirHistorico} disabled={ocupado}>
              Histórico de versões
            </Botao>
          )}
          <Botao
            variante={temHorario ? "secundario" : "primario"}
            onClick={aoGerar}
            carregando={emAndamento === "gerar"}
            disabled={aguardandoFormulario || ocupado}
            aria-describedby={aguardandoFormulario ? ID_MOTIVO : undefined}
          >
            {temHorario ? "Gerar nova versão" : "Gerar horário"}
          </Botao>
          {temPrevia && (
            <Botao onClick={aoOficializar} carregando={emAndamento === "oficializar"} disabled={ocupado}>
              Oficializar horário
            </Botao>
          )}
        </div>
      </div>
    </div>
  );
}
