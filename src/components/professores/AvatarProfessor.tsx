import { ImagemApi } from "@/components/ui/ImagemApi";
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
  const textoIniciais = iniciais(nomeExibido(professor));

  return (
    <span className={`${estilos.avatar} ${estilos[tamanho]}`} aria-hidden="true">
      {professor.fotoUrl ? (
        <ImagemApi src={professor.fotoUrl} alt="" className={estilos.foto} reserva={textoIniciais} />
      ) : (
        textoIniciais
      )}
    </span>
  );
}
