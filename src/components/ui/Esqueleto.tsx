import estilos from "./Esqueleto.module.css";

type EsqueletoProps = {
  forma?: "linha" | "circulo" | "bloco";
  largura?: string;
  altura?: string;
};

export function Esqueleto({ forma = "linha", largura, altura }: EsqueletoProps) {
  return (
    <span
      className={`${estilos.esqueleto} ${estilos[forma]}`}
      style={{ width: largura, height: altura }}
      aria-hidden="true"
    />
  );
}
