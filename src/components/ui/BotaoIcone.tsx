import type { ButtonHTMLAttributes, ReactNode } from "react";
import estilos from "./BotaoIcone.module.css";

type BotaoIconeProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  rotulo: string;
  icone: ReactNode;
  /** perigo: hover vermelho para exclusões. */
  variante?: "neutro" | "perigo";
  tamanho?: "p" | "m";
};

/** Botão só com ícone (fechar, excluir, mostrar senha). */
export function BotaoIcone({
  rotulo,
  icone,
  variante = "neutro",
  tamanho = "m",
  type = "button",
  className,
  ...props
}: BotaoIconeProps) {
  return (
    <button
      type={type}
      className={[estilos.botao, estilos[variante], estilos[tamanho], className].filter(Boolean).join(" ")}
      aria-label={rotulo}
      title={rotulo}
      {...props}
    >
      {icone}
    </button>
  );
}
