"use client";

import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";
import { LinkVoltar } from "@/components/layout/LinkVoltar";
import { Cartao } from "@/components/ui/Cartao";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { podeEditarResposta, situacaoDoFormulario } from "@/lib/formulario";
import { hrefsFormularioProfessor } from "@/lib/navegacao";
import { AssistenteFormulario } from "./AssistenteFormulario";
import { useRespostaFormulario } from "./useRespostaFormulario";
import { VisualizacaoResposta } from "./VisualizacaoResposta";
import estilos from "./AssistenteFormulario.module.css";

const titulos = {
  pendente: { titulo: "Responder formulário", subtitulo: "São duas etapas rápidas. Você pode voltar à anterior antes de finalizar." },
  edicao_liberada: { titulo: "Editar resposta", subtitulo: "Suas respostas anteriores já estão preenchidas. Ajuste o que precisar e envie novamente." },
  leitura: { titulo: "Sua resposta", subtitulo: "Confira as informações que você enviou à coordenação." },
};

/**
 * /professor/formulario/resposta — o modo vem dos dados: preencher (sem resposta),
 * editar (reabertura aprovada) ou só visualizar (já enviada ou prazo encerrado).
 */
export function TelaRespostaFormulario({ professorId }: { professorId: string }) {
  const { estado, recarregar } = useRespostaFormulario(professorId);
  const voltar = { href: hrefsFormularioProfessor.inicio, rotulo: "Formulário" };

  if (estado.tipo === "carregando") {
    return (
      <>
        <LinkVoltar {...voltar} />
        <div aria-busy="true" aria-label="Carregando formulário" className={estilos.leitura}>
          <Esqueleto largura="320px" altura="2.25rem" />
          <Esqueleto largura="60%" />
          <Esqueleto forma="bloco" altura="48px" />
          <Esqueleto forma="bloco" altura="360px" />
        </div>
      </>
    );
  }

  if (estado.tipo === "erro") {
    return (
      <>
        <LinkVoltar {...voltar} />
        <ErroCarregamento titulo="Não foi possível carregar o formulário" aoTentarNovamente={recarregar} />
      </>
    );
  }

  const { formulario, resposta, disciplinas } = estado.dados;
  const situacao = situacaoDoFormulario(formulario, resposta);
  const textos = situacao === "pendente" || situacao === "edicao_liberada" ? titulos[situacao] : titulos.leitura;

  return (
    <>
      <CabecalhoPagina voltar={voltar} sobretitulo={formulario.nome} titulo={textos.titulo} subtitulo={textos.subtitulo} />

      {podeEditarResposta(situacao) ? (
        <AssistenteFormulario dados={estado.dados} professorId={professorId} />
      ) : resposta ? (
        <VisualizacaoResposta formulario={formulario} resposta={resposta} disciplinas={disciplinas} encerrado={situacao === "encerrado"} />
      ) : (
        <Cartao>
          <EstadoVazio
            titulo={situacao === "encerrado" ? "Prazo encerrado" : "Formulário indisponível"}
            descricao={
              situacao === "encerrado"
                ? "O período de respostas terminou e não há resposta sua registrada. Procure a coordenação do curso."
                : "A coordenação ainda não abriu o formulário de disponibilidade."
            }
            acao={<LinkBotao href={hrefsFormularioProfessor.inicio}>Voltar ao formulário</LinkBotao>}
          />
        </Cartao>
      )}
    </>
  );
}
