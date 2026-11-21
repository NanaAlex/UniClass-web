import Link from "next/link";
import { IconeAlerta } from "@/components/ui/Icones";
import { hrefGradeTurma, pedidosNaoLidos } from "@/lib/gestaoHorario";
import { rotulosDia, rotulosTurno } from "@/lib/horario";
import type { Solicitacao, Turma } from "@/types";
import estilos from "./GestaoHorario.module.css";

type PedidosNaoLidosProps = {
  solicitacoes: Solicitacao[];
  turmas: Turma[];
  /** Execução usada para abrir a grade da turma citada. */
  execucaoId: string | null;
};

/** RF 4.4: pedidos de alteração de horário ainda não lidos, com link para a grade da turma. */
export function PedidosNaoLidos({ solicitacoes, turmas, execucaoId }: PedidosNaoLidosProps) {
  const pedidos = pedidosNaoLidos(solicitacoes, turmas);
  if (pedidos.length === 0) return null;

  return (
    <section className={estilos.pendencias} aria-labelledby="titulo-pedidos">
      <h2 id="titulo-pedidos" className={estilos.tituloPendencias}>
        <IconeAlerta aria-hidden="true" />
        {pedidos.length === 1 ? "1 pedido de alteração não lido" : `${pedidos.length} pedidos de alteração não lidos`}
      </h2>
      <ul className={estilos.listaPendencias}>
        {pedidos.map(({ solicitacao, turma }) => (
          <li key={solicitacao.id}>
            <span>
              {solicitacao.professor.nome}: {solicitacao.aula?.disciplina} · {solicitacao.aula?.turma}
              {solicitacao.aula && ` · ${rotulosDia[solicitacao.aula.dia].longo}, ${rotulosTurno[solicitacao.aula.turno]}, Bloco ${solicitacao.aula.indice}`}
            </span>
            {turma && execucaoId && (
              <Link href={hrefGradeTurma(execucaoId, turma.id)} className={estilos.linkPendencia}>
                Abrir grade da turma
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
