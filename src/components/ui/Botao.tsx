import type { ButtonHTMLAttributes, ReactNode } from "react";
import estilos from "./Botao.module.css";

export type VarianteBotao = "primario" | "secundario" | "fantasma" | "perigo" | "invertido";
export type TamanhoBotao = "p" | "m" | "g";

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  carregando?: boolean;
  icone?: ReactNode;
  larguraTotal?: boolean;
};

export function Botao({
  variante = "primario",
  tamanho = "m",
  carregando = false,
  icone,
  larguraTotal = false,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: BotaoProps) {
  const classes = [
    estilos.botao,
    estilos[variante],
    estilos[tamanho],
    larguraTotal && estilos.larguraTotal,
    carregando && estilos.carregando,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      <span className={estilos.conteudo}>
        {icone && <span className={estilos.icone} aria-hidden="true">{icone}</span>}
        {children}
      </span>
      {carregando && <span className={estilos.spinner} aria-hidden="true" />}
    </button>
  );
}
