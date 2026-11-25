import { Botao } from "@/components/ui/Botao";
import estilos from "./GradeTurma.module.css";

type BarraEdicaoGradeProps = {
  alteracoes: number;
  salvando: boolean;
  aoDescartar: () => void;
  aoSalvar: () => void;
};

/** Fixa no topo durante a edição: como editar, quantas mudanças e as ações. */
export function BarraEdicaoGrade({ alteracoes, salvando, aoDescartar, aoSalvar }: BarraEdicaoGradeProps) {
  return (
    <div className={estilos.barraEdicao} role="region" aria-label="Edição do horário">
      <div className={estilos.textos}>
        <p className={estilos.tituloBarra}>Editando o horário</p>
        <p className={estilos.instrucao}>
          Clique numa aula e depois no horário de destino para mover ou trocar. Use o cadeado para manter a aula na
          próxima geração.
        </p>
      </div>
      <p className={estilos.contador} aria-live="polite">
        {alteracoes === 0 ? "Nenhuma alteração" : alteracoes === 1 ? "1 aula alterada" : `${alteracoes} aulas alteradas`}
      </p>
      <div className={estilos.acoes}>
        <Botao variante="secundario" onClick={aoDescartar} disabled={salvando}>
          {alteracoes === 0 ? "Sair da edição" : "Descartar"}
        </Botao>
        <Botao onClick={aoSalvar} carregando={salvando} disabled={alteracoes === 0}>
          Salvar alterações
        </Botao>
      </div>
    </div>
  );
}
