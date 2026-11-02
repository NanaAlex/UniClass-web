import { Dica } from "@/components/ui/Dica";
import { IconeCadeado, IconeCadeadoAberto, IconeCheck } from "@/components/ui/Icones";
import { corDaDisciplina } from "@/lib/horario";
import type { Aula } from "@/types";
import estilos from "./CelulaAula.module.css";

export type ModoGrade = "visualizar" | "editar" | "selecionar";
export type InfoSecundaria = "turma" | "professor";

type CelulaAulaProps = {
  aula?: Aula;
  modo: ModoGrade;
  /** "Segunda, 1ª aula" — usado nos rótulos acessíveis. */
  contexto: string;
  infoSecundaria: InfoSecundaria;
  selecionada: boolean;
  /** Editar: alguma aula está escolhida e esta célula pode ser o destino. */
  haSelecao?: boolean;
  /** Aula com pedido de alteração ainda não lido. */
  comPedido?: boolean;
  /** Visualizar: mostra o cadeado das aulas bloqueadas (só para o administrador). */
  mostrarBloqueio?: boolean;
  aoSelecionar?: (aula: Aula) => void;
  aoAlternarBloqueio?: (aula: Aula) => void;
  /** Editar: escolher a aula a mover ou o horário de destino (RF 3.3). */
  aoEscolher?: () => void;
};

export function CelulaAula({
  aula,
  modo,
  contexto,
  infoSecundaria,
  selecionada,
  haSelecao = false,
  comPedido = false,
  mostrarBloqueio = false,
  aoSelecionar,
  aoAlternarBloqueio,
  aoEscolher,
}: CelulaAulaProps) {
  const editando = modo === "editar" && Boolean(aoEscolher);

  if (!aula) {
    if (editando && haSelecao) {
      return (
        <button type="button" className={`${estilos.livre} ${estilos.destino}`} onClick={aoEscolher}>
          <span className="apenas-leitor">Mover para {contexto}: </span>Mover para cá
        </button>
      );
    }
    return (
      <div className={estilos.livre}>
        <span className="apenas-leitor">{contexto}: </span>Livre
      </div>
    );
  }

  const secundaria =
    infoSecundaria === "professor"
      ? (aula.professor?.nome ?? "Sem professor")
      : `${aula.turma.nome} · ${aula.turma.semestre}º sem.`;

  const conteudo = (
    <>
      <span className={estilos.nome}>{aula.disciplina.nome}</span>
      <span className={estilos.secundaria}>{secundaria}</span>
    </>
  );

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
        data-cor-disciplina={corDaDisciplina(aula.disciplina)}
        aria-pressed={selecionada}
        aria-label={`${aula.disciplina.nome}, ${secundaria} — ${contexto}`}
        onClick={() => aoSelecionar?.(aula)}
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

  const bloqueada = aula.bloqueada;
  const rotuloMover = selecionada
    ? `${aula.disciplina.nome} escolhida — clique de novo para cancelar`
    : `${haSelecao ? "Trocar com" : "Mover"} ${aula.disciplina.nome} — ${contexto}`;

  return (
    <div
      className={[
        estilos.aula,
        modo === "editar" && bloqueada && estilos.bloqueada,
        selecionada && estilos.escolhida,
      ]
        .filter(Boolean)
        .join(" ")}
      data-cor-disciplina={corDaDisciplina(aula.disciplina)}
    >
      {editando && !bloqueada ? (
        <button type="button" className={estilos.mover} aria-pressed={selecionada} aria-label={rotuloMover} onClick={aoEscolher}>
          {conteudo}
        </button>
      ) : (
        conteudo
      )}
      {marcaPedido}
      {modo === "visualizar" && mostrarBloqueio && bloqueada && (
        <span className={estilos.indicadorBloqueio} title="Bloqueada: mantida na próxima geração">
          <IconeCadeado aria-hidden="true" />
          <span className="apenas-leitor">Bloqueada para a próxima geração</span>
        </span>
      )}
      {modo === "editar" && (
        <span className={estilos.acaoBloqueio}>
          <Dica
            texto={bloqueada ? "Bloqueada: será mantida na próxima geração" : "Bloquear para manter na próxima geração"}
          >
            {(idDica) => (
              <button
                type="button"
                className={estilos.cadeado}
                aria-pressed={bloqueada}
                aria-label={`${bloqueada ? "Desbloquear" : "Bloquear"} ${aula.disciplina.nome} — ${contexto}`}
                aria-describedby={idDica}
                onClick={() => aoAlternarBloqueio?.(aula)}
              >
                {bloqueada ? <IconeCadeado /> : <IconeCadeadoAberto />}
              </button>
            )}
          </Dica>
        </span>
      )}
    </div>
  );
}
