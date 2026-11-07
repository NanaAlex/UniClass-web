import { Chip, GrupoChips } from "@/components/ui/Chip";
import { ordemDias } from "@/lib/dadosAcademicos";
import { rotulosDia } from "@/lib/horario";
import type { DiaSemana } from "@/types";
import estilos from "./Dados.module.css";

type FiltroDiasProps = {
  dias: DiaSemana[];
  aoAlternar: (dia: DiaSemana, incluir: boolean) => void;
};

/** RF 7.1: liga e desliga os dias letivos do turno. */
export function FiltroDias({ dias, aoAlternar }: FiltroDiasProps) {
  return (
    <div className={estilos.grupoControle}>
      <span id="rotulo-dias-letivos" className={estilos.rotuloControle}>
        Dias letivos
      </span>
      <GrupoChips idRotulo="rotulo-dias-letivos">
        {ordemDias.map((dia) => {
          const ativo = dias.includes(dia);
          return (
            <Chip
              key={dia}
              selecionado={ativo}
              aria-label={rotulosDia[dia].longo}
              title={ativo ? `Remover ${rotulosDia[dia].longo}` : `Adicionar ${rotulosDia[dia].longo}`}
              onClick={() => aoAlternar(dia, !ativo)}
            >
              {rotulosDia[dia].curto}
            </Chip>
          );
        })}
      </GrupoChips>
    </div>
  );
}
