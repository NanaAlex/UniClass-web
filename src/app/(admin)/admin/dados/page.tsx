import { PainelDados } from "@/components/dados/PainelDados";
import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";
import { abasDados, type AbaDados } from "@/lib/dadosAcademicos";

type PaginaDadosProps = {
  searchParams: { aba?: string };
};

/** RF 7: dados que alimentam o formulário dos professores e a geração do horário. */
export default function PaginaDados({ searchParams }: PaginaDadosProps) {
  const aba = abasDados.includes(searchParams.aba as AbaDados) ? (searchParams.aba as AbaDados) : "horarios";

  return (
    <>
      <CabecalhoPagina
        titulo="Dados do curso"
        subtitulo="Dias, horários, semestres, turmas e disciplinas usados no formulário dos professores e na geração do horário."
      />
      <PainelDados abaInicial={aba} />
    </>
  );
}
