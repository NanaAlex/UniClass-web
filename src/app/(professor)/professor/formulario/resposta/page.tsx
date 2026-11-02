import { TelaRespostaFormulario } from "@/components/formulario/TelaRespostaFormulario";
import { obterUsuarioLogado } from "@/services/usuarios";

/** Preenchimento, edição ou visualização da resposta — o modo vem dos dados (RF 2.1–2.6, 2.14, 2.18). */
export default async function PaginaRespostaFormulario() {
  const usuario = await obterUsuarioLogado("professor");
  return <TelaRespostaFormulario professorId={usuario.id} />;
}
