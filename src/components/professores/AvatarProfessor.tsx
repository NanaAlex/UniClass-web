import { iniciais } from "@/lib/formatacao";
import { nomeExibido } from "@/lib/professores";
import type { Professor } from "@/types";
import estilos from "./AvatarProfessor.module.css";

type AvatarProfessorProps = {
  professor: Pick<Professor, "nome" | "email" | "fotoUrl">;
  tamanho?: "m" | "g";
};

/** Foto do professor ou, sem foto, as iniciais. Decorativo: o nome sempre aparece ao lado. */
export function AvatarProfessor({ professor, tamanho = "m" }: AvatarProfessorProps) {
  return (
    <span className={`${estilos.avatar} ${estilos[tamanho]}`} aria-hidden="true">
      {professor.fotoUrl ? (
        // Foto local (blob) escolhida pelo admin: next/image não otimiza esse tipo de endereço
        // eslint-disable-next-line @next/next/no-img-element
        <img src={professor.fotoUrl} alt="" className={estilos.foto} />
      ) : (
        iniciais(nomeExibido(professor))
      )}
    </span>
  );
}
