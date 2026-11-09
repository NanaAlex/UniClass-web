"use client";

import { useEffect, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { formatarDataHora } from "@/lib/formatacao";
import {
  formatarRacional,
  formatarSegundos,
  motivoParaNaoPublicar,
  nomesNivel,
  rotuloMotivoTermino,
  rotulosEstadoProva,
  rotulosNatureza,
  rotulosStatus,
  tipoAvisoStatus,
} from "@/lib/geracao";
import type { Execucao } from "@/types";
import estilos from "./ResultadoExecucao.module.css";

type ResultadoExecucaoProps = {
  execucao: Execucao;
  publicando: boolean;
  aoPublicar: (execucao: Execucao) => void;
};

const ID_MOTIVO = "motivo-nao-publicar";

const fracao = (a: number | null, b: number | null) => (a === null || b === null ? "—" : `${a} de ${b}`);

/** Painel da execução (RN-59): status, justificativa (RN-60), indicadores, provas por nível e diagnósticos. */
export function ResultadoExecucao({ execucao, publicando, aoPublicar }: ResultadoExecucaoProps) {
  const { painel } = execucao;
  const status = rotulosStatus[execucao.status];
  const motivo = motivoParaNaoPublicar(execucao);
  const processando = execucao.status === "EM_PROCESSAMENTO";

  return (
    <section className={estilos.resultado} aria-labelledby="titulo-resultado" aria-busy={processando || undefined}>
      <div className={estilos.topo}>
        <div className={estilos.identificacao}>
          <h2 id="titulo-resultado" className={estilos.titulo}>
            Resultado da execução
          </h2>
          <p className={estilos.meta}>
            <Etiqueta variante={status.variante} ponto>
              {status.rotulo}
            </Etiqueta>
            {execucao.publicadaEm && <Etiqueta variante="sucesso">Publicada em {formatarDataHora(execucao.publicadaEm)}</Etiqueta>}
            {execucao.simulada && <Etiqueta variante="info">Simulação do front</Etiqueta>}
            <span>Iniciada em {formatarDataHora(execucao.iniciadaEm)}</span>
            {execucao.gradeBaseId && <span>Com travas sobre a execução {execucao.gradeBaseId.slice(0, 8)}</span>}
          </p>
        </div>
        {!processando && (
          <div className={estilos.publicar}>
            <Botao
              onClick={() => aoPublicar(execucao)}
              carregando={publicando}
              disabled={motivo !== null}
              aria-describedby={motivo ? ID_MOTIVO : undefined}
            >
              {execucao.publicadaEm ? "Publicada" : "Publicar grade"}
            </Botao>
            {motivo && (
              <p id={ID_MOTIVO} className={estilos.motivo}>
                {motivo}
              </p>
            )}
          </div>
        )}
      </div>

      {processando ? (
        <Processando inicio={execucao.iniciadaEm} limite={painel.limiteSegundos ?? 600} />
      ) : (
        <Aviso
          tipo={tipoAvisoStatus[execucao.status]}
          embutido
          titulo={painel.justificativa?.titulo ?? (execucao.status === "OTIMA_COMPROVADA" ? "Ótimo comprovado nos quatro níveis" : status.rotulo)}
          descricao={
            painel.justificativa?.texto ??
            (execucao.status === "OTIMA_COMPROVADA"
              ? "A grade é completa, foi aprovada pela validação independente e nenhuma outra grade válida é melhor em nenhum dos quatro critérios, na ordem."
              : undefined)
          }
        />
      )}

      {!processando && (
        <>
          <dl className={estilos.indicadores}>
            <Indicador rotulo="Turmas com grade validada" valor={fracao(painel.turmasComGradeValidada, painel.totalTurmas)} />
            <Indicador rotulo="Professores com aulas" valor={fracao(painel.professoresComAulas, painel.participantes)} detalhe="dos participantes" />
            <Indicador
              rotulo="Respostas do formulário"
              valor={fracao(painel.respostasEnviadas, painel.professoresAtivos)}
              detalhe={
                painel.pendentes
                  ? `${painel.pendentes} pendente${painel.pendentes > 1 ? "s" : ""}${painel.geracaoAntecipadaConfirmada ? " · antecipação confirmada" : ""}`
                  : "todos responderam"
              }
            />
            <Indicador
              rotulo="Custo de preferências (C)"
              valor={painel.custoTotal ?? "—"}
              detalhe={painel.parcelas ? `dia/turno ${painel.parcelas.diaTurno} · disciplina ${painel.parcelas.disciplina}` : undefined}
            />
            <Indicador rotulo="Maior média por aula" valor={formatarRacional(painel.piorMedia)} />
            <Indicador rotulo="Amplitude entre médias" valor={formatarRacional(painel.amplitude)} />
            <Indicador
              rotulo="Duração"
              valor={formatarSegundos(painel.duracaoSegundos)}
              detalhe={`limite ${formatarSegundos(painel.limiteSegundos)} · ${rotuloMotivoTermino(painel.motivoTermino)}`}
            />
            <Indicador rotulo="Primeira grade encontrada em" valor={formatarSegundos(painel.tempoPrimeiraGradeSegundos)} />
          </dl>

          {painel.provas && (
            <div>
              <h3 className={estilos.subtitulo}>Prova por nível de otimização</h3>
              <ol className={estilos.provas}>
                {painel.provas.map((p) => (
                  <li key={p.nivel} className={estilos.prova} data-comprovado={p.comprovado}>
                    <span className={estilos.marcaProva} aria-hidden="true">
                      {p.comprovado ? "✓" : p.nivel}
                    </span>
                    <span className={estilos.textoProva}>
                      <span>
                        {p.nivel}. {nomesNivel[p.nivel]}
                      </span>
                      <span className={estilos.estadoProva}>{rotulosEstadoProva[p.estado] ?? p.estado}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {painel.diagnosticos.length > 0 && (
            <div>
              <h3 className={estilos.subtitulo}>Diagnósticos</h3>
              <ul className={estilos.diagnosticos}>
                {painel.diagnosticos.map((d, i) => (
                  <li key={`${d.codigo}-${i}`}>
                    <span className={estilos.cabecalhoDiagnostico}>
                      <Etiqueta variante={d.severidade === "erro" ? "perigo" : d.severidade === "aviso" ? "aviso" : "neutra"}>{d.severidade}</Etiqueta>
                      <Etiqueta variante={d.natureza === "comprovada" ? "neutra" : "info"}>{rotulosNatureza[d.natureza] ?? d.natureza}</Etiqueta>
                      <span className={estilos.codigo}>{d.codigo}</span>
                    </span>
                    <span>{d.mensagem}</span>
                    {Object.keys(d.entidades).length > 0 && <span className={estilos.entidades}>{JSON.stringify(d.entidades)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: string | number; detalhe?: string }) {
  return (
    <div>
      <dt>{rotulo}</dt>
      <dd>
        {valor}
        {detalhe && <span className={estilos.detalhe}> · {detalhe}</span>}
      </dd>
    </div>
  );
}

/** Tempo decorrido dentro do prazo único da execução (RN-27: 600 s). */
function Processando({ inicio, limite }: { inicio: string; limite: number }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const decorrido = Math.max(0, Math.min(limite, (agora - new Date(inicio).getTime()) / 1000));

  return (
    <div className={estilos.processando} role="status">
      <span>Motor em execução · {formatarSegundos(Math.round(decorrido))} de {formatarSegundos(limite)}</span>
      <span className={estilos.barra} aria-hidden="true">
        <span style={{ width: `${(decorrido / limite) * 100}%` }} />
      </span>
    </div>
  );
}
