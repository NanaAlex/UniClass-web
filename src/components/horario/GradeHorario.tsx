import { Esqueleto } from "@/components/ui/Esqueleto";
import type { Nomes } from "@/lib/gestaoHorario";
import { aulasDoBloco, mesmaCoordenada, rotulosDia } from "@/lib/horario";
import type { BlocoGrade, Coordenada, EstruturaTurno } from "@/types";
import { CelulaBloco, type InfoSecundaria, type ModoGrade, type SituacaoTrava } from "./CelulaBloco";
import estilos from "./GradeHorario.module.css";

type GradeHorarioProps = {
  estrutura: EstruturaTurno;
  /** K: aulas por bloco (RN-09). */
  aulasPorBloco: number;
  /** Posições do turno; coordenadas sem posição aparecem vagas. */
  posicoes: BlocoGrade[];
  nomes: Nomes;
  rotuloAcessivel: string;
  infoSecundaria?: InfoSecundaria;
  /** visualizar: só leitura · editar: trocar e travar blocos · selecionar: escolher um bloco */
  modo?: ModoGrade;
  travaDe?: (c: Coordenada) => SituacaoTrava;
  selecionada?: Coordenada | null;
  aoEscolher?: (bloco: BlocoGrade) => void;
  aoTravar?: (bloco: BlocoGrade) => void;
  /** Blocos com pedido de alteração não lido (RF 3.4). */
  comPedido?: Coordenada[];
  carregando?: boolean;
};

const vazio = (c: Coordenada, K: number): BlocoGrade => ({ ...c, aulas: aulasDoBloco(K, c.indice), turmaId: null, disciplinaId: null, professorId: null, travas: [] });

/**
 * Grade de um turno por blocos ordinais (RN-10, RN-35): linhas = Bloco 1..B com as aulas que o
 * compõem, colunas = dias letivos. Não há horário de relógio.
 */
export function GradeHorario({
  estrutura,
  aulasPorBloco: K,
  posicoes,
  nomes,
  rotuloAcessivel,
  infoSecundaria = "turma",
  modo = "visualizar",
  travaDe,
  selecionada,
  aoEscolher,
  aoTravar,
  comPedido = [],
  carregando = false,
}: GradeHorarioProps) {
  const indices = Array.from({ length: estrutura.blocos }, (_, i) => i + 1);
  const temSelecao = modo === "selecionar" && Boolean(selecionada);

  return (
    <div className={estilos.rolagem}>
      <table className={[estilos.grade, temSelecao && estilos.comSelecao].filter(Boolean).join(" ")} aria-busy={carregando || undefined}>
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
              <span className="apenas-leitor">Bloco</span>
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
          {indices.map((indice) => {
            const aulas = aulasDoBloco(K, indice);
            const rotuloAulas = aulas.length === 1 ? `aula ${aulas[0]}` : `aulas ${aulas[0]}–${aulas[aulas.length - 1]}`;
            return (
              <tr key={indice}>
                <th scope="row" className={estilos.horario}>
                  <span className={estilos.posicao}>Bloco {indice}</span>
                  <span className={estilos.hora}>{rotuloAulas}</span>
                </th>
                {estrutura.dias.map((dia) => {
                  const c: Coordenada = { dia, turno: estrutura.turno, indice };
                  const bloco = posicoes.find((b) => mesmaCoordenada(b, c)) ?? vazio(c, K);
                  return (
                    <td key={dia} className={estilos.celula}>
                      {carregando ? (
                        <Esqueleto forma="bloco" altura="64px" />
                      ) : (
                        <CelulaBloco
                          bloco={bloco}
                          modo={modo}
                          contexto={`${rotulosDia[dia].longo}, Bloco ${indice} (${rotuloAulas})`}
                          nomes={nomes}
                          infoSecundaria={infoSecundaria}
                          trava={travaDe?.(c) ?? null}
                          selecionada={Boolean(selecionada && mesmaCoordenada(selecionada, c))}
                          haSelecao={Boolean(selecionada)}
                          comPedido={comPedido.some((p) => mesmaCoordenada(p, c))}
                          aoEscolher={aoEscolher && (() => aoEscolher(bloco))}
                          aoTravar={aoTravar && (() => aoTravar(bloco))}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
