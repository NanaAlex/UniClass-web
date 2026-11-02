import { Seletor } from "@/components/ui/Seletor";
import { NIVEIS, NIVEL_PADRAO, periodosDisponiveis, rotulosNivel } from "@/lib/formulario";
import { rotulosDia, rotulosTurno } from "@/lib/horario";
import type { ChaveHorario, ChavePeriodo, DiaSemana, EstruturaTurno, NivelInteresse, RespostaFormulario } from "@/types";
import estilos from "./TabelaPrioridadePeriodo.module.css";

type Prioridades = RespostaFormulario["prioridadesPeriodo"];

type TabelaPrioridadePeriodoProps = {
  estruturas: EstruturaTurno[];
  /** Só os períodos com algum horário disponível recebem prioridade. */
  disponibilidade: ChaveHorario[];
  valor: Prioridades;
  aoMudar?: (valor: Prioridades) => void;
  somenteLeitura?: boolean;
};

const ordemDias: DiaSemana[] = ["seg", "ter", "qua", "qui", "sex", "sab"];
const opcoes = NIVEIS.map((n) => ({ valor: String(n), rotulo: `${n} · ${rotulosNivel[n]}` }));

/** RF 2.2: prioridade de 1 a 5 por turno e dia — uma faixa da marca para cada turno. */
export function TabelaPrioridadePeriodo({
  estruturas,
  disponibilidade,
  valor,
  aoMudar,
  somenteLeitura = false,
}: TabelaPrioridadePeriodoProps) {
  const dias = ordemDias.filter((dia) => estruturas.some((e) => e.dias.includes(dia)));
  const disponiveis = periodosDisponiveis(disponibilidade);

  function celula(estrutura: EstruturaTurno, dia: DiaSemana) {
    const chave: ChavePeriodo = `${estrutura.turno}:${dia}`;
    if (!estrutura.dias.includes(dia)) return <span className={estilos.semAula}>Sem aulas</span>;
    if (!disponiveis.has(chave)) {
      return (
        <span className={estilos.semAula} title="Você não marcou horários neste período">
          Indisponível
        </span>
      );
    }
    const nivel = valor[chave] ?? NIVEL_PADRAO;
    if (somenteLeitura) {
      return (
        <span className={estilos.leitura}>
          <strong>{nivel}</strong> {rotulosNivel[nivel]}
        </span>
      );
    }
    return (
      <Seletor
        rotulo={`Prioridade: ${rotulosDia[dia].longo}, ${rotulosTurno[estrutura.turno]}`}
        ocultarRotulo
        opcoes={opcoes}
        value={String(nivel)}
        onChange={(e) => aoMudar?.({ ...valor, [chave]: Number(e.target.value) as NivelInteresse })}
      />
    );
  }

  return (
    <ul className={estilos.lista}>
      {estruturas.map((estrutura) => (
        <li key={estrutura.turno} className={estilos.turno}>
          <h4 className={estilos.nomeTurno} id={`prioridade-${estrutura.turno}`}>
            {rotulosTurno[estrutura.turno]}
          </h4>
          <div className={estilos.dias} role="group" aria-labelledby={`prioridade-${estrutura.turno}`}>
            {dias.map((dia) => (
              <div key={dia} className={estilos.dia}>
                <span className={estilos.rotuloDia} aria-hidden={!somenteLeitura || undefined}>
                  {rotulosDia[dia].longo}
                </span>
                {celula(estrutura, dia)}
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
