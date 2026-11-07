"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { Abas } from "@/components/ui/Abas";
import { Seletor } from "@/components/ui/Seletor";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import {
  MAXIMO_AULAS_BLOCO,
  adicionarBloco,
  alternarDia,
  aulasPorBloco,
  definirAulasPorBloco,
  removerBloco,
  substituirEstrutura,
} from "@/lib/dadosAcademicos";
import { rotulosDia, rotulosTurno } from "@/lib/horario";
import type { DadosAcademicos, DiaSemana, EstruturaTurno, Turno } from "@/types";
import { FiltroDias } from "./FiltroDias";
import { GradeEstruturaTurno } from "./GradeEstruturaTurno";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import estilos from "./Dados.module.css";

type AbaDiasHorariosProps = {
  dados: DadosAcademicos;
  atualizar: (transformar: (atuais: DadosAcademicos) => DadosAcademicos) => void;
};

const opcoesAulas = Array.from({ length: MAXIMO_AULAS_BLOCO }, (_, i) => ({
  valor: String(i + 1),
  rotulo: i === 0 ? "1 aula" : `${i + 1} aulas`,
}));

/** RF 7.1–7.3: dias letivos, tamanho dos blocos e blocos de aula de cada turno. */
export function AbaDiasHorarios({ dados, atualizar }: AbaDiasHorariosProps) {
  const { mostrarAviso } = useAvisos();
  const [turno, setTurno] = useState<Turno>("manha");
  const [exclusao, setExclusao] = useState<PedidoConfirmacao | null>(null);
  const estrutura = dados.estruturas.find((e) => e.turno === turno);

  function alterar(transformar: (atual: EstruturaTurno) => EstruturaTurno) {
    atualizar((atuais) => {
      const atual = atuais.estruturas.find((e) => e.turno === turno);
      return atual ? substituirEstrutura(atuais, transformar(atual)) : atuais;
    });
  }

  function alternar(dia: DiaSemana, incluir: boolean) {
    alterar((e) => alternarDia(e, dia, incluir));
    mostrarAviso({
      tipo: "sucesso",
      titulo: incluir ? "Dia letivo adicionado" : "Dia letivo removido",
      descricao: `${rotulosDia[dia].longo} · turno da ${rotulosTurno[turno].toLowerCase()}.`,
    });
  }

  function excluirBloco(indice: number) {
    setExclusao({
      titulo: `Remover o bloco ${indice + 1}?`,
      descricao: `As aulas dele saem do turno da ${rotulosTurno[turno].toLowerCase()} e as seguintes são renumeradas.`,
      rotuloAcao: "Remover bloco",
      aoConfirmar: () => {
        alterar((e) => removerBloco(e, indice));
        mostrarAviso({ tipo: "sucesso", titulo: `Bloco ${indice + 1} removido` });
      },
    });
  }

  function incluirBloco() {
    alterar(adicionarBloco);
    mostrarAviso({ tipo: "sucesso", titulo: "Bloco adicionado", descricao: "Ele começa depois de um intervalo." });
  }

  return (
    <section className={estilos.cartaoSecao} aria-labelledby="titulo-dias-horarios">
      <CabecalhoSecao
        id="titulo-dias-horarios"
        titulo="Dias e horários das aulas"
        descricao="Defina, para cada turno, os dias letivos e como as aulas se agrupam em blocos. Entre um bloco e outro há um intervalo."
        acoes={
          <Abas
            variante="pilula"
            rotuloAcessivel="Turno"
            valor={turno}
            aoMudar={(valor) => setTurno(valor as Turno)}
            abas={dados.estruturas.map((e) => ({ valor: e.turno, rotulo: rotulosTurno[e.turno] }))}
          />
        }
      />

      {estrutura && (
        <>
          <div className={estilos.controles}>
            <FiltroDias dias={estrutura.dias} aoAlternar={alternar} />
            <Seletor
              rotulo="Aulas por bloco"
              className={estilos.seletorCurto}
              opcoes={opcoesAulas}
              value={String(aulasPorBloco(estrutura))}
              onChange={(evento) => alterar((e) => definirAulasPorBloco(e, Number(evento.target.value)))}
            />
          </div>
          <GradeEstruturaTurno estrutura={estrutura} aoRemoverBloco={excluirBloco} aoAdicionarBloco={incluirBloco} />
        </>
      )}
      <ModalConfirmacao pedido={exclusao} aoFechar={() => setExclusao(null)} />
    </section>
  );
}
