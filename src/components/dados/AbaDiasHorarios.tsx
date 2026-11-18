"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { Abas } from "@/components/ui/Abas";
import { Aviso } from "@/components/ui/Aviso";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { Seletor } from "@/components/ui/Seletor";
import {
  MAXIMO_AULAS_BLOCO,
  adicionarBloco,
  alternarDia,
  cargasIncompativeis,
  definirAulasPorBloco,
  editarHorarioBloco,
  fimDoBloco,
  horarioDoBloco,
  paraMinutos,
  removerUltimoBloco,
  substituirEstrutura,
  sugestaoNovoBloco,
  type HorarioBloco,
} from "@/lib/dadosAcademicos";
import { rotulosDia, rotulosTurno } from "@/lib/horario";
import type { DadosAcademicos, DiaSemana, EstruturaTurno, Turno } from "@/types";
import { FiltroDias } from "./FiltroDias";
import { GradeEstruturaTurno } from "./GradeEstruturaTurno";
import { ModalBloco } from "./ModalBloco";
import estilos from "./Dados.module.css";

type AbaDiasHorariosProps = {
  dados: DadosAcademicos;
  atualizar: (transformar: (atuais: DadosAcademicos) => DadosAcademicos) => void;
};

const opcoesAulas = Array.from({ length: MAXIMO_AULAS_BLOCO }, (_, i) => ({
  valor: String(i + 1),
  rotulo: i === 0 ? "1 aula" : `${i + 1} aulas`,
}));

/**
 * RN-09, RN-10, RN-35: K global, dias letivos e quantidade de blocos ordinais de cada turno. O horário de
 * relógio de cada bloco é pedido só porque o back o exige para gravar (RF 7.3); não identifica o bloco.
 */
export function AbaDiasHorarios({ dados, atualizar }: AbaDiasHorariosProps) {
  const { mostrarAviso } = useAvisos();
  const [turno, setTurno] = useState<Turno>("manha");
  const [exclusao, setExclusao] = useState<PedidoConfirmacao | null>(null);
  // null: modal fechado · indice null: novo bloco · indice (1..B): editar o horário desse bloco
  const [edicao, setEdicao] = useState<{ indice: number | null } | null>(null);
  const estrutura = dados.estruturas.find((e) => e.turno === turno);
  const incompativeis = cargasIncompativeis(dados);
  const K = dados.aulasPorBloco;

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

  function excluirUltimoBloco() {
    if (!estrutura) return;
    setExclusao({
      titulo: `Remover o Bloco ${estrutura.blocos}?`,
      descricao: `O turno da ${rotulosTurno[turno].toLowerCase()} passa a ter ${estrutura.blocos - 1} ${estrutura.blocos - 1 === 1 ? "bloco" : "blocos"} por dia.`,
      rotuloAcao: "Remover bloco",
      aoConfirmar: () => {
        alterar(removerUltimoBloco);
        mostrarAviso({ tipo: "sucesso", titulo: `Bloco ${estrutura.blocos} removido` });
      },
    });
  }

  // RF 7.3: o horário vem do modal (o back exige início e duração das aulas de cada bloco)
  function salvarHorario(horario: HorarioBloco) {
    const indice = edicao?.indice ?? null;
    if (indice === null) {
      alterar((e) => adicionarBloco(e, horario));
      mostrarAviso({ tipo: "sucesso", titulo: "Bloco adicionado", descricao: `Ele reúne ${K} aulas seguidas.` });
    } else {
      alterar((e) => editarHorarioBloco(e, indice, horario));
      mostrarAviso({ tipo: "sucesso", titulo: `Horário do Bloco ${indice} alterado` });
    }
    setEdicao(null);
  }

  // Limites do bloco no modal: depois do fim do anterior (intervalo) e antes do início do seguinte
  const editando = edicao?.indice ?? null;
  const indiceModal = editando ?? (estrutura?.blocos ?? 0) + 1;
  const horarioSeguinte = estrutura && editando !== null ? horarioDoBloco(estrutura, indiceModal + 1) : null;

  return (
    <section className={estilos.cartaoSecao} aria-labelledby="titulo-dias-horarios">
      <CabecalhoSecao
        id="titulo-dias-horarios"
        titulo="Dias e blocos das aulas"
        descricao="As aulas se agrupam em blocos de K aulas seguidas, iguais em todos os turnos e dias. Cada turno define os dias letivos e quantos blocos tem por dia. Os blocos são identificados pela ordem; o horário de cada um é registrado só para o cadastro e não entra na geração."
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

      <div className={estilos.controles}>
        <Seletor
          rotulo="Aulas por bloco (K)"
          dica="Vale para todos os turnos e dias."
          className={estilos.seletorCurto}
          opcoes={opcoesAulas}
          value={String(K)}
          onChange={(evento) => atualizar((atuais) => definirAulasPorBloco(atuais, Number(evento.target.value)))}
        />
        {estrutura && <FiltroDias dias={estrutura.dias} aoAlternar={alternar} />}
      </div>

      {incompativeis.length > 0 && (
        <Aviso
          tipo="aviso"
          embutido
          titulo={`Com ${K} aulas por bloco, ${incompativeis.length === 1 ? "1 disciplina fica" : `${incompativeis.length} disciplinas ficam`} com carga incompatível`}
          descricao={`A carga semanal precisa ser múltipla de ${K}: ${incompativeis.map((d) => `${d.nome} (${d.aulasPorSemana})`).join(", ")}. Ajuste na aba Disciplinas antes de salvar.`}
        />
      )}

      {estrutura && (
        <GradeEstruturaTurno
          estrutura={estrutura}
          aulasPorBloco={K}
          aoRemoverUltimoBloco={excluirUltimoBloco}
          aoEditarBloco={(indice) => setEdicao({ indice })}
          aoAdicionarBloco={() => setEdicao({ indice: null })}
        />
      )}
      {edicao && estrutura && (
        <ModalBloco
          titulo={editando !== null ? `Horário do Bloco ${editando}` : "Novo bloco"}
          rotuloAcao={editando !== null ? "Salvar horário" : "Adicionar bloco"}
          qtdAulas={K}
          inicial={(editando !== null && horarioDoBloco(estrutura, editando)) || sugestaoNovoBloco(estrutura, K)}
          depoisDe={indiceModal > 1 ? fimDoBloco(estrutura, indiceModal - 1, K) : null}
          antesDe={horarioSeguinte ? paraMinutos(horarioSeguinte.horaInicio) : null}
          aoFechar={() => setEdicao(null)}
          aoSalvar={salvarHorario}
        />
      )}
      <ModalConfirmacao pedido={exclusao} aoFechar={() => setExclusao(null)} />
    </section>
  );
}
