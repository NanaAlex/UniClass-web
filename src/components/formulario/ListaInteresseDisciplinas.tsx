"use client";

import { useState } from "react";
import { FiltroSemestre } from "@/components/compartilhados/FiltroSemestre";
import { BarraPesquisa } from "@/components/ui/BarraPesquisa";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { semAcento } from "@/lib/formatacao";
import { NIVEL_PADRAO } from "@/lib/formulario";
import type { Disciplina, InteresseDisciplina, NivelInteresse } from "@/types";
import { ItemInteresseDisciplina, type ModoInteresse } from "./ItemInteresseDisciplina";
import estilos from "./ListaInteresseDisciplinas.module.css";

type ListaInteresseDisciplinasProps = {
  /** Só as disciplinas cadastradas no formulário (RF 2.5). */
  disciplinas: Disciplina[];
  valor: InteresseDisciplina[];
  aoMudar?: (valor: InteresseDisciplina[]) => void;
  /**
   * selecao: filtros + escolha das matérias (RF 2.4); prioridade: nota de 1 a 5 das escolhidas (RF 2.6);
   * leitura: só as escolhidas, sem edição (RF 2.14).
   */
  modo?: ModoInteresse;
};

const mensagensVazio: Record<ModoInteresse, { titulo: string; descricao?: string }> = {
  selecao: { titulo: "Nenhuma matéria encontrada", descricao: "Tente outro nome ou selecione outros semestres." },
  prioridade: { titulo: "Nenhuma matéria selecionada", descricao: "Volte à etapa anterior e escolha as matérias que gostaria de lecionar." },
  leitura: { titulo: "Nenhuma matéria selecionada" },
};

export function ListaInteresseDisciplinas({ disciplinas, valor, aoMudar, modo = "selecao" }: ListaInteresseDisciplinasProps) {
  const [semestres, setSemestres] = useState<number[]>([]);
  const [busca, setBusca] = useState("");
  const niveis = new Map(valor.map((i) => [i.disciplinaId, i.nivel]));
  const selecao = modo === "selecao";

  const escolhidas = disciplinas.filter((d) => niveis.has(d.id));
  const visiveis =
    modo === "leitura"
      ? escolhidas.sort((a, b) => (niveis.get(b.id) ?? 0) - (niveis.get(a.id) ?? 0))
      : modo === "prioridade"
        ? escolhidas
        : disciplinas.filter(
            (d) => (semestres.length === 0 || semestres.includes(d.semestre)) && semAcento(d.nome).includes(semAcento(busca.trim())),
          );

  const contadores: Partial<Record<number, number>> = {};
  escolhidas.forEach((d) => (contadores[d.semestre] = (contadores[d.semestre] ?? 0) + 1));
  const quantidadeSemestres = Math.max(1, ...disciplinas.map((d) => d.semestre));

  function alternar(disciplina: Disciplina) {
    aoMudar?.(
      niveis.has(disciplina.id)
        ? valor.filter((i) => i.disciplinaId !== disciplina.id)
        : [...valor, { disciplinaId: disciplina.id, nivel: NIVEL_PADRAO }],
    );
  }

  function limparFiltros() {
    setBusca("");
    setSemestres([]);
  }

  function mudarNivel(disciplinaId: string, nivel: NivelInteresse) {
    aoMudar?.(valor.map((i) => (i.disciplinaId === disciplinaId ? { ...i, nivel } : i)));
  }

  return (
    <div className={estilos.container}>
      {selecao && (
        <div className={estilos.filtros}>
          <div className={estilos.filtroSemestre}>
            <span className={estilos.rotuloFiltro} aria-hidden="true">
              Filtrar por semestre
            </span>
            <FiltroSemestre multiplo selecionados={semestres} aoMudar={setSemestres} quantidade={quantidadeSemestres} contadores={contadores} />
          </div>
          <BarraPesquisa valor={busca} aoMudar={setBusca} placeholder="Buscar matéria" rotuloAcessivel="Buscar matéria pelo nome" />
        </div>
      )}

      {modo !== "prioridade" && (
        <p className={estilos.resumo} aria-live="polite">
          {valor.length === 0 ? "Nenhuma matéria selecionada" : `${valor.length} ${valor.length === 1 ? "matéria selecionada" : "matérias selecionadas"}`}
          {selecao && visiveis.length !== disciplinas.length && ` · mostrando ${visiveis.length} de ${disciplinas.length}`}
        </p>
      )}

      {visiveis.length === 0 ? (
        <EstadoVazio
          contorno
          {...mensagensVazio[modo]}
          acao={
            selecao && (
              <Botao variante="secundario" tamanho="p" onClick={limparFiltros}>
                Limpar filtros
              </Botao>
            )
          }
        />
      ) : (
        <ul className={estilos.lista}>
          {visiveis.map((disciplina) => (
            <ItemInteresseDisciplina
              key={disciplina.id}
              disciplina={disciplina}
              nivel={niveis.get(disciplina.id)}
              aoAlternar={() => alternar(disciplina)}
              aoMudarNivel={(nivel) => mudarNivel(disciplina.id, nivel)}
              modo={modo}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
