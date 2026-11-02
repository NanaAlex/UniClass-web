import { Esqueleto } from "@/components/ui/Esqueleto";
import type { ProfessorComSituacao } from "@/types";
import { ItemProfessor } from "./ItemProfessor";
import estilos from "./ListaProfessores.module.css";

type ListaProfessoresProps = {
  professores: ProfessorComSituacao[] | null;
};

/** RF 8.2. `null` = carregando. A lista vazia é tratada por quem usa (vazio x sem resultado). */
export function ListaProfessores({ professores }: ListaProfessoresProps) {
  if (!professores) {
    return (
      <ul className={estilos.lista} aria-busy="true" aria-label="Carregando professores">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n} className={`${estilos.item} ${estilos.esqueleto}`}>
            <Esqueleto forma="circulo" largura="44px" altura="44px" />
            <span className={estilos.identificacao}>
              <Esqueleto largura="40%" altura="1rem" />
              <Esqueleto largura="60%" />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={estilos.lista} aria-label="Professores">
      {professores.map((professor) => (
        <ItemProfessor key={professor.id} professor={professor} />
      ))}
    </ul>
  );
}
