import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { TamanhoBotao, VarianteBotao } from "./Botao";
import estilos from "./Botao.module.css";

type LinkBotaoProps = ComponentProps<typeof Link> & {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  icone?: ReactNode;
};

/** Navegação com a aparência do Botao (ex.: "Começar" leva a outra página). */
export function LinkBotao({ variante = "primario", tamanho = "m", icone, className, children, ...props }: LinkBotaoProps) {
  return (
    <Link className={[estilos.botao, estilos[variante], estilos[tamanho], estilos.link, className].filter(Boolean).join(" ")} {...props}>
      <span className={estilos.conteudo}>
        {icone && <span className={estilos.icone} aria-hidden="true">{icone}</span>}
        {children}
      </span>
    </Link>
  );
}
