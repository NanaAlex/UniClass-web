import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { formatarDataHora } from "@/lib/formatacao";
import { etiquetasGestao, tempoRestante, type SituacaoGestao } from "@/lib/gestaoFormulario";
import type { Formulario } from "@/types";
import estilos from "./GestaoHorario.module.css";

type ResumoFormularioGeracaoProps = {
  formulario: Formulario;
  situacao: SituacaoGestao;
  respondidos: number;
  total: number;
  aoEncerrar: () => void;
};

const hrefFormulario = "/admin/formulario";

/** A edição vigente do formulário, de onde saem os dados da geração (RN-36, RN-38). */
export function ResumoFormularioGeracao({ formulario, situacao, respondidos, total, aoEncerrar }: ResumoFormularioGeracaoProps) {
  if (situacao === "sem_formulario") {
    return (
      <div className={estilos.blocoFormulario}>
        <p className={estilos.textoSecundario}>Nenhum formulário lançado. A grade é gerada com as respostas dos professores.</p>
        <LinkBotao href={hrefFormulario} variante="secundario">
          Lançar formulário
        </LinkBotao>
      </div>
    );
  }

  const etiqueta = etiquetasGestao[situacao];
  const restante = tempoRestante(formulario, situacao);
  const encerrado = situacao === "encerrado";

  return (
    <div className={estilos.blocoFormulario}>
      <div className={estilos.formularioTitulo}>
        <span className={estilos.rotuloPequeno}>Formulário · edição {formulario.edicao}</span>
        <span className={estilos.nomeFormulario}>
          {formulario.nome}
          <Etiqueta variante={etiqueta.variante} ponto>
            {etiqueta.rotulo}
          </Etiqueta>
        </span>
      </div>

      <dl className={estilos.dadosFormulario}>
        <div>
          <dt>Respostas</dt>
          <dd>
            <strong>{respondidos}</strong> de {total}
          </dd>
        </div>
        <div>
          <dt>Aulas por bloco (K)</dt>
          <dd>{formulario.aulasPorBloco}</dd>
        </div>
        <div>
          <dt>{encerrado ? "Encerrado em" : "Término"}</dt>
          <dd>
            <time dateTime={formulario.fim}>{formatarDataHora(formulario.fim)}</time>
          </dd>
        </div>
        {restante && (
          <div>
            <dt>Tempo restante</dt>
            <dd className={restante.urgente ? estilos.urgente : undefined}>{restante.texto}</dd>
          </div>
        )}
      </dl>

      <div className={estilos.acoesFormulario}>
        <LinkBotao href={hrefFormulario} variante="fantasma">
          Ver respostas
        </LinkBotao>
        {situacao === "aberto" && (
          <Botao variante="secundario" onClick={aoEncerrar}>
            Encerrar formulário
          </Botao>
        )}
      </div>
    </div>
  );
}
