import { Botao } from "@/components/ui/Botao";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeLixeira, IconeMais } from "@/components/ui/Icones";
import { MAXIMO_BLOCOS_TURNO } from "@/lib/dadosAcademicos";
import { aulasDoBloco, rotulosDia } from "@/lib/horario";
import type { EstruturaTurno } from "@/types";
import estilos from "./GradeEstruturaTurno.module.css";

type GradeEstruturaTurnoProps = {
  estrutura: EstruturaTurno;
  aulasPorBloco: number;
  aoRemoverUltimoBloco: () => void;
  aoAdicionarBloco: () => void;
};

/** Visão do turno: dias nas colunas e blocos ordinais nas linhas, cada um com as K aulas que reúne. */
export function GradeEstruturaTurno({ estrutura, aulasPorBloco: K, aoRemoverUltimoBloco, aoAdicionarBloco }: GradeEstruturaTurnoProps) {
  const { dias, blocos } = estrutura;
  const indices = Array.from({ length: blocos }, (_, i) => i + 1);
  const botaoAdicionar = (
    <Botao variante="secundario" icone={<IconeMais />} onClick={aoAdicionarBloco} disabled={blocos >= MAXIMO_BLOCOS_TURNO}>
      Adicionar bloco
    </Botao>
  );

  if (dias.length === 0 || blocos === 0) {
    return (
      <EstadoVazio
        contorno
        titulo={dias.length === 0 ? "Nenhum dia letivo" : "Nenhum bloco de aulas"}
        descricao={dias.length === 0 ? "Escolha acima os dias da semana em que este turno tem aula." : "Adicione um bloco para o turno ter aulas."}
        acao={blocos === 0 ? botaoAdicionar : undefined}
      />
    );
  }

  return (
    <div className={estilos.envoltorio}>
      <div className={estilos.rolagem}>
        <table className={estilos.grade}>
          <caption className="apenas-leitor">Blocos do turno por dia da semana</caption>
          <thead>
            <tr>
              <th scope="col" className={estilos.colunaAula}>
                <span className="apenas-leitor">Bloco</span>
              </th>
              {dias.map((dia) => (
                <th key={dia} scope="col">
                  {rotulosDia[dia].longo}
                </th>
              ))}
              <th scope="col" className={estilos.colunaAcao}>
                <span className="apenas-leitor">Ações do bloco</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {indices.map((indice) => {
              const aulas = aulasDoBloco(K, indice);
              return (
                <tr key={indice} className={estilos.inicioBloco}>
                  <th scope="row" className={estilos.colunaAula}>
                    <span className={estilos.numeroAula}>Bloco {indice}</span>
                    <span className={estilos.horas}>{aulas.length === 1 ? `aula ${aulas[0]}` : `aulas ${aulas[0]}–${aulas[aulas.length - 1]}`}</span>
                  </th>
                  {dias.map((dia) => (
                    <td key={dia}>
                      <span className={estilos.vaga} />
                    </td>
                  ))}
                  <td className={estilos.colunaAcao}>
                    {indice === blocos && (
                      <BotaoIcone rotulo={`Remover o Bloco ${indice}`} icone={<IconeLixeira />} variante="perigo" onClick={aoRemoverUltimoBloco} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {botaoAdicionar}
    </div>
  );
}
