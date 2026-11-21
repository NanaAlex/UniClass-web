import { PainelGradeTurma } from "@/components/gestaoHorario/PainelGradeTurma";

type PaginaGradeTurmaProps = {
  params: { execucaoId: string; turmaId: string };
};

/** Grade de uma turma numa execução: visualização, trocas na mesma turma e travas (RN-40 a RN-64). */
export default function PaginaGradeTurma({ params }: PaginaGradeTurmaProps) {
  return <PainelGradeTurma execucaoId={decodeURIComponent(params.execucaoId)} turmaId={decodeURIComponent(params.turmaId)} />;
}
