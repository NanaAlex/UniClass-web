import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";
import { Botao } from "@/components/ui/Botao";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeCadeado } from "@/components/ui/Icones";
import { formatarDataHora } from "@/lib/formatacao";
import { rotulosStatus } from "@/lib/geracao";
import { hrefExecucao } from "@/lib/gestaoHorario";
import type { Execucao } from "@/types";

type CabecalhoGradeProps = {
  titulo: string;
  execucao: Execucao;
  /** "8 de 10 posições travadas" etc. */
  resumoTravas: string;
  editando: boolean;
  /** Tudo já travado: o botão de travar a grade inteira some. */
  tudoTravado: boolean;
  rotuloTravarTudo: string;
  travandoTudo: boolean;
  aoEditar: () => void;
  aoTravarTudo: () => void;
};

/** Título, execução de origem e as ações de travar a grade inteira ou editar (sem desbloqueio). */
export function CabecalhoGrade({
  titulo,
  execucao,
  resumoTravas,
  editando,
  tudoTravado,
  rotuloTravarTudo,
  travandoTudo,
  aoEditar,
  aoTravarTudo,
}: CabecalhoGradeProps) {
  const status = rotulosStatus[execucao.status];

  return (
    <CabecalhoPagina
      voltar={{ href: hrefExecucao(execucao.id), rotulo: "Horários" }}
      titulo={titulo}
      meta={
        <>
          <Etiqueta variante={status.variante}>{status.rotulo}</Etiqueta>
          {execucao.publicadaEm ? <Etiqueta variante="sucesso">Publicada</Etiqueta> : <Etiqueta>Não publicada</Etiqueta>}
          {execucao.simulada && <Etiqueta variante="info">Simulação do front</Etiqueta>}
          <span>Execução de {formatarDataHora(execucao.iniciadaEm)}</span>
          <span>{resumoTravas}</span>
        </>
      }
      acoes={
        !editando && (
          <>
            {!tudoTravado && (
              <Botao variante="secundario" icone={<IconeCadeado />} carregando={travandoTudo} onClick={aoTravarTudo}>
                {rotuloTravarTudo}
              </Botao>
            )}
            <Botao onClick={aoEditar}>Editar e travar</Botao>
          </>
        )
      }
    />
  );
}
