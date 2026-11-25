import { Chip, GrupoChips } from "@/components/ui/Chip";

type FiltroSemestreProps = {
  /** Semestres marcados. Lista vazia = todos. */
  selecionados: number[];
  aoMudar: (selecionados: number[]) => void;
  /** Permite marcar vários semestres ao mesmo tempo. */
  multiplo?: boolean;
  quantidade?: number;
  rotulo?: string;
  opcaoTodos?: boolean;
  contadores?: Partial<Record<number, number>>;
  desabilitado?: boolean;
};

export function FiltroSemestre({
  selecionados,
  aoMudar,
  multiplo = false,
  quantidade = 8,
  rotulo = "Filtrar por semestre",
  opcaoTodos = true,
  contadores,
  desabilitado = false,
}: FiltroSemestreProps) {
  const semestres = Array.from({ length: quantidade }, (_, i) => i + 1);

  function alternar(semestre: number) {
    const marcado = selecionados.includes(semestre);
    if (!multiplo) return aoMudar(marcado && opcaoTodos ? [] : [semestre]);
    aoMudar(marcado ? selecionados.filter((s) => s !== semestre) : [...selecionados, semestre].sort((a, b) => a - b));
  }

  return (
    <GrupoChips rotulo={rotulo}>
      {opcaoTodos && (
        <Chip selecionado={selecionados.length === 0} disabled={desabilitado} onClick={() => aoMudar([])}>
          Todos
        </Chip>
      )}
      {semestres.map((semestre) => (
        <Chip
          key={semestre}
          selecionado={selecionados.includes(semestre)}
          contador={contadores?.[semestre]}
          aria-label={`${semestre}º semestre${contadores?.[semestre] !== undefined ? ` (${contadores[semestre]})` : ""}`}
          disabled={desabilitado}
          onClick={() => alternar(semestre)}
        >
          {semestre}º
        </Chip>
      ))}
    </GrupoChips>
  );
}
