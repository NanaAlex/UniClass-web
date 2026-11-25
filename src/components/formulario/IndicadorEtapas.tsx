import { IconeCheck } from "@/components/ui/Icones";
import estilos from "./IndicadorEtapas.module.css";

type IndicadorEtapasProps = {
  etapas: string[];
  atual: number;
  /** Permite voltar para uma etapa já concluída. */
  aoSelecionar: (indice: number) => void;
};

export function IndicadorEtapas({ etapas, atual, aoSelecionar }: IndicadorEtapasProps) {
  return (
    <nav aria-label="Etapas do formulário">
      <ol className={estilos.lista}>
        {etapas.map((rotulo, i) => {
          const concluida = i < atual;
          return (
            <li key={rotulo} className={estilos.item} data-estado={concluida ? "concluida" : i === atual ? "atual" : "proxima"}>
              <button
                type="button"
                className={estilos.botao}
                onClick={() => aoSelecionar(i)}
                disabled={!concluida}
                aria-current={i === atual ? "step" : undefined}
              >
                <span className={estilos.numero} aria-hidden="true">
                  {concluida ? <IconeCheck /> : i + 1}
                </span>
                <span className={estilos.rotulo}>
                  <span className="apenas-leitor">
                    Etapa {i + 1} de {etapas.length}
                    {concluida ? " (concluída)" : ""}:{" "}
                  </span>
                  {rotulo}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
