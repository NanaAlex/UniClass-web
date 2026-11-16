import { Botao } from "@/components/ui/Botao";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeLixeira, IconeMais } from "@/components/ui/Icones";
import { rotulosTurno } from "@/lib/horario";
import type { Turma } from "@/types";
import estilos from "./CartaoSemestre.module.css";

type CartaoSemestreProps = {
  numero: number;
  turmas: Turma[];
  quantidadeDisciplinas: number;
  /** Alguma turma ou disciplina dele está em uso: o back recusa a exclusão. */
  emUso?: boolean;
  aoAdicionarTurma: () => void;
  aoRemoverTurma: (turma: Turma) => void;
  aoRemoverSemestre: () => void;
};

function plural(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

/** RF 7.4–7.5: um semestre com suas turmas. */
export function CartaoSemestre({
  numero,
  turmas,
  quantidadeDisciplinas,
  emUso,
  aoAdicionarTurma,
  aoRemoverTurma,
  aoRemoverSemestre,
}: CartaoSemestreProps) {
  const idTitulo = `titulo-semestre-${numero}`;

  return (
    <article className={estilos.cartao} aria-labelledby={idTitulo}>
      <header className={estilos.cabecalho}>
        <div>
          <h3 id={idTitulo} className={estilos.titulo}>
            {numero}º semestre
          </h3>
          <p className={estilos.resumo}>
            {plural(turmas.length, "turma", "turmas")} · {plural(quantidadeDisciplinas, "disciplina", "disciplinas")}
          </p>
        </div>
        <BotaoIcone
          rotulo={emUso ? `O ${numero}º semestre está em uso e não pode ser excluído` : `Excluir ${numero}º semestre`}
          icone={<IconeLixeira />}
          variante="perigo"
          disabled={emUso}
          onClick={aoRemoverSemestre}
        />
      </header>

      {turmas.length === 0 ? (
        <p className={estilos.semTurmas}>Nenhuma turma neste semestre.</p>
      ) : (
        <ul className={estilos.turmas}>
          {turmas.map((turma) => (
            <li key={turma.id} className={estilos.turma}>
              <span className={estilos.nomeTurma}>Turma {turma.nome}</span>
              <Etiqueta>{rotulosTurno[turma.turno]}</Etiqueta>
              <BotaoIcone
                rotulo={
                  turma.emUso
                    ? `A turma ${turma.nome} tem horário gerado e não pode ser excluída`
                    : `Excluir turma ${turma.nome} do ${numero}º semestre`
                }
                icone={<IconeLixeira />}
                variante="perigo"
                tamanho="p"
                disabled={turma.emUso}
                onClick={() => aoRemoverTurma(turma)}
              />
            </li>
          ))}
        </ul>
      )}

      <Botao variante="fantasma" tamanho="p" icone={<IconeMais />} onClick={aoAdicionarTurma} className={estilos.adicionar}>
        Adicionar turma
      </Botao>
    </article>
  );
}
