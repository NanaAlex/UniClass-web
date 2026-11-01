import { IconeCheck } from "@/components/ui/Icones";
import estilos from "./PainelMarca.module.css";

const destaques = [
  "Professores informam disponibilidade e preferências em um só formulário",
  "A grade é gerada respeitando indisponibilidades e aulas bloqueadas",
  "Solicitações de alteração chegam organizadas para a coordenação",
];

// Miniatura decorativa de uma grade de horários (5 dias × 4 aulas)
const celulas = [1, 1, 2, 2, 3, 0, 4, 4, 5, 5, 6, 6, 0, 2, 2, 7, 7, 8, 8, 0];

/** Coluna institucional das telas de autenticação. Some em telas estreitas. */
export function PainelMarca() {
  return (
    <aside className={estilos.painel} aria-label="Sobre o Staggy">
      <div className={estilos.marca}>
        <span className={estilos.monograma} aria-hidden="true">
          S
        </span>
        <span className={estilos.nome}>Staggy</span>
      </div>

      <div className={estilos.conteudo}>
        <h2 className={estilos.titulo}>Grades de horário montadas a partir de quem dá a aula.</h2>
        <ul className={estilos.destaques}>
          {destaques.map((texto) => (
            <li key={texto}>
              <span className={estilos.check} aria-hidden="true">
                <IconeCheck />
              </span>
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <div className={estilos.grade} aria-hidden="true">
        {celulas.map((cor, i) => (
          <span key={i} className={estilos.celula} data-cor-disciplina={cor} />
        ))}
      </div>
    </aside>
  );
}
