import Link from "next/link";
import { Dica } from "@/components/ui/Dica";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeCadeado, IconeCadeadoAberto } from "@/components/ui/Icones";
import { formatarData } from "@/lib/formatacao";
import { aulasBloqueadas, etiquetasStatusGrade, hrefGrade } from "@/lib/gestaoHorario";
import { rotulosTurno } from "@/lib/horario";
import type { Grade, Turma } from "@/types";
import estilos from "./CartaoTurmaHorario.module.css";

type CartaoTurmaHorarioProps = {
  grade: Grade;
  turma: Turma;
  /** Ganhou uma versão na última geração (RF 3.17). */
  novaVersao: boolean;
  alternando: boolean;
  aoAlternarBloqueio: (grade: Grade) => void;
};

/** Uma turma no horário atual. O cartão leva à grade; o cadeado mantém a turma na próxima geração. */
export function CartaoTurmaHorario({ grade, turma, novaVersao, alternando, aoAlternarBloqueio }: CartaoTurmaHorarioProps) {
  const status = etiquetasStatusGrade[grade.status];
  const fixas = aulasBloqueadas(grade);
  const nome = `${turma.semestre}º semestre · Turma ${turma.nome}`;

  return (
    <li className={[estilos.cartao, grade.bloqueada && estilos.bloqueado].filter(Boolean).join(" ")}>
      <div className={estilos.topo}>
        <div className={estilos.textos}>
          <Link href={hrefGrade(grade.id)} className={estilos.titulo}>
            {nome}
          </Link>
          <span className={estilos.meta}>
            {rotulosTurno[turma.turno]} · v{grade.versao} · {formatarData(grade.editadaEm ?? grade.geradaEm)}
          </span>
        </div>
        <Dica texto={grade.bloqueada ? "Bloqueada: a próxima geração mantém esta turma" : "Bloquear para manter esta turma na próxima geração"}>
          {(idDica) => (
            <button
              type="button"
              className={estilos.cadeado}
              aria-pressed={grade.bloqueada}
              aria-label={`${grade.bloqueada ? "Desbloquear" : "Bloquear"} ${nome}`}
              aria-describedby={idDica}
              disabled={alternando}
              onClick={() => aoAlternarBloqueio(grade)}
            >
              {grade.bloqueada ? <IconeCadeado /> : <IconeCadeadoAberto />}
            </button>
          )}
        </Dica>
      </div>

      <div className={estilos.etiquetas}>
        <Etiqueta variante={status.variante}>{status.rotulo}</Etiqueta>
        {novaVersao && <Etiqueta variante="info" ponto>Nova versão</Etiqueta>}
        {grade.bloqueada ? (
          <Etiqueta>Turma bloqueada</Etiqueta>
        ) : (
          fixas > 0 && <Etiqueta>{fixas === 1 ? "1 aula bloqueada" : `${fixas} aulas bloqueadas`}</Etiqueta>
        )}
        {grade.editadaEm && <Etiqueta>Editada</Etiqueta>}
        {grade.conflitos.length > 0 && (
          <Etiqueta variante="aviso">
            {grade.conflitos.length === 1 ? "1 pendência" : `${grade.conflitos.length} pendências`}
          </Etiqueta>
        )}
      </div>
    </li>
  );
}
