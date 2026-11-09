import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeCadeado } from "@/components/ui/Icones";
import { descreverTrava } from "@/lib/edicaoGrade";
import { formatarDataHora } from "@/lib/formatacao";
import { nomesParaTravas, type Nomes } from "@/lib/gestaoHorario";
import type { Trava } from "@/types";
import estilos from "./GradeTurma.module.css";

type ListaTravasProps = {
  id: string;
  titulo: string;
  travas: Trava[];
  nomes: Nomes;
  mensagemVazia: string;
};

/**
 * Travas registradas no período (RN-41 a RN-45). Valem para as próximas gerações até o fim do período
 * (RN-50) e não podem ser removidas nesta versão (seção 8): por isso não há botão de desbloquear.
 */
export function ListaTravas({ id, titulo, travas, nomes, mensagemVazia }: ListaTravasProps) {
  const ordenadas = [...travas].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  const n = nomesParaTravas(nomes);

  return (
    <section className={estilos.secao} aria-labelledby={id}>
      <CabecalhoSecao
        id={id}
        titulo={titulo}
        descricao="Restrições obrigatórias para as próximas gerações deste período. Travas não podem ser removidas nesta versão do sistema."
      />
      {ordenadas.length === 0 ? (
        <EstadoVazio contorno titulo="Nenhuma trava" descricao={mensagemVazia} />
      ) : (
        <ul className={estilos.listaTravas}>
          {ordenadas.map((t) => (
            <li key={t.id}>
              <IconeCadeado aria-hidden="true" />
              <span className={estilos.textoTrava}>{descreverTrava(t, n)}</span>
              <time className={estilos.dataTrava} dateTime={t.criadaEm}>
                {formatarDataHora(t.criadaEm)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
