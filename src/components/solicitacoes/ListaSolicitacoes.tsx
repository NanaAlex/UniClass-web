import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { Esqueleto } from "@/components/ui/Esqueleto";
import type { Solicitacao } from "@/types";
import { ItemSolicitacao, type AcoesSolicitacao, type PerfilLista } from "./ItemSolicitacao";
import estilos from "./ListaSolicitacoes.module.css";

type ListaSolicitacoesProps = AcoesSolicitacao & {
  solicitacoes: Solicitacao[];
  /** administrador: vê quem pediu e pode agir · professor: vê o próprio histórico (RF 9.1, 9.4) */
  perfil: PerfilLista;
  carregando?: boolean;
  /** Id da solicitação com ação em andamento (botão em carregamento). */
  idProcessando?: string;
  mensagemVazia?: string;
  /** Ver `ItemSolicitacao`: falso no perfil de um professor. */
  mostrarProfessor?: boolean;
};

export function ListaSolicitacoes({
  solicitacoes,
  perfil,
  carregando = false,
  idProcessando,
  mensagemVazia,
  mostrarProfessor,
  ...acoes
}: ListaSolicitacoesProps) {
  if (carregando) {
    return (
      <ul className={estilos.lista} aria-busy="true" aria-label="Carregando solicitações">
        {[1, 2, 3].map((n) => (
          <li key={n} className={estilos.item}>
            {(mostrarProfessor ?? perfil === "administrador") && <Esqueleto forma="circulo" />}
            <div className={estilos.corpo}>
              <Esqueleto largura="35%" altura="1rem" />
              <Esqueleto largura="55%" />
              <Esqueleto largura="90%" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <EstadoVazio
        contorno
        titulo="Nenhuma solicitação"
        descricao={
          mensagemVazia ??
          (perfil === "administrador"
            ? "Quando um professor pedir uma alteração, ela aparecerá aqui."
            : "Você ainda não enviou solicitações de alteração.")
        }
      />
    );
  }

  return (
    <ul className={estilos.lista}>
      {solicitacoes.map((solicitacao) => (
        <ItemSolicitacao
          key={solicitacao.id}
          solicitacao={solicitacao}
          perfil={perfil}
          processando={solicitacao.id === idProcessando}
          mostrarProfessor={mostrarProfessor}
          {...acoes}
        />
      ))}
    </ul>
  );
}
