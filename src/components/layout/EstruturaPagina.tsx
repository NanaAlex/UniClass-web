import type { ReactNode } from "react";
import type { UsuarioLogado } from "@/types";
import { MenuLateral, type ItemMenu } from "./MenuLateral";
import estilos from "./EstruturaPagina.module.css";

type EstruturaPaginaProps = {
  itensMenu: ItemMenu[];
  usuario: UsuarioLogado;
  hrefConfiguracoes: string;
  caminhoAtivo?: string;
  children: ReactNode;
};

/** Menu lateral + área de conteúdo. Usada pelos layouts de (admin) e (professor). */
export function EstruturaPagina({ itensMenu, usuario, hrefConfiguracoes, caminhoAtivo, children }: EstruturaPaginaProps) {
  return (
    <>
      <a href="#conteudo" className={estilos.pularParaConteudo}>
        Pular para o conteúdo
      </a>
      <div className={estilos.estrutura}>
        <MenuLateral
          itens={itensMenu}
          usuario={usuario}
          hrefConfiguracoes={hrefConfiguracoes}
          caminhoAtivo={caminhoAtivo}
        />
        <main id="conteudo" className={estilos.conteudo} tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
