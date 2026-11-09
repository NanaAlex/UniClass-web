import type { ReactNode } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { EtapasGeracao } from "./EtapasGeracao";
import estilos from "./GestaoHorario.module.css";

const descricoes = [
  "A grade é gerada com as respostas do formulário. Lance o formulário para começar.",
  "Gere a grade: o motor Prolog CLPFD procura, em até 600 segundos, a grade completa de menor custo e tenta comprovar o ótimo.",
  "Revise o resultado. Trave posições, troque blocos na mesma turma ou fixe professores e gere novamente. Só a grade com ótimo comprovado pode ser publicada.",
  "A grade publicada está disponível para os professores. Novas gerações não alteram a publicação vigente até você publicar outra.",
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
