import type { ReactNode } from "react";
import { EtapasGeracao } from "./EtapasGeracao";
import estilos from "./GestaoHorario.module.css";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";

const descricoes = [
  "O horário é gerado com as respostas do formulário. Encerre o período de respostas para continuar.",
  "Respostas encerradas. Gere o horário: o escalonador respeita a disponibilidade e as preferências dos professores.",
  "Revise a prévia de cada turma, ajuste o que for preciso e oficialize quando estiver pronta.",
  "O horário oficial está disponível para os professores. Bloqueie o que deve ser mantido antes de gerar uma nova versão.",
];

type CartaoGeracaoHorarioProps = {
  etapa: number;
  children: ReactNode;
};

/** Cartão do topo: em que etapa o processo está e o que fazer agora. */
export function CartaoGeracaoHorario({ etapa, children }: CartaoGeracaoHorarioProps) {
  return (
    <section className={estilos.cartaoGeracao} aria-labelledby="titulo-geracao">
      <CabecalhoSecao id="titulo-geracao" titulo="Geração do horário" descricao={descricoes[Math.min(etapa, descricoes.length - 1)]} />
      <EtapasGeracao atual={etapa} />
      {children}
    </section>
  );
}
