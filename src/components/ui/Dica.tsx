import { useId, type ReactElement, type ReactNode } from "react";
import estilos from "./Dica.module.css";

type DicaProps = {
  texto: string;
  posicao?: "cima" | "baixo";
  /** Recebe o id da dica para ligar via aria-describedby. */
  children: (idDica: string) => ReactElement;
};

/** Tooltip em CSS: aparece no hover e no foco do elemento filho. */
export function Dica({ texto, posicao = "cima", children }: DicaProps): ReactNode {
  const idDica = useId();

  return (
    <span className={estilos.ancora}>
      {children(idDica)}
      <span id={idDica} role="tooltip" className={`${estilos.dica} ${estilos[posicao]}`}>
        {texto}
      </span>
    </span>
  );
}
