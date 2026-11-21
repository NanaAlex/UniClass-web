"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Abas } from "@/components/ui/Abas";
import { Botao } from "@/components/ui/Botao";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { cargasIncompativeis, type AbaDados } from "@/lib/dadosAcademicos";
import { AbaDiasHorarios } from "./AbaDiasHorarios";
import { AbaDisciplinas } from "./AbaDisciplinas";
import { AbaSemestres } from "./AbaSemestres";
import { EsqueletoDados } from "./EsqueletoDados";
import { useDadosAcademicos } from "./useDadosAcademicos";
import estilos from "./PainelDados.module.css";

/** Aba Dados do administrador (RF 7): dias e blocos, semestres e turmas, disciplinas. */
export function PainelDados({ abaInicial }: { abaInicial: AbaDados }) {
  const { mostrarAviso } = useAvisos();
  const router = useRouter();
  const { dados, falhou, mudancas, alterado, salvando, recarregar, atualizar, salvar } = useDadosAcademicos();
  const [aba, setAba] = useState<AbaDados>(abaInicial);
  const [verResumo, setVerResumo] = useState(false);
  const [saida, setSaida] = useState<PedidoConfirmacao | null>(null);
  const incompativeis = dados ? cargasIncompativeis(dados) : [];

  // Recarregar ou fechar a aba: aviso do próprio navegador
  useEffect(() => {
    if (!alterado) return;
    const aoSair = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, [alterado]);

  // Links internos (menu lateral, Sair)
  useEffect(() => {
    if (!alterado) return;
    function aoClicar(evento: MouseEvent) {
      if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
      const link = (evento.target as Element | null)?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.origin !== window.location.origin) return;
      if (link.pathname === window.location.pathname) return; // troca de aba dentro de Dados

      evento.preventDefault();
      evento.stopPropagation(); // antes do onClick do <Link>, que fica abaixo na árvore
      const destino = `${link.pathname}${link.search}${link.hash}`;
      setSaida({
        titulo: "Sair sem salvar?",
        descricao: "As alterações que ainda não foram salvas serão descartadas.",
        rotuloAcao: "Sair sem salvar",
        variante: "perigo",
        aoConfirmar: () => router.push(destino),
      });
    }
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, [alterado, router]);

  useEffect(() => {
    if (!alterado) setVerResumo(false);
  }, [alterado]);

  function mudarAba(valor: string) {
    setAba(valor as AbaDados);
    // A aba fica na URL para o link e o recarregamento voltarem ao mesmo lugar
    window.history.replaceState(null, "", `?aba=${valor}`);
  }

  async function aoSalvar() {
    try {
      await salvar();
      mostrarAviso({ tipo: "sucesso", titulo: "Dados salvos", descricao: "Eles já valem para o formulário dos professores." });
    } catch (erro) {
      // O back grava tudo ou nada: o motivo vem dele (ex.: dia já usado em respostas)
      const motivo = erro instanceof Error ? `${erro.message} ` : "";
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível salvar", descricao: `${motivo}Suas alterações continuam aqui.` });
    }
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
        {verResumo && alterado && (
          <ul id="resumo-alteracoes" className={estilos.resumo} aria-label="O que vai ser gravado">
            {mudancas.map((mudanca, i) => (
              <li key={i}>{mudanca}</li>
            ))}
          </ul>
        )}
        <div className={estilos.barra}>
          <p className={estilos.situacao} aria-live="polite">
            {incompativeis.length > 0 ? (
              <>
                <span className={estilos.ponto} aria-hidden="true" />
                {incompativeis.length === 1 ? "1 disciplina" : `${incompativeis.length} disciplinas`} com carga não múltipla de {dados?.aulasPorBloco}
              </>
            ) : alterado ? (
              <>
                <span className={estilos.ponto} aria-hidden="true" />
                {mudancas.length === 1 ? "1 alteração não salva" : `${mudancas.length} alterações não salvas`}
                <button
                  type="button"
                  className={estilos.verResumo}
                  aria-expanded={verResumo}
                  aria-controls="resumo-alteracoes"
                  onClick={() => setVerResumo(!verResumo)}
                >
                  {verResumo ? "Ocultar" : "Ver"}
                </button>
              </>
            ) : (
              "Tudo salvo"
            )}
          </p>
          <Botao
            onClick={aoSalvar}
            carregando={salvando}
            disabled={!dados || !alterado || incompativeis.length > 0}
            title={incompativeis.length ? "Há disciplinas com carga que não é múltipla das aulas por bloco." : undefined}
          >
            Salvar dados
          </Botao>
        </div>
      </footer>
      <ModalConfirmacao pedido={saida} aoFechar={() => setSaida(null)} />
    </div>
  );
}
