import { NIVEIS, rotulosNivel } from "@/lib/formulario";
import type { NivelInteresse } from "@/types";
import estilos from "./EscalaInteresse.module.css";

type EscalaInteresseProps = {
  /** Identifica o grupo de rádios (precisa ser único na página). */
  nome: string;
  rotulo: string;
  valor: NivelInteresse;
  aoMudar: (nivel: NivelInteresse) => void;
};

/** RF 2.6: interesse de 1 a 5. Rádios nativos: setas do teclado trocam o nível. */
export function EscalaInteresse({ nome, rotulo, valor, aoMudar }: EscalaInteresseProps) {
  return (
    <fieldset className={estilos.escala}>
      <legend className="apenas-leitor">{rotulo}</legend>
      {NIVEIS.map((nivel) => (
        <label key={nivel} className={estilos.opcao} title={rotulosNivel[nivel]}>
          <input
            type="radio"
            className={estilos.radio}
            name={nome}
            value={nivel}
            checked={valor === nivel}
            onChange={() => aoMudar(nivel)}
          />
          <span className={estilos.marcador} aria-hidden="true">
            {nivel}
          </span>
          <span className="apenas-leitor">{rotulosNivel[nivel]}</span>
        </label>
      ))}
    </fieldset>
  );
}
