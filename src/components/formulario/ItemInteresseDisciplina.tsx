import { Botao } from "@/components/ui/Botao";
import { IconeCheck, IconeMais } from "@/components/ui/Icones";
import { rotulosNivel } from "@/lib/formulario";
import type { Disciplina, NivelInteresse } from "@/types";
import { EscalaInteresse } from "./EscalaInteresse";
import estilos from "./ListaInteresseDisciplinas.module.css";

export type ModoInteresse = "selecao" | "prioridade" | "leitura";

type ItemInteresseDisciplinaProps = {
  disciplina: Disciplina;
  /** Ausente = matéria não selecionada. */
  nivel?: NivelInteresse;
  aoAlternar?: () => void;
  aoMudarNivel?: (nivel: NivelInteresse) => void;
  modo: ModoInteresse;
};

export function ItemInteresseDisciplina({ disciplina, nivel, aoAlternar, aoMudarNivel, modo }: ItemInteresseDisciplinaProps) {
  const selecionada = nivel !== undefined;

  return (
    <li className={estilos.item} data-selecionada={(modo === "selecao" && selecionada) || undefined}>
      <div className={estilos.textos}>
        <span className={estilos.nome}>{disciplina.nome}</span>
        <span className={estilos.detalhes}>
          {disciplina.semestre}º semestre · {disciplina.aulasPorSemana} aulas por semana
        </span>
      </div>

      <div className={estilos.interesse}>
        {modo === "selecao" ? (
          <Botao
            tamanho="p"
            variante={selecionada ? "primario" : "secundario"}
            icone={selecionada ? <IconeCheck /> : <IconeMais />}
            aria-pressed={selecionada}
            aria-label={`Selecionar ${disciplina.nome}`}
            onClick={aoAlternar}
            className={estilos.alternar}
          >
            {selecionada ? "Selecionada" : "Selecionar"}
          </Botao>
        ) : nivel === undefined ? null : modo === "leitura" ? (
          <span className={estilos.nivelLeitura}>
            Interesse <strong>{nivel}</strong> · {rotulosNivel[nivel]}
          </span>
        ) : (
          <EscalaInteresse
            nome={`interesse-${disciplina.id}`}
            rotulo={`Interesse em ${disciplina.nome}`}
            valor={nivel}
            aoMudar={(novo) => aoMudarNivel?.(novo)}
          />
        )}
      </div>
    </li>
  );
}
