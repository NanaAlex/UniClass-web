import { Dica } from "@/components/ui/Dica";
import { IconeCadeado, IconeCadeadoAberto, IconeCheck } from "@/components/ui/Icones";
import type { Nomes } from "@/lib/gestaoHorario";
import { corDaDisciplina } from "@/lib/horario";
import type { BlocoGrade } from "@/types";
import estilos from "./CelulaBloco.module.css";

export type ModoGrade = "visualizar" | "editar" | "selecionar";
export type InfoSecundaria = "turma" | "professor";
/** existente: trava registrada no período · pendente: criada nesta edição, ainda não confirmada. */
export type SituacaoTrava = "existente" | "pendente" | null;

type CelulaBlocoProps = {
  bloco: BlocoGrade;
  modo: ModoGrade;
  /** "Segunda, Bloco 1 (aulas 1–2)" — usado nos rótulos acessíveis. */
  contexto: string;
  nomes: Nomes;
  infoSecundaria: InfoSecundaria;
  trava: SituacaoTrava;
  selecionada: boolean;
  /** Editar: há um bloco escolhido e esta célula pode ser o destino da troca. */
  haSelecao: boolean;
  comPedido: boolean;
  /** Editar: escolher o bloco a trocar ou o destino. Selecionar: escolher o bloco do pedido. */
  aoEscolher?: () => void;
  /** Editar: travar a posição. Não existe a ação inversa (seção 8 da especificação). */
  aoTravar?: () => void;
};

/** Um bloco inteiro (K aulas consecutivas): nunca se edita uma aula isolada (RN-57, RN-58). */
export function CelulaBloco({
  bloco,
  modo,
  contexto,
  nomes,
  infoSecundaria,
  trava,
  selecionada,
  haSelecao,
  comPedido,
  aoEscolher,
  aoTravar,
}: CelulaBlocoProps) {
  const disciplina = bloco.disciplinaId ? nomes.disciplina(bloco.disciplinaId) : undefined;
  const editando = modo === "editar";
  const travada = trava !== null;
  const textoTrava = trava === "pendente" ? "Trava a confirmar" : "Travada para a próxima geração";

  const botaoTravar = editando && !travada && aoTravar && (
    <span className={estilos.acaoBloqueio}>
      <Dica texto="Travar esta posição na próxima geração">
        {(idDica) => (
          <button
            type="button"
            className={estilos.cadeado}
            aria-label={`Travar ${disciplina?.nome ?? "vaga"} — ${contexto}`}
            aria-describedby={idDica}
            onClick={aoTravar}
          >
            <IconeCadeadoAberto />
          </button>
        )}
      </Dica>
    </span>
  );

  const indicadorTrava = travada && (
    <span className={estilos.indicadorBloqueio} title={textoTrava}>
      <IconeCadeado aria-hidden="true" />
      <span className="apenas-leitor">{textoTrava}</span>
    </span>
  );

  if (!bloco.disciplinaId) {
    const classes = [estilos.livre, trava === "existente" && estilos.travada, trava === "pendente" && estilos.pendente].filter(Boolean).join(" ");
    if (editando && haSelecao && !travada) {
      return (
        <button type="button" className={`${estilos.livre} ${estilos.destino}`} onClick={aoEscolher}>
          <span className="apenas-leitor">Trocar para {contexto}: </span>Trocar para cá
        </button>
      );
    }
    return (
      <div className={classes}>
        <span className={estilos.livreConteudo}>
          <span>
            <span className="apenas-leitor">{contexto}: </span>
            {travada ? <span className={estilos.rotuloTrava}><IconeCadeado aria-hidden="true" /> Vaga travada</span> : "Vago"}
          </span>
          {botaoTravar}
        </span>
      </div>
    );
  }

  const nome = disciplina?.nome ?? bloco.disciplinaId;
  const secundaria =
    infoSecundaria === "professor"
      ? bloco.professorId ? nomes.professor(bloco.professorId) : "Sem professor"
      : bloco.turmaId ? nomes.turma(bloco.turmaId) : "";
  const conteudo = (
    <>
      <span className={estilos.nome}>{nome}</span>
      <span className={estilos.secundaria}>{secundaria}</span>
    </>
  );
  const cor = corDaDisciplina(disciplina ?? { id: bloco.disciplinaId });

  const marcaPedido = comPedido && (
    <span className={estilos.pedido} title="Pedido de alteração não lido">
      <span className="apenas-leitor">Com pedido de alteração não lido</span>
    </span>
  );

  if (modo === "selecionar") {
    return (
      <button
        type="button"
        className={`${estilos.aula} ${estilos.selecionavel}`}
        data-cor-disciplina={cor}
        aria-pressed={selecionada}
        aria-label={`${nome}, ${secundaria} — ${contexto}`}
        onClick={aoEscolher}
      >
        {conteudo}
        {selecionada && (
          <span className={estilos.marcaSelecao} aria-hidden="true">
            <IconeCheck />
          </span>
        )}
      </button>
    );
  }

  const rotuloEscolha = selecionada
    ? `${nome} escolhido — clique de novo para cancelar`
    : `${haSelecao ? "Trocar com" : "Escolher para trocar:"} ${nome} — ${contexto}`;

  return (
    <div
      className={[
        estilos.aula,
        trava === "existente" && estilos.bloqueada,
        trava === "pendente" && estilos.pendente,
        selecionada && estilos.escolhida,
      ]
        .filter(Boolean)
        .join(" ")}
      data-cor-disciplina={cor}
    >
      {editando && !travada && aoEscolher ? (
        <button type="button" className={estilos.mover} aria-pressed={selecionada} aria-label={rotuloEscolha} onClick={aoEscolher}>
          {conteudo}
        </button>
      ) : (
        conteudo
      )}
      {marcaPedido}
      {indicadorTrava}
      {botaoTravar}
    </div>
  );
}
