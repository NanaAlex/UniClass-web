import type { ButtonHTMLAttributes, ReactNode } from "react";
import estilos from "./Chip.module.css";

type GrupoChipsProps = {
  children: ReactNode;
  /** Nome do grupo para leitores de tela. Use um dos dois. */
  rotulo?: string;
  idRotulo?: string;
};

/** Grupo de chips que quebram linha (filtros com rótulos longos ou muitos itens). */
export function GrupoChips({ children, rotulo, idRotulo }: GrupoChipsProps) {
  return (
    <div className={estilos.grupo} role="group" aria-label={rotulo} aria-labelledby={idRotulo}>
      {children}
    </div>
  );
}

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  selecionado: boolean;
  /** Quantidade ao lado do rótulo; o leitor de tela lê "(n)". */
  contador?: number;
};

/** Botão alternável (aria-pressed) para filtros e seleções. */
export function Chip({ selecionado, contador, type = "button", className, children, ...props }: ChipProps) {
  return (
    <button
      type={type}
      className={[estilos.chip, className].filter(Boolean).join(" ")}
      aria-pressed={selecionado}
      {...props}
    >
      {children}
      {contador !== undefined && (
        <span className={estilos.contador}>
          <span className="apenas-leitor">(</span>
          {contador}
          <span className="apenas-leitor">)</span>
        </span>
      )}
    </button>
  );
}
