import { Seletor } from "@/components/ui/Seletor";
import { rotulosSituacaoFiltro, type FiltrosHorario as Filtros, type SituacaoFiltro } from "@/lib/gestaoHorario";
import { rotulosTurno } from "@/lib/horario";
import type { Turma } from "@/types";
import estilos from "./GestaoHorario.module.css";

type FiltrosHorarioProps = {
  turmas: Turma[];
  filtros: Filtros;
  aoMudar: (filtros: Filtros) => void;
};

const unicos = <T,>(valores: T[]) => valores.filter((valor, i) => valores.indexOf(valor) === i);

/** RF 3.11: filtra na hora, sem botão "Buscar". */
export function FiltrosHorario({ turmas, filtros, aoMudar }: FiltrosHorarioProps) {
  const semestres = unicos(turmas.map((t) => t.semestre)).sort((a, b) => a - b);
  const nomes = unicos(turmas.map((t) => t.nome)).sort();
  const turnos = unicos(turmas.map((t) => t.turno));
  const mudar = (campo: keyof Filtros) => (evento: { target: { value: string } }) =>
    aoMudar({ ...filtros, [campo]: evento.target.value });

  return (
    <div className={estilos.filtros} role="group" aria-label="Filtrar horários">
      <Seletor
        rotulo="Semestre"
        value={filtros.semestre}
        onChange={mudar("semestre")}
        opcoes={[{ valor: "", rotulo: "Todos" }, ...semestres.map((s) => ({ valor: String(s), rotulo: `${s}º semestre` }))]}
      />
      <Seletor
        rotulo="Turma"
        value={filtros.turma}
        onChange={mudar("turma")}
        opcoes={[{ valor: "", rotulo: "Todas" }, ...nomes.map((n) => ({ valor: n, rotulo: `Turma ${n}` }))]}
      />
      <Seletor
        rotulo="Período"
        value={filtros.turno}
        onChange={mudar("turno")}
        opcoes={[{ valor: "", rotulo: "Todos" }, ...turnos.map((t) => ({ valor: t, rotulo: rotulosTurno[t] }))]}
      />
      <Seletor
        rotulo="Situação"
        value={filtros.situacao}
        onChange={mudar("situacao")}
        opcoes={(Object.keys(rotulosSituacaoFiltro) as SituacaoFiltro[]).map((s) => ({ valor: s, rotulo: rotulosSituacaoFiltro[s] }))}
      />
    </div>
  );
}
