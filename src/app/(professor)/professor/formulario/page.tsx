import { PainelFormulario } from "@/components/formulario/PainelFormulario";
import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";
import { obterUsuarioLogado } from "@/services/usuarios";

/** RF 2.1, 2.14–2.16: situação do formulário atual e pedidos de alteração do professor. */
export default async function PaginaFormularioProfessor() {
  const usuario = await obterUsuarioLogado("professor");
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <>
      <CabecalhoPagina
        titulo={`Olá, professor ${primeiroNome}!`}
        subtitulo="Informe sua disponibilidade e as matérias de interesse para a montagem da grade do próximo semestre."
      />
      <PainelFormulario usuario={usuario} />
    </>
  );
}
