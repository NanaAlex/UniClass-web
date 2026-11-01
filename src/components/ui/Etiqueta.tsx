import type { ReactNode } from "react";
import estilos from "./Etiqueta.module.css";

export type VarianteEtiqueta = "neutra" | "info" | "sucesso" | "aviso" | "perigo";

type EtiquetaProps = {
  variante?: VarianteEtiqueta;
  ponto?: boolean;
  children: ReactNode;
};

export function Etiqueta({ variante = "neutra", ponto = false, children }: EtiquetaProps) {
  return (
    <span className={`${estilos.etiqueta} ${estilos[variante]}`}>
      {ponto && <span className={estilos.ponto} aria-hidden="true" />}
      {children}
    </span>
  );
}
