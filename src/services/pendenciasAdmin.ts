import { cookies } from "next/headers";
import { CHAVE_TOKEN, URL_API } from "./api";

/*
   Contador do item Professores no menu (RF 4.4)
   Roda no servidor do Next, no layout do administrador: lê o token do
   cookie, como services/usuarios.ts. Conta os professores com pedido que
   aguarda a coordenação (indicadores do back: pedido de formulário
   pendente ou pedido de horário não lido).
   Qualquer falha vira 0: o contador não pode impedir a página de abrir.
*/
type ProfessorApi = { solicitouAlteracaoFormulario: boolean; solicitouAlteracaoHorario: boolean };

export async function contarProfessoresComPedido(): Promise<number> {
  const token = cookies().get(CHAVE_TOKEN)?.value;
  if (!token) return 0;

  try {
    const resposta = await fetch(`${URL_API}/admin/professores`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!resposta.ok) return 0;

    const { professores }: { professores: ProfessorApi[] } = await resposta.json();
    return professores.filter((p) => p.solicitouAlteracaoFormulario || p.solicitouAlteracaoHorario).length;
  } catch {
    return 0; // back desligado
  }
}
