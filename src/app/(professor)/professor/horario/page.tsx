import { PainelHorarioProfessor } from "@/components/horario/PainelHorarioProfessor";
import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";
import { obterUsuarioLogado } from "@/services/usuarios";

/** RF 3.4, 3.12, 3.13, 3.16, 9.1: horário do professor e pedidos de alteração. */
export default async function PaginaHorarioProfessor() {
  const usuario = await obterUsuarioLogado("professor");
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <>
      <CabecalhoPagina
        titulo={`Olá, professor ${primeiroNome}!`}
        subtitulo="Suas aulas em todas as turmas. Se precisar mudar alguma, peça uma alteração à coordenação."
      />
      <PainelHorarioProfessor usuario={usuario} />
    </>
  );
}
