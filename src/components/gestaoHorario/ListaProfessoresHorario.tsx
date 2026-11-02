import Link from "next/link";
import { AvatarProfessor } from "@/components/professores/AvatarProfessor";
import estilosLista from "@/components/professores/ListaProfessores.module.css";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeChevronDireita } from "@/components/ui/Icones";
import type { ProfessorNoHorario } from "@/lib/gestaoHorario";
import { hrefPerfilProfessor } from "@/lib/professores";
import estilos from "./GestaoHorario.module.css";

/** Horário por professor: cada linha abre a aba Horário do perfil (RF 8.8), com volta para cá. */
export function ListaProfessoresHorario({ professores }: { professores: ProfessorNoHorario[] }) {
  if (professores.length === 0) {
    return (
      <EstadoVazio contorno titulo="Nenhum professor alocado" descricao="O horário atual ainda não tem aulas com professor." />
    );
  }

  return (
    <ul className={estilosLista.lista} aria-label="Professores no horário">
      {professores.map(({ professor, aulas, turmas }) => (
        <li key={professor.id}>
          <Link href={hrefPerfilProfessor(professor.id, "horario", "horarios")} className={estilosLista.item}>
            <AvatarProfessor professor={{ ...professor, email: "" }} />
            <span className={estilosLista.identificacao}>
              <span className={estilosLista.nome}>{professor.nome}</span>
              <span className={estilosLista.meta}>
                <span>{aulas === 1 ? "1 aula" : `${aulas} aulas`} por semana</span>
                <span>{turmas.join(", ")}</span>
              </span>
            </span>
            <span className={estilos.acaoLinha}>Ver horário</span>
            <IconeChevronDireita className={estilosLista.seta} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
