"use client";

import { useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import { Seletor } from "@/components/ui/Seletor";
import type { Nomes } from "@/lib/gestaoHorario";
import type { Disciplina, RespostaFormulario } from "@/types";
import estilos from "./GradeTurma.module.css";

type ModalFixarDisciplinaProps = {
  aberto: boolean;
  semestre: number;
  disciplinas: Disciplina[];
  respostas: RespostaFormulario[];
  nomes: Nomes;
  aoFechar: () => void;
  /** Devolve false se a ação foi recusada (o modal continua aberto). */
  aoFixar: (disciplinaId: string, professorId: string) => boolean;
};

/**
 * RN-45: fixa o professor de uma disciplina em todas as turmas do semestre. Só aparecem professores
 * que selecionaram a disciplina no formulário: a fixação não libera disciplina não selecionada.
 */
export function ModalFixarDisciplina({ aberto, semestre, disciplinas, respostas, nomes, aoFechar, aoFixar }: ModalFixarDisciplinaProps) {
  const [disciplinaId, setDisciplinaId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const candidatos = respostas
    .filter((r) => r.interesses.some((i) => i.disciplinaId === disciplinaId))
    .map((r) => ({ valor: r.professorId, rotulo: nomes.professor(r.professorId) }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo));

  function fechar() {
    setDisciplinaId("");
    setProfessorId("");
    aoFechar();
  }

  function fixar() {
    if (aoFixar(disciplinaId, professorId)) fechar();
  }

  return (
    <Modal
      aberto={aberto}
      aoFechar={fechar}
      titulo={`Fixar professor no ${semestre}º semestre`}
      descricao="A disciplina passa a ter este professor em todas as turmas do semestre nas próximas gerações."
      rodape={
        <>
          <Botao variante="secundario" onClick={fechar}>
            Cancelar
          </Botao>
          <Botao onClick={fixar} disabled={!disciplinaId || !professorId}>
            Adicionar ao rascunho
          </Botao>
        </>
      }
    >
      <div className={estilos.camposModal}>
        <Seletor
          rotulo="Disciplina"
          placeholder="Escolha a disciplina"
          value={disciplinaId}
          onChange={(e) => {
            setDisciplinaId(e.target.value);
            setProfessorId("");
          }}
          opcoes={disciplinas.map((d) => ({ valor: d.id, rotulo: d.nome }))}
        />
        <Seletor
          rotulo="Professor"
          placeholder={disciplinaId ? "Escolha o professor" : "Escolha a disciplina primeiro"}
          value={professorId}
          onChange={(e) => setProfessorId(e.target.value)}
          disabled={!disciplinaId || candidatos.length === 0}
          opcoes={candidatos}
          dica="Só professores que selecionaram a disciplina no formulário."
        />
        {disciplinaId && candidatos.length === 0 && (
          <Aviso tipo="aviso" embutido titulo="Nenhum professor selecionou esta disciplina" descricao="Sem seleção no formulário, a disciplina não pode ser fixada." />
        )}
      </div>
    </Modal>
  );
}
