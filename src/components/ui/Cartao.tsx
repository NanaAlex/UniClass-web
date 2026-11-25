import type { HTMLAttributes, ReactNode } from "react";
import estilos from "./Cartao.module.css";

type CartaoProps = HTMLAttributes<HTMLElement> & {
  titulo?: string;
  descricao?: string;
  acoes?: ReactNode;
  preenchimento?: "compacto" | "normal" | "amplo";
  interativo?: boolean;
};

export function Cartao({
  titulo,
  descricao,
  acoes,
  preenchimento = "normal",
  interativo = false,
  className,
  children,
  ...props
}: CartaoProps) {
  const classes = [estilos.cartao, estilos[preenchimento], interativo && estilos.interativo, className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      {(titulo || acoes) && (
        <header className={estilos.cabecalho}>
          <div>
            {titulo && <h3 className={estilos.titulo}>{titulo}</h3>}
            {descricao && <p className={estilos.descricao}>{descricao}</p>}
          </div>
          {acoes && <div className={estilos.acoes}>{acoes}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
