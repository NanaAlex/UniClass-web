import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeLixeira } from "@/components/ui/Icones";
import { corDaDisciplina, rotulosTurno } from "@/lib/horario";
import type { Disciplina } from "@/types";
import estilos from "./TabelaDisciplinas.module.css";

type TabelaDisciplinasProps = {
  disciplinas: Disciplina[];
  aoRemover: (disciplina: Disciplina) => void;
};

/** RF 7.7: disciplinas cadastradas, com exclusão. */
export function TabelaDisciplinas({ disciplinas, aoRemover }: TabelaDisciplinasProps) {
  return (
    <div className={estilos.rolagem}>
      <table className={estilos.tabela}>
        <caption className="apenas-leitor">Disciplinas cadastradas</caption>
        <thead>
          <tr>
            <th scope="col">Disciplina</th>
            <th scope="col">Semestre</th>
            <th scope="col" className={estilos.numero}>Aulas/semana</th>
            <th scope="col" className={estilos.numero}>Professores</th>
            <th scope="col">Turno</th>
            <th scope="col" className={estilos.acao}>
              <span className="apenas-leitor">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {disciplinas.map((disciplina) => (
            <tr key={disciplina.id}>
              <th scope="row" className={estilos.nome}>
                <span className={estilos.cor} data-cor-disciplina={corDaDisciplina(disciplina)} aria-hidden="true" />
                {disciplina.nome}
              </th>
              <td>{disciplina.semestre}º</td>
              <td className={estilos.numero}>{disciplina.aulasPorSemana}</td>
              <td className={estilos.numero}>{disciplina.quantidadeProfessores}</td>
              <td>
                <Etiqueta>{rotulosTurno[disciplina.turno]}</Etiqueta>
              </td>
              <td className={estilos.acao}>
                <BotaoIcone rotulo={`Excluir ${disciplina.nome}`} icone={<IconeLixeira />} variante="perigo" onClick={() => aoRemover(disciplina)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
