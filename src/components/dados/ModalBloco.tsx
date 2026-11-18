"use client";

import { useState, type FormEvent } from "react";
import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Modal } from "@/components/ui/Modal";
import { MINUTOS_NO_DIA, paraHora, paraMinutos, type HorarioBloco } from "@/lib/dadosAcademicos";
// Mesmo espaçamento dos campos do modal de prazo
import estilos from "@/components/gestaoFormulario/GestaoFormulario.module.css";

type ModalBlocoProps = {
  titulo: string;
  rotuloAcao: string;
  /** Valores iniciais: os do bloco editado ou a sugestão para um novo. */
  inicial: HorarioBloco;
  qtdAulas: number;
  /** Fim do bloco anterior (minutos): o bloco começa depois, com um intervalo. */
  depoisDe: number | null;
  /** Início do bloco seguinte (minutos): o bloco termina antes dele. */
  antesDe: number | null;
  aoFechar: () => void;
  aoSalvar: (horario: HorarioBloco) => void;
};

/**
 * RF 7.2, RF 7.3 (CU-017): início da primeira aula e duração de cada aula do bloco.
 * As mesmas regras que o back confere ao salvar, para o erro aparecer no campo.
 * Montado só quando aberto, para sempre começar com os valores atuais.
 */
export function ModalBloco({ titulo, rotuloAcao, inicial, qtdAulas, depoisDe, antesDe, aoFechar, aoSalvar }: ModalBlocoProps) {
  const [horaInicio, setHoraInicio] = useState(inicial.horaInicio);
  const [duracao, setDuracao] = useState(String(inicial.duracaoAula));
  const [erros, setErros] = useState<{ horaInicio?: string; duracao?: string }>({});

  const duracaoAula = Number(duracao);
  const duracaoValida = Number.isInteger(duracaoAula) && duracaoAula > 0;
  const horaValida = /^([01]\d|2[0-3]):[0-5]\d$/.test(horaInicio);
  const inicio = horaValida ? paraMinutos(horaInicio) : null;
  const fim = inicio !== null && duracaoValida ? inicio + qtdAulas * duracaoAula : null;

  function salvar(evento: FormEvent) {
    evento.preventDefault();
    const encontrados = {
      horaInicio: !horaValida
        ? "Informe o horário de início."
        : depoisDe !== null && inicio! <= depoisDe
          ? `Comece depois das ${paraHora(depoisDe)}, quando termina o bloco anterior.`
          : undefined,
      duracao: !duracaoValida
        ? "Informe a duração em minutos (número inteiro maior que zero)."
        : fim !== null && fim >= MINUTOS_NO_DIA
          ? "Com essa duração, o bloco terminaria depois da meia-noite."
          : fim !== null && antesDe !== null && fim >= antesDe
            ? `O bloco precisa terminar antes das ${paraHora(antesDe)}, quando começa o seguinte.`
            : undefined,
    };
    setErros(encontrados);
    if (encontrados.horaInicio || encontrados.duracao) return;
    aoSalvar({ horaInicio, duracaoAula });
  }

  const idFormulario = "formulario-bloco";

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      tamanho="p"
      titulo={titulo}
      descricao={`O bloco tem ${qtdAulas === 1 ? "1 aula" : `${qtdAulas} aulas`} seguidas.`}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" form={idFormulario}>
            {rotuloAcao}
          </Botao>
        </>
      }
    >
      <form id={idFormulario} onSubmit={salvar} noValidate className={estilos.camposModal}>
        <CampoTexto
          rotulo="Início da primeira aula"
          type="time"
          required
          value={horaInicio}
          erro={erros.horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
        />
        <CampoTexto
          rotulo="Duração de cada aula (minutos)"
          type="number"
          inputMode="numeric"
          min={1}
          required
          value={duracao}
          erro={erros.duracao}
          dica={fim !== null && fim < MINUTOS_NO_DIA ? `O bloco termina às ${paraHora(fim)}.` : undefined}
          onChange={(e) => setDuracao(e.target.value)}
        />
      </form>
    </Modal>
  );
}
