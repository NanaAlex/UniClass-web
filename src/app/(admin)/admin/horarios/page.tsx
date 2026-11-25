import { PainelHorarios } from "@/components/gestaoHorario/PainelHorarios";
import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";

/** RF 3.1–3.19: gerar, revisar e oficializar a grade de horários das turmas. */
export default function PaginaHorariosAdmin() {
  return (
    <>
      <CabecalhoPagina titulo="Horários" subtitulo="Gere o horário das turmas, revise a prévia e oficialize." />
      <PainelHorarios />
    </>
  );
}
