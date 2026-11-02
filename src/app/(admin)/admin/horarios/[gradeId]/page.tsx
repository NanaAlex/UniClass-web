import { PainelGradeTurma } from "@/components/gestaoHorario/PainelGradeTurma";

type PaginaGradeTurmaProps = {
  params: { gradeId: string };
};

/** RF 3.3, RF 3.11, RF 3.14: uma versão do horário de uma turma, com edição e pedidos de alteração. */
export default function PaginaGradeTurma({ params }: PaginaGradeTurmaProps) {
  return <PainelGradeTurma gradeId={params.gradeId} />;
}
