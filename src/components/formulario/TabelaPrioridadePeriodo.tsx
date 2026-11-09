import { Seletor } from "@/components/ui/Seletor";
import { NIVEIS, periodosDisponiveis, rotulosNivel } from "@/lib/formulario";
import { ordemDias, rotulosDia, rotulosTurno } from "@/lib/horario";
import type { ChaveBloco, ChavePeriodo, DiaSemana, EstruturaTurno, NivelInteresse, RespostaFormulario } from "@/types";
import estilos from "./TabelaPrioridadePeriodo.module.css";

type Prioridades = RespostaFormulario["prioridadesPeriodo"];

type TabelaPrioridadePeriodoProps = {
  estruturas: EstruturaTurno[];
  /** Só os dias/turnos com algum bloco selecionado recebem nota (RN-17). */
  disponibilidade: ChaveBloco[];
  valor: Prioridades;
  aoMudar?: (valor: Prioridades) => void;
  somenteLeitura?: boolean;
};

const opcoes = NIVEIS.map((n) => ({ valor: String(n), rotulo: `${n} · ${rotulosNivel[n]}` }));

/** RN-17: nota de 1 a 5 por dia e turno, obrigatória e sem valor pré-preenchido (RN-22, CA-27). */
export function TabelaPrioridadePeriodo({ estruturas, disponibilidade, valor, aoMudar, somenteLeitura = false }: TabelaPrioridadePeriodoProps) {
  const dias = ordemDias.filter((dia) => estruturas.some((e) => e.dias.includes(dia)));
  const disponiveis = periodosDisponiveis(disponibilidade);

  function celula(estrutura: EstruturaTurno, dia: DiaSemana) {
    const chave: ChavePeriodo = `${estrutura.turno}:${dia}`;
    if (!estrutura.dias.includes(dia)) return <span className={estilos.semAula}>Sem aulas</span>;
    if (!disponiveis.has(chave)) {
      return (
        <span className={estilos.semAula} title="Você não selecionou blocos neste dia e turno">
          Indisponível
        </span>
      );
    }
    const nivel = valor[chave];
    if (somenteLeitura) {
      return nivel === undefined ? (
        <span className={estilos.semAula}>Sem nota</span>
      ) : (
        <span className={estilos.leitura}>
          <strong>{nivel}</strong> {rotulosNivel[nivel]}
        </span>
      );
    }
    return (
      <Seletor
        rotulo={`Prioridade: ${rotulosDia[dia].longo}, ${rotulosTurno[estrutura.turno]}`}
        ocultarRotulo
        placeholder="Escolha a nota"
        opcoes={opcoes}
        value={nivel === undefined ? "" : String(nivel)}
        aria-invalid={nivel === undefined || undefined}
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
