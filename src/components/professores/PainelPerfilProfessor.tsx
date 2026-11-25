"use client";

import { useState } from "react";
import { Abas } from "@/components/ui/Abas";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { destinosVoltarPerfil, hrefPerfilProfessor, type AbaPerfilProfessor, type OrigemPerfilProfessor } from "@/lib/professores";
import { aguardandoAdministrador } from "@/lib/solicitacao";
import { AbaFormularioProfessor } from "./AbaFormularioProfessor";
import { AbaHorarioProfessor } from "./AbaHorarioProfessor";
import { AbaSolicitacoesProfessor } from "./AbaSolicitacoesProfessor";
import { CabecalhoPerfilProfessor } from "./CabecalhoPerfilProfessor";
import { usePerfilProfessor } from "./usePerfilProfessor";
import estilos from "./PainelPerfilProfessor.module.css";

const rotulosAba: Record<AbaPerfilProfessor, string> = {
  formulario: "Formulário",
  horario: "Horário",
  solicitacoes: "Solicitações",
};

type PainelPerfilProfessorProps = {
  professorId: string;
  abaInicial: AbaPerfilProfessor;
  origem: OrigemPerfilProfessor;
};

/** Perfil do professor para o administrador (RF 8.6–8.10). */
export function PainelPerfilProfessor({ professorId, abaInicial, origem }: PainelPerfilProfessorProps) {
  const { estado, recarregar, atualizarProfessor, atualizarSolicitacao } = usePerfilProfessor(professorId);
  const [aba, setAba] = useState<AbaPerfilProfessor>(abaInicial);
  const voltar = destinosVoltarPerfil[origem];

  function mudarAba(valor: string) {
    setAba(valor as AbaPerfilProfessor);
    // A aba fica na URL para o link e o recarregamento voltarem ao mesmo lugar (mantendo a origem)
    window.history.replaceState(null, "", hrefPerfilProfessor(professorId, valor as AbaPerfilProfessor, origem));
  }

  if (estado.tipo === "carregando") {
    return (
      <div className={estilos.esqueleto} aria-busy="true" aria-label="Carregando professor">
        <Esqueleto largura="120px" altura="2rem" />
        <Esqueleto forma="bloco" altura="200px" />
        <Esqueleto largura="360px" altura="2.5rem" />
        <Esqueleto forma="bloco" altura="320px" />
      </div>
    );
  }

  if (estado.tipo === "nao_encontrado") {
    return (
      <EstadoVazio
        contorno
        titulo="Professor não encontrado"
        descricao="O link pode estar desatualizado ou o professor não faz mais parte do curso."
        acao={<LinkBotao href={voltar.href}>Voltar para {voltar.rotulo}</LinkBotao>}
      />
    );
  }

  if (estado.tipo === "erro") {
    return (
      <ErroCarregamento titulo="Não foi possível carregar o professor" aoTentarNovamente={recarregar} />
    );
  }

  const { professor, solicitacoes } = estado;
  const pendentes = solicitacoes.filter(aguardandoAdministrador).length;

  return (
    <div className={estilos.painel}>
      <CabecalhoPerfilProfessor professor={professor} aoAtualizar={atualizarProfessor} voltar={voltar} />

      <Abas
        rotuloAcessivel="Informações do professor"
        valor={aba}
        aoMudar={mudarAba}
        abas={[
          { valor: "formulario", rotulo: rotulosAba.formulario },
          { valor: "horario", rotulo: rotulosAba.horario },
          // Contador = pedidos aguardando a coordenação (o ponto vermelho do protótipo)
          { valor: "solicitacoes", rotulo: rotulosAba.solicitacoes, contador: pendentes || undefined },
        ]}
      />

      <div role="tabpanel" aria-label={rotulosAba[aba]} className={estilos.conteudo}>
        {aba === "formulario" && <AbaFormularioProfessor professor={professor} />}
        {aba === "horario" && <AbaHorarioProfessor professor={professor} />}
        {aba === "solicitacoes" && (
          <AbaSolicitacoesProfessor
            solicitacoes={solicitacoes}
            aoAtualizar={atualizarSolicitacao}
            aoVerFormulario={() => mudarAba("formulario")}
          />
        )}
      </div>
    </div>
  );
}
