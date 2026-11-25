import { Chip, GrupoChips } from "@/components/ui/Chip";
import { filtrosProfessores, rotulosFiltro, type FiltroProfessores as Filtro } from "@/lib/professores";

type FiltroProfessoresProps = {
  valor: Filtro;
  aoMudar: (filtro: Filtro) => void;
  contadores: Record<Filtro, number>;
  desabilitado?: boolean;
};

/** RF 8.4 e filtros do protótipo: um por vez; clicar no ativo volta para "Todos". */
export function FiltroProfessores({ valor, aoMudar, contadores, desabilitado = false }: FiltroProfessoresProps) {
  return (
    <GrupoChips rotulo="Filtrar professores">
      {filtrosProfessores.map((filtro) => (
        <Chip
          key={filtro}
          selecionado={valor === filtro}
          contador={contadores[filtro]}
          disabled={desabilitado}
          onClick={() => aoMudar(valor === filtro ? "todos" : filtro)}
        >
          {rotulosFiltro[filtro]}
        </Chip>
      ))}
    </GrupoChips>
  );
}
