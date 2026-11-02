"use client";

import { useEffect, useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import { Seletor } from "@/components/ui/Seletor";
import { rotulosTurno } from "@/lib/horario";
import type { Turno } from "@/types";

type ModalNovaTurmaProps = {
  /** Semestre que recebe a turma; `null` mantém o modal fechado. */
  semestre: number | null;
  nomeSugerido: string;
  aoFechar: () => void;
  aoCriar: (turno: Turno) => void;
};

const opcoesTurno = (Object.keys(rotulosTurno) as Turno[]).map((turno) => ({ valor: turno, rotulo: rotulosTurno[turno] }));

/** RF 7.5: a turma recebe a próxima letra livre; o administrador só escolhe o turno. */
export function ModalNovaTurma({ semestre, nomeSugerido, aoFechar, aoCriar }: ModalNovaTurmaProps) {
  const [turno, setTurno] = useState<Turno>("manha");

  useEffect(() => {
    if (semestre !== null) setTurno("manha");
  }, [semestre]);

  return (
    <Modal
      aberto={semestre !== null}
      aoFechar={aoFechar}
      tamanho="p"
      titulo={`Nova turma no ${semestre ?? ""}º semestre`}
      descricao={`Ela será criada como Turma ${nomeSugerido}.`}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao onClick={() => aoCriar(turno)}>Criar turma</Botao>
        </>
      }
    >
      <Seletor
        rotulo="Turno"
        opcoes={opcoesTurno}
        value={turno}
        onChange={(evento) => setTurno(evento.target.value as Turno)}
      />
    </Modal>
  );
}
