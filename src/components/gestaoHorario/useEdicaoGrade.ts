"use client";

import { useState } from "react";
import { alternarBloqueio, contarAlteracoes, moverAula, motivoParaNaoMover, type Horario } from "@/lib/edicaoGrade";
import type { Aula, Grade } from "@/types";

/**
 * Rascunho da edição manual (RF 3.3, RF 3.14): nada é gravado até "Salvar".
 * Um clique escolhe a aula; o próximo, o destino (horário livre ou outra aula, que troca de lugar).
 */
export function useEdicaoGrade(original: Aula[], outrasGrades: Grade[], aoRecusar: (motivo: string) => void) {
  const [rascunho, setRascunho] = useState<Aula[] | null>(null);
  const [idSelecionada, setIdSelecionada] = useState<string | null>(null);

  const editando = rascunho !== null;
  const aulas = rascunho ?? original;

  function iniciar() {
    setRascunho(original);
    setIdSelecionada(null);
  }

  function encerrar() {
    setRascunho(null);
    setIdSelecionada(null);
  }

  function escolher(destino: Horario) {
    if (!rascunho) return;
    const aulaNoDestino = rascunho.find((a) => a.dia === destino.dia && a.posicao === destino.posicao);
    if (!idSelecionada || aulaNoDestino?.id === idSelecionada) {
      setIdSelecionada(aulaNoDestino && !aulaNoDestino.bloqueada && aulaNoDestino.id !== idSelecionada ? aulaNoDestino.id : null);
      return;
    }
    const motivo = motivoParaNaoMover(rascunho, idSelecionada, destino, outrasGrades);
    if (motivo) return aoRecusar(motivo);
    setRascunho(moverAula(rascunho, idSelecionada, destino));
    setIdSelecionada(null);
  }

  function alternar(aula: Aula) {
    if (!rascunho) return;
    setRascunho(alternarBloqueio(rascunho, aula.id));
    if (aula.id === idSelecionada) setIdSelecionada(null);
  }

  return {
    editando,
    aulas,
    idSelecionada,
    alteracoes: rascunho ? contarAlteracoes(original, rascunho) : 0,
    iniciar,
    encerrar,
    escolher,
    alternar,
  };
}
