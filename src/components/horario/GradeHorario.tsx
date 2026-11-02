import { Fragment } from "react";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { rotuloAula, rotulosDia } from "@/lib/horario";
import type { Aula, DiaSemana, EstruturaTurno } from "@/types";
import { CelulaAula, type InfoSecundaria, type ModoGrade } from "./CelulaAula";
import estilos from "./GradeHorario.module.css";

type GradeHorarioProps = {
  estrutura: EstruturaTurno;
  aulas: Aula[];
  /** visualizar: só leitura · editar: bloqueio por aula (RF 3.14) e troca de lugar · selecionar: escolher uma aula */
  modo?: ModoGrade;
  rotuloAcessivel: string;
  infoSecundaria?: InfoSecundaria;
  idAulaSelecionada?: string;
  aoSelecionar?: (aula: Aula) => void;
  aoAlternarBloqueio?: (aula: Aula) => void;
  /** editar: clicar numa aula a escolhe; o próximo clique define o destino (RF 3.3). */
  aoEscolherHorario?: (horario: { dia: DiaSemana; posicao: number }) => void;
  /** Aulas com pedido de alteração não lido (RF 3.4). */
  idsComPedido?: Set<string>;
  /** visualizar: cadeado nas aulas bloqueadas (visão do administrador). */
  mostrarBloqueio?: boolean;
  carregando?: boolean;
  mensagemVazia?: string;
};

export function GradeHorario({
  estrutura,
  aulas,
  modo = "visualizar",
  rotuloAcessivel,
  infoSecundaria = "turma",
  idAulaSelecionada,
  aoSelecionar,
  aoAlternarBloqueio,
  aoEscolherHorario,
  idsComPedido,
  mostrarBloqueio = false,
  carregando = false,
  mensagemVazia = "A prévia do horário ainda não está disponível.",
}: GradeHorarioProps) {
  if (!carregando && aulas.length === 0) {
    return (
      <EstadoVazio contorno titulo="Nenhuma aula para exibir" descricao={mensagemVazia} />
    );
  }

  const aulasPorHorario = new Map(aulas.map((aula) => [`${aula.dia}:${aula.posicao}`, aula]));
  const temSelecao = modo === "selecionar" && Boolean(idAulaSelecionada);

  return (
    <div className={estilos.rolagem}>
      <table
        className={[estilos.grade, temSelecao && estilos.comSelecao].filter(Boolean).join(" ")}
        aria-busy={carregando || undefined}
      >
        <caption className="apenas-leitor">{rotuloAcessivel}</caption>
        <colgroup>
          <col className={estilos.colunaHorario} />
          {estrutura.dias.map((dia) => (
            <col key={dia} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={estilos.canto}>
              <span className="apenas-leitor">Horário</span>
            </th>
            {estrutura.dias.map((dia) => (
              <th key={dia} scope="col" className={estilos.dia}>
                <abbr title={rotulosDia[dia].longo} className={estilos.diaCurto}>
                  {rotulosDia[dia].curto}
                </abbr>
                <span className={estilos.diaLongo}>{rotulosDia[dia].longo}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {estrutura.blocos.map((bloco, indiceBloco) => {
            const anterior = estrutura.blocos[indiceBloco - 1]?.aulas.at(-1);
            const primeira = bloco.aulas[0];
            return (
              <Fragment key={indiceBloco}>
                {anterior && (
                  <tr className={estilos.intervalo}>
                    <td colSpan={estrutura.dias.length + 1}>
                      <span>Intervalo</span>
                      {anterior.fim && primeira?.inicio && (
                        <span className={estilos.intervaloHora}>
                          {anterior.fim} – {primeira.inicio}
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                {bloco.aulas.map((horario) => (
                  <tr key={horario.posicao}>
                    <th scope="row" className={estilos.horario}>
                      <span className={estilos.posicao}>{rotuloAula(horario.posicao)}</span>
                      {horario.inicio && (
                        <span className={estilos.hora}>
                          {horario.inicio}–{horario.fim}
                        </span>
                      )}
                    </th>
                    {estrutura.dias.map((dia) => {
                      const aula = aulasPorHorario.get(`${dia}:${horario.posicao}`);
                      return (
                        <td key={dia} className={estilos.celula}>
                          {carregando ? (
                            <Esqueleto forma="bloco" altura="64px" />
                          ) : (
                            <CelulaAula
                              aula={aula}
                              modo={modo}
                              contexto={`${rotulosDia[dia].longo}, ${rotuloAula(horario.posicao)}`}
                              infoSecundaria={infoSecundaria}
                              selecionada={aula !== undefined && aula.id === idAulaSelecionada}
                              aoSelecionar={aoSelecionar}
                              aoAlternarBloqueio={aoAlternarBloqueio}
                              haSelecao={Boolean(idAulaSelecionada)}
                              comPedido={aula !== undefined && Boolean(idsComPedido?.has(aula.id))}
                              mostrarBloqueio={mostrarBloqueio}
                              aoEscolher={aoEscolherHorario && (() => aoEscolherHorario({ dia, posicao: horario.posicao }))}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
