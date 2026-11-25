import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";
import { FormularioPerfil } from "@/components/perfil/FormularioPerfil";


export default function PaginaPerfilProfessor() {
  return (
    <>
      <CabecalhoPagina titulo="Meu perfil" />
      <FormularioPerfil />
    </>
  );
}
