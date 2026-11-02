import { PainelPerfilProfessor } from "@/components/professores/PainelPerfilProfessor";
import { abasPerfilProfessor, origemPerfilValida, type AbaPerfilProfessor } from "@/lib/professores";

type PaginaPerfilProfessorProps = {
  params: { id: string };
  searchParams: { aba?: string; origem?: string };
};

/** RF 8.6–8.10: dados, resposta do formulário, horário e solicitações de um professor. */
export default function PaginaPerfilProfessor({ params, searchParams }: PaginaPerfilProfessorProps) {
  const aba = abasPerfilProfessor.includes(searchParams.aba as AbaPerfilProfessor)
    ? (searchParams.aba as AbaPerfilProfessor)
    : "formulario";

  return <PainelPerfilProfessor professorId={params.id} abaInicial={aba} origem={origemPerfilValida(searchParams.origem)} />;
}
