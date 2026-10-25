import type { Metadata } from "next";
import { FormularioRecuperarSenha } from "@/components/autenticacao/FormularioRecuperarSenha";

export const metadata: Metadata = { title: "Recuperar senha · Staggy" };

type Props = { searchParams: { email?: string } };

/** O login envia o e-mail já digitado em ?email= para não precisar redigitar. */
export default function PaginaRecuperarSenha({ searchParams }: Props) {
  return <FormularioRecuperarSenha emailInicial={searchParams.email ?? ""} />;
}
