"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { ListaSolicitacoes } from "@/components/solicitacoes/ListaSolicitacoes";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { rotuloTurma } from "@/lib/horario";
import { criarSolicitacao } from "@/services/solicitacoes";
import type { Aula, UsuarioLogado } from "@/types";
import { FormularioSolicitacaoHorario } from "./FormularioSolicitacaoHorario";
import { QuadroHorarioProfessor } from "./QuadroHorarioProfessor";
import { useHorarioProfessor } from "./useHorarioProfessor";
import estilos from "./PainelHorarioProfessor.module.css";

/** Aba Horário do professor: grade, pedido de alteração (RF 3.4) e histórico dos pedidos (RF 9.1). */
export function PainelHorarioProfessor({ usuario }: { usuario: UsuarioLogado }) {
  const { mostrarAviso } = useAvisos();
  const { dados, falhou, recarregar, adicionarSolicitacao } = useHorarioProfessor(usuario.id);
  const [selecionando, setSelecionando] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState<Aula | null>(null);

  function cancelar() {
    setSelecionando(false);
    setAulaSelecionada(null);
  }

  async function enviar(descricao: string) {
    if (!aulaSelecionada) return;
    const { dia, posicao, disciplina, turma } = aulaSelecionada;
    const nova = await criarSolicitacao({
      tipo: "horario",
      professor: { id: usuario.id, nome: usuario.nome },
      descricao,
      aula: { dia, posicao, disciplina: disciplina.nome, turma: rotuloTurma(turma) },
    });
    adicionarSolicitacao(nova);
    cancelar();
    mostrarAviso({
      tipo: "sucesso",
      titulo: "Solicitação enviada",
      descricao: "A coordenação verá seu pedido e ajustará o horário se for possível.",
    });
  }

  if (falhou) {
    return (
      <ErroCarregamento titulo="Não foi possível carregar o horário" aoTentarNovamente={recarregar} />
    );
  }

  return (
    <>
      {!dados ? (
        <div className={estilos.esqueleto} aria-busy="true" aria-label="Carregando horário">
          <Esqueleto largura="40%" altura="1.5rem" />
          <Esqueleto largura="180px" />
          <Esqueleto forma="bloco" altura="360px" />
        </div>
      ) : dados.horario.aulas.length === 0 ? (
        <EstadoVazio
          contorno
          titulo="Horário indisponível"
          descricao="A coordenação ainda não publicou um horário com as suas aulas. Assim que ele for liberado, você poderá consultá-lo aqui."
        />
      ) : (
        <QuadroHorarioProfessor
          nomeProfessor={usuario.nome}
          horario={dados.horario}
          estruturas={dados.estruturas}
          selecionando={selecionando}
          aulaSelecionada={aulaSelecionada}
          aoIniciarSelecao={() => setSelecionando(true)}
          aoCancelar={cancelar}
          aoSelecionar={setAulaSelecionada}
        >
          <FormularioSolicitacaoHorario aula={aulaSelecionada} aoCancelar={cancelar} aoEnviar={enviar} />
        </QuadroHorarioProfessor>
      )}

      <section className={estilos.secao} aria-labelledby="titulo-solicitacoes-horario">
        <CabecalhoSecao
          id="titulo-solicitacoes-horario"
          titulo="Suas solicitações de horário"
          descricao="Pedidos enviados à coordenação. Eles não precisam de aprovação: a coordenação lê e ajusta o horário quando possível."
        />
        <ListaSolicitacoes
          solicitacoes={dados?.solicitacoes ?? []}
          perfil="professor"
          carregando={!dados}
          mensagemVazia="Você ainda não pediu alterações no horário."
        />
      </section>
    </>
  );
}
