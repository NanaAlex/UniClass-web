import { PainelGestaoFormulario } from "@/components/gestaoFormulario/PainelGestaoFormulario";
import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";

/** RF 2.7–2.11: lançar o formulário de disponibilidade e acompanhar as respostas. */
export default function PaginaFormularioAdministrador() {
  return (
    <>
      <CabecalhoPagina
        titulo="Formulário"
        subtitulo="Lance o formulário de disponibilidade e acompanhe quem já respondeu."
      />
      <PainelGestaoFormulario />
    </>
  );
}
