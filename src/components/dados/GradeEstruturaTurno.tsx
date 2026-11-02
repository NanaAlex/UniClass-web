import { Fragment } from "react";
import { Botao } from "@/components/ui/Botao";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeLixeira, IconeMais } from "@/components/ui/Icones";
import { rotuloAula, rotulosDia } from "@/lib/horario";
import type { EstruturaTurno } from "@/types";
import estilos from "./GradeEstruturaTurno.module.css";

type GradeEstruturaTurnoProps = {
  estrutura: EstruturaTurno;
  aoRemoverBloco: (indice: number) => void;
  aoAdicionarBloco: () => void;
};

/** Prévia dos horários do turno: dias nas colunas, aulas nas linhas, intervalo entre blocos. */
export function GradeEstruturaTurno({ estrutura, aoRemoverBloco, aoAdicionarBloco }: GradeEstruturaTurnoProps) {
  const { dias, blocos } = estrutura;
  const botaoAdicionar = (
    <Botao variante="secundario" icone={<IconeMais />} onClick={aoAdicionarBloco}>
      Adicionar bloco
    </Botao>
  );

  if (dias.length === 0 || blocos.length === 0) {
    return (
      <EstadoVazio
        contorno
        titulo={dias.length === 0 ? "Nenhum dia letivo" : "Nenhum bloco de aulas"}
        descricao={
          dias.length === 0
            ? "Escolha acima os dias da semana em que este turno tem aula."
            : "Adicione um bloco para definir quantas aulas acontecem antes do primeiro intervalo."
        }
        acao={blocos.length === 0 ? botaoAdicionar : undefined}
      />
    );
  }

  return (
    <div className={estilos.envoltorio}>
      <div className={estilos.rolagem}>
        <table className={estilos.grade}>
          <caption className="apenas-leitor">Aulas do turno por dia da semana</caption>
          <thead>
            <tr>
              <th scope="col" className={estilos.colunaAula}>
                <span className="apenas-leitor">Aula</span>
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
            {blocos.map((bloco, indice) => (
              <Fragment key={indice}>
                {indice > 0 && (
                  <tr>
                    <td colSpan={dias.length + 2} className={estilos.intervalo}>
                      Intervalo
                    </td>
                  </tr>
                )}
                {bloco.aulas.map((aula, i) => (
                  <tr key={aula.posicao} className={i === 0 ? estilos.inicioBloco : undefined}>
                    <th scope="row" className={estilos.colunaAula}>
                      <span className={estilos.numeroAula}>{rotuloAula(aula.posicao)}</span>
                      <span className={estilos.horas}>
                        {aula.inicio && aula.fim ? `${aula.inicio} – ${aula.fim}` : "Horário a definir"}
                      </span>
                    </th>
                    {dias.map((dia) => (
                      <td key={dia}>
                        <span className={estilos.vaga} />
                      </td>
                    ))}
                    {i === 0 && (
                      <td rowSpan={bloco.aulas.length} className={estilos.colunaAcao}>
                        <BotaoIcone
                          rotulo={`Remover bloco ${indice + 1}`}
                          icone={<IconeLixeira />}
                          variante="perigo"
                          onClick={() => aoRemoverBloco(indice)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {botaoAdicionar}
    </div>
  );
}
