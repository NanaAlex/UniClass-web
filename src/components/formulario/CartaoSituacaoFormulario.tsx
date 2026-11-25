import { Etiqueta } from "@/components/ui/Etiqueta";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeAlerta } from "@/components/ui/Icones";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { formatarData } from "@/lib/formatacao";
import { diasRestantes, etiquetasSituacao, type SituacaoFormulario } from "@/lib/formulario";
import { hrefsFormularioProfessor } from "@/lib/navegacao";
import type { Formulario, RespostaFormulario } from "@/types";
import estilos from "./CartaoSituacaoFormulario.module.css";

type CartaoSituacaoFormularioProps = {
  formulario: Formulario | null;
  resposta: RespostaFormulario | null;
  situacao: SituacaoFormulario;
};

const conteudo: Record<Exclude<SituacaoFormulario, "indisponivel">, { descricao: string; acao?: string }> = {
  pendente: {
    descricao: "Informe sua disponibilidade, a prioridade de cada período e as matérias que gostaria de lecionar.",
    acao: "Responder formulário",
  },
  respondido: { descricao: "Sua resposta foi recebida pela coordenação.", acao: "Visualizar resposta" },
  edicao_liberada: {
    descricao: "A coordenação aprovou seu pedido. Revise sua resposta e envie novamente antes do fim do prazo.",
    acao: "Editar resposta",
  },
  encerrado: { descricao: "O período de respostas terminou. Não é mais possível enviar ou alterar respostas." },
};

function textoPrazo(fim: string) {
  const dias = diasRestantes(fim);
  if (dias === 0) return "termina hoje";
  return dias === 1 ? "falta 1 dia" : `faltam ${dias} dias`;
}

export function CartaoSituacaoFormulario({ formulario, resposta, situacao }: CartaoSituacaoFormularioProps) {
  if (!formulario || situacao === "indisponivel") {
    return (
      <section className={`${estilos.cartao} ${estilos.neutro}`} aria-label="Situação do formulário">
        <EstadoVazio
          titulo="Formulário indisponível"
          descricao="A coordenação ainda não abriu o formulário de disponibilidade. Quando ele for aberto, você poderá respondê-lo aqui."
        />
      </section>
    );
  }

  const { descricao, acao } = conteudo[situacao];
  const etiqueta = etiquetasSituacao[situacao];
  const encerrado = situacao === "encerrado";
  const urgente = !encerrado && diasRestantes(formulario.fim) <= 3;
  const acaoFinal = acao ?? (encerrado && resposta ? "Visualizar resposta" : undefined);

  return (
    <section className={estilos.cartao} aria-labelledby="titulo-formulario">
      <div className={estilos.topo}>
        <div className={estilos.textos}>
          <Etiqueta variante={etiqueta.variante} ponto>
            {etiqueta.rotulo}
          </Etiqueta>
          <h2 id="titulo-formulario" className={estilos.titulo}>
            {formulario.nome}
          </h2>
          <p className={estilos.descricao}>{descricao}</p>
        </div>
        {acaoFinal && (
          <LinkBotao href={hrefsFormularioProfessor.resposta} tamanho="g" variante="invertido">
            {acaoFinal}
          </LinkBotao>
        )}
      </div>

      <dl className={estilos.detalhes}>
        <div>
          <dt>{encerrado ? "Encerrado em" : "Disponível até"}</dt>
          <dd className={urgente ? estilos.urgente : undefined}>
            {urgente && <IconeAlerta />}
            <time dateTime={formulario.fim}>{formatarData(formulario.fim)}</time>
            {!encerrado && <span className={estilos.secundario}> · {textoPrazo(formulario.fim)}</span>}
          </dd>
        </div>
        <div>
          <dt>Período letivo</dt>
          <dd>{formulario.periodoLetivo}</dd>
        </div>
        <div>
          <dt>Sua resposta</dt>
          <dd>
            {resposta ? (
              <>
                Enviada em <time dateTime={resposta.enviadaEm}>{formatarData(resposta.enviadaEm)}</time>
              </>
            ) : (
              <span className={estilos.secundario}>Não enviada</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
