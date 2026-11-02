"use client";

import { useState, type FormEvent } from "react";
import { AreaTexto } from "@/components/ui/AreaTexto";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { corDaDisciplina, rotuloAula, rotulosDia, rotuloTurma } from "@/lib/horario";
import { LIMITES_DESCRICAO } from "@/lib/solicitacao";
import type { Aula } from "@/types";
import estilos from "./FormularioSolicitacaoHorario.module.css";

type FormularioSolicitacaoHorarioProps = {
  /** null: o professor ainda não escolheu a aula na grade. */
  aula: Aula | null;
  aoCancelar: () => void;
  /** Rejeita a promessa em caso de falha; o texto digitado é mantido. */
  aoEnviar: (descricao: string) => Promise<void>;
};

const { minimo, maximo } = LIMITES_DESCRICAO;

/** RF 3.4, RF 9.3: descrição do pedido de alteração da aula escolhida. */
export function FormularioSolicitacaoHorario({ aula, aoCancelar, aoEnviar }: FormularioSolicitacaoHorarioProps) {
  const [texto, setTexto] = useState("");
  const [erroCampo, setErroCampo] = useState<string>();
  const [falhaEnvio, setFalhaEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!aula) {
    return (
      <p className={estilos.espera}>
        Nenhuma aula selecionada. Escolha uma aula na grade acima para descrever o pedido.
      </p>
    );
  }

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
      <div className={estilos.aula} data-cor-disciplina={corDaDisciplina(aula.disciplina)}>
        <span id="titulo-pedido-horario" className={estilos.rotuloAula}>
          Aula selecionada
        </span>
        <strong className={estilos.nomeAula}>{aula.disciplina.nome}</strong>
        <span className={estilos.detalhesAula}>
          {rotulosDia[aula.dia].longo} · {rotuloAula(aula.posicao)} · {rotuloTurma(aula.turma)}
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
        placeholder="Ex.: Tenho outro compromisso fixo neste horário. Seria possível trocar esta aula por quinta, 1ª aula?"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setErroCampo(undefined);
        }}
        maxLength={maximo}
        mostrarContador
        erro={erroCampo}
        dica={`Mínimo de ${minimo} caracteres. A coordenação lê o pedido e ajusta o horário se for possível.`}
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
