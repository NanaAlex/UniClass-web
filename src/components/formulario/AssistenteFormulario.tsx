"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { normalizarPrioridades } from "@/lib/formulario";
import { hrefsFormularioProfessor } from "@/lib/navegacao";
import { enviarResposta } from "@/services/formularios";
import type { ChaveHorario, InteresseDisciplina, RespostaFormulario } from "@/types";
import { ConteudoEtapa, etapas } from "./ConteudoEtapa";
import { IndicadorEtapas } from "./IndicadorEtapas";
import { ModalConfirmarEnvio } from "./ModalConfirmarEnvio";
import type { DadosResposta } from "./useRespostaFormulario";
import estilos from "./AssistenteFormulario.module.css";

type AssistenteFormularioProps = {
  dados: DadosResposta;
  professorId: string;
};


/** RF 2.1–2.6: preenchimento em etapas. Também usado para editar após reabertura (RF 2.18). */
export function AssistenteFormulario({ dados, professorId }: AssistenteFormularioProps) {
  const { formulario, resposta, disciplinas } = dados;
  const router = useRouter();
  const { mostrarAviso } = useAvisos();
  const topo = useRef<HTMLDivElement>(null);

  const [etapa, setEtapa] = useState(0);
  const [disponibilidade, setDisponibilidade] = useState<ChaveHorario[]>(resposta?.disponibilidade ?? []);
  const [prioridades, setPrioridades] = useState<RespostaFormulario["prioridadesPeriodo"]>(resposta?.prioridadesPeriodo ?? {});
  const [interesses, setInteresses] = useState<InteresseDisciplina[]>(resposta?.interesses ?? []);
  const [erroEtapa, setErroEtapa] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const ultima = etapa === etapas.length - 1;

  function irPara(indice: number) {
    setErroEtapa(null);
    setEtapa(indice);
    topo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function avancar() {
    const erro = etapas[etapa].validar?.({ disponibilidade, interesses });
    if (erro) return setErroEtapa(erro);
    if (ultima) return setConfirmando(true);
    irPara(etapa + 1);
  }

  async function enviar() {
    setEnviando(true);
    setErroEnvio(null);
    try {
      await enviarResposta({
        formularioId: formulario.id,
        professorId,
        disponibilidade,
        interesses,
        prioridadesPeriodo: normalizarPrioridades(prioridades, disponibilidade),
      });
      mostrarAviso({ tipo: "sucesso", titulo: "Resposta enviada", descricao: "A coordenação já pode usar suas informações na grade." });
      router.push(hrefsFormularioProfessor.inicio);
    } catch (erro) {
      setEnviando(false);
      setConfirmando(false);
      setErroEnvio(erro instanceof Error ? erro.message : "Tente novamente em alguns instantes.");
    }
  }

  return (
    <div ref={topo} className={estilos.assistente}>
      {erroEnvio && (
        <Aviso tipo="perigo" embutido titulo="Não foi possível enviar sua resposta" descricao={erroEnvio} aoFechar={() => setErroEnvio(null)} />
      )}

      <section className={estilos.painel} aria-labelledby="titulo-etapa">
        <header className={estilos.cabecalhoPainel}>
          <IndicadorEtapas etapas={etapas.map((e) => e.titulo)} atual={etapa} aoSelecionar={irPara} />
          <div>
            <h2 id="titulo-etapa" className={estilos.titulo}>
              {etapas[etapa].titulo}
            </h2>
            <p className={estilos.descricao}>{etapas[etapa].descricao}</p>
          </div>
        </header>

        <div className={estilos.corpo}>
          <ConteudoEtapa
            etapa={etapa}
            formulario={formulario}
            disciplinas={disciplinas}
            disponibilidade={disponibilidade}
            aoMudarDisponibilidade={(valor) => {
              setDisponibilidade(valor);
              setErroEtapa(null);
            }}
            prioridades={prioridades}
            aoMudarPrioridades={setPrioridades}
            interesses={interesses}
            aoMudarInteresses={(valor) => {
              setInteresses(valor);
              setErroEtapa(null);
            }}
          />

          {erroEtapa && <Aviso tipo="perigo" embutido titulo={erroEtapa} />}
        </div>
      </section>

      <footer className={estilos.rodape}>
        <LinkBotao href={hrefsFormularioProfessor.inicio} variante="fantasma">
          Cancelar
        </LinkBotao>
        <div className={estilos.navegacao}>
          {etapa > 0 && (
            <Botao variante="secundario" tamanho="g" onClick={() => irPara(etapa - 1)}>
              Voltar
            </Botao>
          )}
          <Botao onClick={avancar} tamanho="g">
            {ultima ? "Finalizar" : "Continuar"}
          </Botao>
        </div>
      </footer>

      <ModalConfirmarEnvio
        aberto={confirmando}
        aoFechar={() => !enviando && setConfirmando(false)}
        aoConfirmar={enviar}
        enviando={enviando}
        estruturas={formulario.estruturas}
        disponibilidade={disponibilidade}
        interesses={interesses}
      />
    </div>
  );
}
