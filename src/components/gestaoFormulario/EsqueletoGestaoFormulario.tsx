import { ListaProfessores } from "@/components/professores/ListaProfessores";
import { Esqueleto } from "@/components/ui/Esqueleto";
import estilos from "./GestaoFormulario.module.css";

/** Carregamento no formato do resumo + lista de respostas. */
export function EsqueletoGestaoFormulario() {
  return (
    <div className={estilos.painel} aria-busy="true" aria-label="Carregando formulário">
      <div className={estilos.esqueletoResumo}>
        <Esqueleto largura="72px" altura="1.5rem" />
        <Esqueleto largura="40%" altura="1.75rem" />
        <Esqueleto largura="20%" />
        <div className={estilos.esqueletoDetalhes}>
          {[1, 2, 3, 4].map((n) => (
            <Esqueleto key={n} forma="bloco" altura="44px" />
          ))}
        </div>
      </div>
      <Esqueleto largura="280px" altura="40px" />
      <ListaProfessores professores={null} />
    </div>
  );
}
