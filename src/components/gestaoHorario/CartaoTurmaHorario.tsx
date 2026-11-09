import Link from "next/link";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeCadeado } from "@/components/ui/Icones";
import { hrefGradeTurma } from "@/lib/gestaoHorario";
import { rotulosTurno } from "@/lib/horario";
import type { GradeTurma, Turma } from "@/types";
import estilos from "./CartaoTurmaHorario.module.css";

type CartaoTurmaHorarioProps = {
  execucaoId: string;
  grade: GradeTurma;
  turma: Turma;
  aulasPorBloco: number;
  /** Posições da turma com trava (ocupação ou vaga). */
  travadas: number;
};

/** Uma turma na grade da execução. O cartão leva à grade; travar e trocar acontecem lá (sem desbloqueio). */
export function CartaoTurmaHorario({ execucaoId, grade, turma, aulasPorBloco, travadas }: CartaoTurmaHorarioProps) {
  const ocupados = grade.posicoes.filter((b) => b.disciplinaId).length;
  const tudo = travadas === grade.posicoes.length;

  return (
    <li className={[estilos.cartao, tudo && estilos.bloqueado].filter(Boolean).join(" ")}>
      <div className={estilos.topo}>
        <div className={estilos.textos}>
          <Link href={hrefGradeTurma(execucaoId, turma.id)} className={estilos.titulo}>
            {turma.semestre}º semestre · Turma {turma.nome}
          </Link>
          <span className={estilos.meta}>
            {rotulosTurno[turma.turno]} · {ocupados} de {grade.posicoes.length} blocos ocupados · {ocupados * aulasPorBloco} aulas
          </span>
        </div>
        {travadas > 0 && (
          <span className={estilos.cadeado} aria-hidden="true">
            <IconeCadeado />
          </span>
        )}
      </div>

      <div className={estilos.etiquetas}>
        {tudo ? (
          <Etiqueta variante="info">Grade travada</Etiqueta>
        ) : travadas > 0 ? (
          <Etiqueta variante="info">{travadas === 1 ? "1 posição travada" : `${travadas} posições travadas`}</Etiqueta>
        ) : (
          <Etiqueta>Sem travas</Etiqueta>
        )}
      </div>
    </li>
  );
}
