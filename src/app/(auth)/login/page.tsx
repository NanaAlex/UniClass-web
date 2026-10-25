import type { Metadata } from "next";
import { FormularioLogin } from "@/components/autenticacao/FormularioLogin";

export const metadata: Metadata = { title: "Entrar · Staggy" };

export default function PaginaLogin() {
  return <FormularioLogin />;
}
