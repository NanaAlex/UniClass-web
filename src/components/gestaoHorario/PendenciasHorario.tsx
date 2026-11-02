import Link from "next/link";
import { IconeAlerta } from "@/components/ui/Icones";
import { hrefGrade } from "@/lib/gestaoHorario";
import type { Grade, Solicitacao } from "@/types";
import estilos from "./GestaoHorario.module.css";

type PendenciasHorarioProps = {
  atuais: Grade[];
  /** Pedidos de alteração de horário ainda não lidos (RF 4.4), com a grade da turma citada. */
  pedidosNaoLidos: { solicitacao: Solicitacao; gradeId?: string }[];
  /** Dentro da grade de uma turma: sem links para a própria turma. */
  naTurma?: boolean;
};

/** RF 3.10, RF 4.1–4.5: o que impediu um horário completo e o que espera a coordenação. */
export function PendenciasHorario({ atuais, pedidosNaoLidos, naTurma = false }: PendenciasHorarioProps) {
  const conflitos = atuais.flatMap((grade) => grade.conflitos.map((conflito) => ({ conflito, grade })));
  const total = conflitos.length + pedidosNaoLidos.length;
  if (total === 0) return null;

  return (
    <section className={estilos.pendencias} aria-labelledby="titulo-pendencias">
      <h2 id="titulo-pendencias" className={estilos.tituloPendencias}>
        <IconeAlerta aria-hidden="true" />
        {total === 1 ? "1 pendência" : `${total} pendências`} {naTurma ? "nesta versão" : "no horário atual"}
      </h2>
      <ul className={estilos.listaPendencias}>
        {conflitos.map(({ conflito, grade }) => (
          <li key={`${grade.id}-${conflito.id}`}>
            <span>{conflito.descricao}</span>
            {!naTurma && (
              <Link href={hrefGrade(grade.id)} className={estilos.linkPendencia}>
                Ver turma
              </Link>
            )}
          </li>
        ))}
        {pedidosNaoLidos.map(({ solicitacao, gradeId }) => (
          <li key={solicitacao.id}>
            <span>
              {solicitacao.professor.nome} pediu alteração em {solicitacao.aula?.disciplina} ({solicitacao.aula?.turma}).
            </span>
            {gradeId && (
              <Link href={hrefGrade(gradeId)} className={estilos.linkPendencia}>
                Ver pedido
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
