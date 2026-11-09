import { PainelHorarios } from "@/components/gestaoHorario/PainelHorarios";
import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";

type PaginaHorariosAdminProps = {
  searchParams: { execucao?: string };
};

/** Geração pelo motor, resultado da execução (RN-59, RN-60), travas e publicação (RN-29). */
export default function PaginaHorariosAdmin({ searchParams }: PaginaHorariosAdminProps) {
  return (
    <>
      <CabecalhoPagina titulo="Horários" subtitulo="Gere a grade com o motor, revise o resultado, trave o que deve ser mantido e publique a grade ótima." />
      <PainelHorarios execucaoId={searchParams.execucao} />
    </>
  );
}
