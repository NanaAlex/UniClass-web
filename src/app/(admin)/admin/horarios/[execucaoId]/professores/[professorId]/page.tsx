import { PainelGradeProfessor } from "@/components/gestaoHorario/PainelGradeProfessor";

type PaginaGradeProfessorProps = {
  params: { execucaoId: string; professorId: string };
};

/** Visão do professor numa execução: todas as coordenadas (RN-69) e travas do professor (RN-43, RN-44). */
export default function PaginaGradeProfessor({ params }: PaginaGradeProfessorProps) {
  return <PainelGradeProfessor execucaoId={decodeURIComponent(params.execucaoId)} professorId={decodeURIComponent(params.professorId)} />;
}
