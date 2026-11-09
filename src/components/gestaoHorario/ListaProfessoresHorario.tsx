import Link from "next/link";
import { AvatarProfessor } from "@/components/professores/AvatarProfessor";
import estilosLista from "@/components/professores/ListaProfessores.module.css";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeChevronDireita } from "@/components/ui/Icones";
import { hrefGradeProfessor, type ProfessorNoHorario } from "@/lib/gestaoHorario";
import estilos from "./GestaoHorario.module.css";

/** Visão por professor da execução: cada linha abre a grade do professor com todas as coordenadas (RN-69). */
export function ListaProfessoresHorario({ execucaoId, professores }: { execucaoId: string; professores: ProfessorNoHorario[] }) {
  if (professores.length === 0) {
    return <EstadoVazio contorno titulo="Nenhum professor na grade" descricao="Esta execução não atribuiu aulas a professores." />;
  }

  return (
    <ul className={estilosLista.lista} aria-label="Professores na grade">
      {professores.map(({ professor, blocos, aulas, turmas }) => (
        <li key={professor.id}>
          <Link href={hrefGradeProfessor(execucaoId, professor.id)} className={estilosLista.item}>
            <AvatarProfessor professor={{ ...professor, email: "" }} />
            <span className={estilosLista.identificacao}>
              <span className={estilosLista.nome}>{professor.nome}</span>
              <span className={estilosLista.meta}>
                <span>
                  {aulas} aulas por semana ({blocos === 1 ? "1 bloco" : `${blocos} blocos`})
                </span>
                <span>{turmas.join(", ")}</span>
              </span>
            </span>
            <span className={estilos.acaoLinha}>Ver grade</span>
            <IconeChevronDireita className={estilosLista.seta} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
