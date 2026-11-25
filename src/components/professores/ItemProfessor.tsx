import Link from "next/link";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { IconeChevronDireita } from "@/components/ui/Icones";
import { formatarData } from "@/lib/formatacao";
import { etiquetasConta, hrefPerfilProfessor, nomeExibido, respostaPendente } from "@/lib/professores";
import type { ProfessorComSituacao } from "@/types";
import { AvatarProfessor } from "./AvatarProfessor";
import estilos from "./ListaProfessores.module.css";

/** Uma linha da listagem: quem é e o que está pendente. A linha inteira leva ao perfil. */
export function ItemProfessor({ professor }: { professor: ProfessorComSituacao }) {
  const { statusConta, formularioRespondidoEm, pedidosAbertos } = professor;
  const conta = etiquetasConta[statusConta];

  return (
    <li>
      <Link href={hrefPerfilProfessor(professor.id)} className={estilos.item}>
        <AvatarProfessor professor={professor} />

        <span className={estilos.identificacao}>
          <span className={estilos.nome}>{nomeExibido(professor)}</span>
          <span className={estilos.meta}>
            {professor.nome && <span>{professor.email}</span>}
            {formularioRespondidoEm && <span>Formulário respondido em {formatarData(formularioRespondidoEm)}</span>}
          </span>
        </span>

        <span className={estilos.etiquetas}>
          {statusConta !== "ativa" && <Etiqueta variante={conta.variante}>{conta.rotulo}</Etiqueta>}
          {respostaPendente(professor) && <Etiqueta variante="aviso">Resposta pendente</Etiqueta>}
          {pedidosAbertos.formulario > 0 && (
            <Etiqueta variante="perigo" ponto>
              Pediu alteração de formulário
            </Etiqueta>
          )}
          {pedidosAbertos.horario > 0 && (
            <Etiqueta variante="perigo" ponto>
              Pediu alteração de horário
            </Etiqueta>
          )}
        </span>

        <IconeChevronDireita className={estilos.seta} />
      </Link>
    </li>
  );
}
