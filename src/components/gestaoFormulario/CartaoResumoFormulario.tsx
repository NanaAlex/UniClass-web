import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeAlerta } from "@/components/ui/Icones";
import { formatarDataHora } from "@/lib/formatacao";
import { etiquetasGestao, podeProrrogar, tempoRestante, type SituacaoGestao } from "@/lib/gestaoFormulario";
import type { Formulario } from "@/types";
import estilos from "./CartaoResumoFormulario.module.css";

type CartaoResumoFormularioProps = {
  formulario: Formulario;
  situacao: Exclude<SituacaoGestao, "sem_formulario">;
  respondidos: number;
  total: number;
  aoEditarPrazo: () => void;
  aoEncerrar: () => void;
};

/** RF 2.9: nome, período, tempo restante e quantidade de respostas. */
export function CartaoResumoFormulario({
  formulario,
  situacao,
  respondidos,
  total,
  aoEditarPrazo,
  aoEncerrar,
}: CartaoResumoFormularioProps) {
  const etiqueta = etiquetasGestao[situacao];
  const restante = tempoRestante(formulario, situacao);
  const encerrado = situacao === "encerrado";
  const percentual = total > 0 ? Math.round((respondidos / total) * 100) : 0;

  return (
    <section className={estilos.cartao} aria-labelledby="titulo-resumo-formulario">
      <div className={estilos.topo}>
        <div className={estilos.textos}>
          <Etiqueta variante={etiqueta.variante} ponto>
            {etiqueta.rotulo}
          </Etiqueta>
          <h2 id="titulo-resumo-formulario" className={estilos.titulo}>
            {formulario.nome}
          </h2>
          <p className={estilos.periodo}>Período letivo {formulario.periodoLetivo}</p>
        </div>

        <div className={estilos.acoes}>
          {!encerrado && (
            <>
              <Botao variante="fantasma" onClick={aoEncerrar}>
                Encerrar agora
              </Botao>
              <Botao variante="secundario" onClick={aoEditarPrazo}>
                Editar prazo
              </Botao>
            </>
          )}
          {encerrado && podeProrrogar(formulario) && (
            <Botao variante="secundario" onClick={aoEditarPrazo}>
              Prorrogar prazo
            </Botao>
          )}
        </div>
      </div>

      <dl className={estilos.detalhes}>
        <div>
          <dt>Início</dt>
          <dd>
            <time dateTime={formulario.inicio}>{formatarDataHora(formulario.inicio)}</time>
          </dd>
        </div>
        <div>
          <dt>{encerrado ? "Encerrado em" : "Término"}</dt>
          <dd>
            <time dateTime={formulario.fim}>{formatarDataHora(formulario.fim)}</time>
          </dd>
        </div>
        <div>
          <dt>Tempo restante</dt>
          <dd className={restante?.urgente ? estilos.urgente : undefined}>
            {restante?.urgente && <IconeAlerta aria-hidden="true" />}
            {restante?.texto ?? "Prazo encerrado"}
          </dd>
        </div>
        <div>
          <dt>Respostas</dt>
          <dd className={estilos.respostas}>
            <span>
              <strong className={estilos.numero}>{respondidos}</strong>
              <span className={estilos.secundario}> de {total} professores</span>
            </span>
            <span
              className={estilos.barra}
              role="progressbar"
              aria-label="Respostas recebidas"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={respondidos}
              aria-valuetext={`${respondidos} de ${total} (${percentual}%)`}
            >
              <span className={estilos.preenchimento} style={{ width: `${percentual}%` }} />
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
