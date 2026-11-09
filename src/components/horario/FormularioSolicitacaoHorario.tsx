"use client";

import { useState, type FormEvent } from "react";
import { AreaTexto } from "@/components/ui/AreaTexto";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import type { Nomes } from "@/lib/gestaoHorario";
import { corDaDisciplina, rotuloBloco, rotulosDia, rotulosTurno } from "@/lib/horario";
import { LIMITES_DESCRICAO } from "@/lib/solicitacao";
import type { BlocoGrade } from "@/types";
import estilos from "./FormularioSolicitacaoHorario.module.css";

type FormularioSolicitacaoHorarioProps = {
  /** null: o professor ainda não escolheu o bloco na grade. */
  bloco: BlocoGrade | null;
  nomes: Nomes;
  aulasPorBloco: number;
  aoCancelar: () => void;
  /** Rejeita a promessa em caso de falha; o texto digitado é mantido. */
  aoEnviar: (descricao: string) => Promise<void>;
};

const { minimo, maximo } = LIMITES_DESCRICAO;

/** RF 3.4, RF 9.3: descrição do pedido de alteração do bloco escolhido (o bloco inteiro, RN-58). */
export function FormularioSolicitacaoHorario({ bloco, nomes, aulasPorBloco, aoCancelar, aoEnviar }: FormularioSolicitacaoHorarioProps) {
  const [texto, setTexto] = useState("");
  const [erroCampo, setErroCampo] = useState<string>();
  const [falhaEnvio, setFalhaEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!bloco?.disciplinaId) {
    return <p className={estilos.espera}>Nenhum bloco selecionado. Escolha uma aula na grade acima para descrever o pedido.</p>;
  }

  const disciplina = nomes.disciplina(bloco.disciplinaId);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const descricao = texto.trim();
    if (descricao.length < minimo) {
      setErroCampo(`Explique o motivo com pelo menos ${minimo} caracteres.`);
      return;
    }
    setFalhaEnvio(false);
    setEnviando(true);
    try {
      await aoEnviar(descricao);
    } catch {
      setFalhaEnvio(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className={estilos.formulario} onSubmit={enviar} noValidate aria-labelledby="titulo-pedido-horario">
      <div className={estilos.aula} data-cor-disciplina={corDaDisciplina(disciplina ?? { id: bloco.disciplinaId })}>
        <span id="titulo-pedido-horario" className={estilos.rotuloAula}>
          Bloco selecionado
        </span>
        <strong className={estilos.nomeAula}>{disciplina?.nome ?? bloco.disciplinaId}</strong>
        <span className={estilos.detalhesAula}>
          {rotulosDia[bloco.dia].longo} · {rotulosTurno[bloco.turno]} · {rotuloBloco(aulasPorBloco, bloco.indice)}
          {bloco.turmaId && ` · ${nomes.turma(bloco.turmaId)}`}
        </span>
      </div>

      {falhaEnvio && (
        <Aviso
          tipo="perigo"
          embutido
          titulo="Não foi possível enviar a solicitação"
          descricao="Seu texto foi mantido. Tente novamente em instantes."
          aoFechar={() => setFalhaEnvio(false)}
        />
      )}

      <AreaTexto
        rotulo="Descreva a sua solicitação"
        placeholder="Ex.: Tenho outro compromisso fixo neste bloco. Seria possível trocá-lo pelo Bloco 1 de quinta?"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setErroCampo(undefined);
        }}
        maxLength={maximo}
        mostrarContador
        erro={erroCampo}
        dica={`Mínimo de ${minimo} caracteres. A coordenação lê o pedido e, se possível, ajusta a grade numa nova geração.`}
        required
        autoFocus
      />

      <div className={estilos.acoes}>
        <Botao variante="fantasma" onClick={aoCancelar} disabled={enviando}>
          Cancelar
        </Botao>
        <Botao type="submit" carregando={enviando}>
          Enviar solicitação
        </Botao>
      </div>
    </form>
  );
}
