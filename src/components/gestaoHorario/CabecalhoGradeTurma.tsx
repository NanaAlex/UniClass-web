import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";
import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeCadeado, IconeCadeadoAberto } from "@/components/ui/Icones";
import { formatarDataHora } from "@/lib/formatacao";
import { etiquetasStatusGrade, hrefHorarios } from "@/lib/gestaoHorario";
import { rotuloTurma } from "@/lib/horario";
import type { Grade, Turma } from "@/types";

type CabecalhoGradeTurmaProps = {
  grade: Grade;
  turma: Turma;
  /** Versões antigas são só leitura. */
  atual: boolean;
  editando: boolean;
  alternandoBloqueio: boolean;
  aoEditar: () => void;
  aoAlternarBloqueio: () => void;
};

/** RF 3.11: turma, versão e situação; ações de editar e bloquear a turma inteira. */
export function CabecalhoGradeTurma({
  grade,
  turma,
  atual,
  editando,
  alternandoBloqueio,
  aoEditar,
  aoAlternarBloqueio,
}: CabecalhoGradeTurmaProps) {
  const status = etiquetasStatusGrade[grade.status];

  return (
    <CabecalhoPagina
      voltar={{ href: hrefHorarios, rotulo: "Horários" }}
      titulo={`Horário do ${rotuloTurma(turma)}`}
      meta={
        <>
          <Etiqueta variante={atual ? status.variante : "neutra"}>{atual ? status.rotulo : "Versão substituída"}</Etiqueta>
          {grade.bloqueada && <Etiqueta>Turma bloqueada</Etiqueta>}
          <span>Versão {grade.versao}</span>
          <span>Gerada em {formatarDataHora(grade.geradaEm)}</span>
          {grade.editadaEm && <span>Editada em {formatarDataHora(grade.editadaEm)}</span>}
        </>
      }
      acoes={
        atual &&
        !editando && (
          <>
            <Botao
              variante="secundario"
              icone={grade.bloqueada ? <IconeCadeado /> : <IconeCadeadoAberto />}
              aria-pressed={grade.bloqueada}
              carregando={alternandoBloqueio}
              onClick={aoAlternarBloqueio}
            >
              {grade.bloqueada ? "Desbloquear turma" : "Bloquear turma"}
            </Botao>
            <Botao onClick={aoEditar}>Editar horário</Botao>
          </>
        )
      }
    />
  );
}
