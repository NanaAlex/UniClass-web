import Link from "next/link";
import { AvatarProfessor } from "@/components/professores/AvatarProfessor";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeChevronDireita } from "@/components/ui/Icones";
import { formatarDataHora } from "@/lib/formatacao";
import { hrefPerfilProfessor, nomeExibido } from "@/lib/professores";
import type { ProfessorComSituacao } from "@/types";
// Mesmo visual da listagem de professores
import estilos from "@/components/professores/ListaProfessores.module.css";

/** RF 2.10: professor e data da resposta. A linha leva à resposta no perfil (RF 8.7). */
export function ItemRespostaFormulario({ professor }: { professor: ProfessorComSituacao }) {
  const enviadaEm = professor.formularioRespondidoEm;

  return (
    <li>
      <Link href={hrefPerfilProfessor(professor.id, "formulario", "formulario")} className={estilos.item}>
        <AvatarProfessor professor={professor} />

        <span className={estilos.identificacao}>
          <span className={estilos.nome}>{nomeExibido(professor)}</span>
          <span className={estilos.meta}>
            <span>{professor.email}</span>
          </span>
        </span>

        <span className={estilos.etiquetas}>
          {enviadaEm ? (
            <span className={estilos.meta}>
              Respondeu em&nbsp;<time dateTime={enviadaEm}>{formatarDataHora(enviadaEm)}</time>
            </span>
          ) : (
            <Etiqueta variante="aviso">Resposta pendente</Etiqueta>
          )}
        </span>

        <IconeChevronDireita className={estilos.seta} />
      </Link>
    </li>
  );
}
