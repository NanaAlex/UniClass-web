"use client";

import { useEffect, useState } from "react";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { Abas } from "@/components/ui/Abas";
import { Botao } from "@/components/ui/Botao";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { cargasIncompativeis, type AbaDados } from "@/lib/dadosAcademicos";
import { ConfirmacaoEstruturalNecessaria } from "@/services/academico";
import { AbaDiasHorarios } from "./AbaDiasHorarios";
import { AbaDisciplinas } from "./AbaDisciplinas";
import { AbaSemestres } from "./AbaSemestres";
import { EsqueletoDados } from "./EsqueletoDados";
import { useDadosAcademicos } from "./useDadosAcademicos";
import estilos from "./PainelDados.module.css";

/** Aba Dados do administrador (RF 7): dias e blocos, semestres e turmas, disciplinas. */
export function PainelDados({ abaInicial }: { abaInicial: AbaDados }) {
  const { mostrarAviso } = useAvisos();
  const { dados, falhou, alterado, salvando, recarregar, atualizar, salvar } = useDadosAcademicos();
  const [aba, setAba] = useState<AbaDados>(abaInicial);
  const [confirmacao, setConfirmacao] = useState<PedidoConfirmacao | null>(null);
  const incompativeis = dados ? cargasIncompativeis(dados) : [];

  // Avisa o navegador antes de sair com alterações não salvas
  useEffect(() => {
    if (!alterado) return;
    const aoSair = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, [alterado]);

  function mudarAba(valor: string) {
    setAba(valor as AbaDados);
    // A aba fica na URL para o link e o recarregamento voltarem ao mesmo lugar
    window.history.replaceState(null, "", `?aba=${valor}`);
  }

  async function aoSalvar(confirmarAlteracaoEstrutural = false) {
    try {
      const resultado = await salvar(confirmarAlteracaoEstrutural);
      mostrarAviso(
        resultado?.edicaoEncerrada
          ? {
              tipo: "aviso",
              titulo: "Dados salvos e edição do formulário encerrada",
              descricao: `${resultado.respostasExcluidas === 1 ? "1 resposta foi excluída" : `${resultado.respostasExcluidas} respostas foram excluídas`}. Lance uma nova edição na aba Formulário.`,
            }
          : { tipo: "sucesso", titulo: "Dados salvos", descricao: "Valem para a próxima edição do formulário e as próximas gerações." },
      );
    } catch (erro) {
      if (erro instanceof ConfirmacaoEstruturalNecessaria) return pedirConfirmacaoEstrutural(erro);
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível salvar", descricao: erro instanceof Error ? erro.message : "Tente novamente." });
      throw erro;
    }
  }

  /** RN-38, CA-86 a CA-89: duas confirmações seguidas antes de encerrar a edição e excluir as respostas. */
  function pedirConfirmacaoEstrutural({ mudancas, edicao, respostas }: ConfirmacaoEstruturalNecessaria) {
    setConfirmacao({
      titulo: "Esta alteração é estrutural",
      descricao: `Mudou: ${mudancas.join("; ")}. A edição ${edicao} do formulário foi lançada com a estrutura anterior e deixará de valer.`,
      rotuloAcao: "Continuar",
      variante: "primario",
      aoConfirmar: () =>
        // O segundo pedido abre depois que o primeiro modal fecha
        void setTimeout(
          () =>
            setConfirmacao({
              titulo: "Confirmar de novo: encerrar a edição e excluir as respostas?",
              descricao: `A edição ${edicao} será encerrada e ${respostas === 1 ? "1 resposta enviada será excluída" : `${respostas} respostas enviadas serão excluídas`}. Os professores precisarão responder a uma nova edição. Não é possível desfazer.`,
              rotuloAcao: "Encerrar edição e salvar",
              variante: "perigo",
              aoConfirmar: () => aoSalvar(true),
            }),
          0,
        ),
    });
  }

  if (falhou) {
    return (
      <ErroCarregamento titulo="Não foi possível carregar os dados" aoTentarNovamente={recarregar} />
    );
  }

  return (
    <div className={estilos.painel}>
      <Abas
        rotuloAcessivel="Seções dos dados"
        valor={aba}
        aoMudar={mudarAba}
        abas={[
          { valor: "horarios", rotulo: "Dias e blocos" },
          { valor: "semestres", rotulo: "Semestres e turmas", contador: dados?.semestres.length },
          { valor: "disciplinas", rotulo: "Disciplinas", contador: dados?.disciplinas.length },
        ]}
      />

      <div role="tabpanel" aria-busy={!dados} className={estilos.conteudo}>
        {!dados ? (
          <EsqueletoDados aba={aba} />
        ) : aba === "horarios" ? (
          <AbaDiasHorarios dados={dados} atualizar={atualizar} />
        ) : aba === "semestres" ? (
          <AbaSemestres dados={dados} atualizar={atualizar} />
        ) : (
          <AbaDisciplinas dados={dados} atualizar={atualizar} />
        )}
      </div>

      <footer className={estilos.rodape}>
        <p className={estilos.situacao} aria-live="polite">
          {incompativeis.length > 0 ? (
            <>
              <span className={estilos.ponto} aria-hidden="true" />
              {incompativeis.length === 1 ? "1 disciplina" : `${incompativeis.length} disciplinas`} com carga não múltipla de {dados?.aulasPorBloco}
            </>
          ) : alterado ? (
            <>
              <span className={estilos.ponto} aria-hidden="true" />
              Alterações não salvas
            </>
          ) : (
            "Tudo salvo"
          )}
        </p>
        <Botao
          onClick={() => aoSalvar().catch(() => {})}
          carregando={salvando}
          disabled={!dados || !alterado || incompativeis.length > 0}
          title={incompativeis.length ? "Há disciplinas com carga que não é múltipla das aulas por bloco." : undefined}
        >
          Salvar dados
        </Botao>
      </footer>
      <ModalConfirmacao pedido={confirmacao} aoFechar={() => setConfirmacao(null)} />
    </div>
  );
}
