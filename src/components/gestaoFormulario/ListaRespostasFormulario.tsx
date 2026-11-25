"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { Abas } from "@/components/ui/Abas";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeCheck } from "@/components/ui/Icones";
import type { ProfessorComSituacao } from "@/types";
import { ItemRespostaFormulario } from "./ItemRespostaFormulario";
import listas from "@/components/professores/ListaProfessores.module.css";
import estilos from "./GestaoFormulario.module.css";

type Filtro = "responderam" | "pendentes";

type ListaRespostasFormularioProps = {
  responderam: ProfessorComSituacao[];
  pendentes: ProfessorComSituacao[];
  encerrado: boolean;
};

/** RF 2.10 (quem respondeu e quando), RF 2.11 e RF 4.6 (quem ainda não respondeu). */
export function ListaRespostasFormulario({ responderam, pendentes, encerrado }: ListaRespostasFormularioProps) {
  const [filtro, setFiltro] = useState<Filtro>("responderam");
  const visiveis = filtro === "responderam" ? responderam : pendentes;

  const legenda =
    filtro === "responderam"
      ? "Mais recentes primeiro. Abra um professor para ver a resposta completa."
      : encerrado
        ? "Professores com conta ativa que não enviaram a resposta dentro do prazo."
        : "Professores com conta ativa que ainda não enviaram. Eles recebem um lembrete diário enquanto o prazo estiver aberto.";

  return (
    <section className={estilos.respostas} aria-labelledby="titulo-respostas">
      <CabecalhoSecao
        id="titulo-respostas"
        titulo="Professores"
        acoes={
          <Abas
            variante="pilula"
            rotuloAcessivel="Filtrar professores por resposta"
            valor={filtro}
            aoMudar={(valor) => setFiltro(valor as Filtro)}
            abas={[
              { valor: "responderam", rotulo: "Responderam", contador: responderam.length },
              { valor: "pendentes", rotulo: "Não responderam", contador: pendentes.length },
            ]}
          />
        }
      />
      <p className={estilos.legenda} aria-live="polite">
        {legenda}
      </p>

      {visiveis.length === 0 ? (
        filtro === "responderam" ? (
          <EstadoVazio
            contorno
            titulo="Nenhuma resposta ainda"
            descricao={
              encerrado
                ? "O formulário foi encerrado sem respostas."
                : "As respostas aparecem aqui assim que os professores enviarem o formulário."
            }
          />
        ) : (
          <EstadoVazio
            contorno
            icone={<IconeCheck />}
            titulo="Todos responderam"
            descricao="Todos os professores com conta ativa enviaram a resposta."
          />
        )
      ) : (
        <ul className={listas.lista} aria-label={filtro === "responderam" ? "Professores que responderam" : "Professores que não responderam"}>
          {visiveis.map((professor) => (
            <ItemRespostaFormulario key={professor.id} professor={professor} />
          ))}
        </ul>
      )}
    </section>
  );
}
