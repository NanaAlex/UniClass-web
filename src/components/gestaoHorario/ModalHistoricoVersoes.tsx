import Link from "next/link";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Modal } from "@/components/ui/Modal";
import { formatarDataHora } from "@/lib/formatacao";
import { etiquetasStatusGrade, hrefGrade, versoesPorTurma } from "@/lib/gestaoHorario";
import { rotuloTurma } from "@/lib/horario";
import type { Grade, Turma } from "@/types";
import estilos from "./GestaoHorario.module.css";

type ModalHistoricoVersoesProps = {
  aberto: boolean;
  aoFechar: () => void;
  grades: Grade[];
  turmas: Turma[];
};

/** RF 3.19: todas as versões geradas, por turma. A primeira de cada turma é a atual. */
export function ModalHistoricoVersoes({ aberto, aoFechar, grades, turmas }: ModalHistoricoVersoesProps) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      tamanho="g"
      titulo="Histórico de versões"
      descricao="Cada geração cria uma nova versão para as turmas que não estavam bloqueadas."
    >
      <div className={estilos.historico}>
        {versoesPorTurma(grades, turmas).map(({ turma, versoes }) => (
          <section key={turma.id} aria-labelledby={`historico-${turma.id}`}>
            <h3 id={`historico-${turma.id}`} className={estilos.tituloHistorico}>
              {rotuloTurma(turma)}
            </h3>
            <ul className={estilos.listaVersoes}>
              {versoes.map((grade, i) => (
                <li key={grade.id}>
                  <span className={estilos.versao}>Versão {grade.versao}</span>
                  <span className={estilos.textoSecundario}>{formatarDataHora(grade.geradaEm)}</span>
                  <span className={estilos.etiquetasVersao}>
                    {i === 0 ? (
                      <Etiqueta variante={etiquetasStatusGrade[grade.status].variante}>
                        {etiquetasStatusGrade[grade.status].rotulo} · atual
                      </Etiqueta>
                    ) : (
                      <Etiqueta>Substituída</Etiqueta>
                    )}
                  </span>
                  <Link href={hrefGrade(grade.id)} className={estilos.linkPendencia} onClick={aoFechar}>
                    Visualizar<span className="apenas-leitor"> versão {grade.versao} de {rotuloTurma(turma)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}
