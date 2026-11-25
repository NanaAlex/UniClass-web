import { IconeCheck } from "@/components/ui/Icones";
import { etapasGeracao } from "@/lib/gestaoHorario";
import estilos from "./EtapasGeracao.module.css";

/** Onde o processo está: coletar respostas → gerar → revisar a prévia → oficializar. */
export function EtapasGeracao({ atual }: { atual: number }) {
  return (
    <ol className={estilos.lista} aria-label="Etapas da geração do horário">
      {etapasGeracao.map((rotulo, i) => {
        const estado = i < atual ? "concluida" : i === atual ? "atual" : "proxima";
        return (
          <li key={rotulo} className={estilos.item} data-estado={estado} aria-current={estado === "atual" ? "step" : undefined}>
            <span className={estilos.numero} aria-hidden="true">
              {estado === "concluida" ? <IconeCheck /> : i + 1}
            </span>
            <span className={estilos.rotulo}>
              {rotulo}
              {estado === "concluida" && <span className="apenas-leitor"> (concluída)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
