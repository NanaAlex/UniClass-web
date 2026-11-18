import type { Metadata } from "next";
import { FormularioRedefinirSenha } from "@/components/autenticacao/FormularioRedefinirSenha";

export const metadata: Metadata = { title: "Criar nova senha · Staggy" };

type Props = { params: { token: string } };

/** RF 1.4: página aberta pelo link do e-mail de recuperação. O [token] vem da URL. */
export default function PaginaRedefinirSenha({ params }: Props) {
  return <FormularioRedefinirSenha token={params.token} />;
}