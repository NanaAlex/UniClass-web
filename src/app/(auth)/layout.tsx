import type { ReactNode } from "react";
import { PainelMarca } from "@/components/autenticacao/PainelMarca";
import estilos from "./layout.module.css";

/** Login, recuperar senha e futuras telas sem menu lateral. */
export default function LayoutAutenticacao({ children }: { children: ReactNode }) {
  return (
    <div className={estilos.estrutura}>
      <PainelMarca />
      <main className={estilos.conteudo}>
        <div className={estilos.coluna}>{children}</div>
      </main>
    </div>
  );
}
