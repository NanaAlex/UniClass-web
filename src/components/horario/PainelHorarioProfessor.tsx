"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { ListaSolicitacoes } from "@/components/solicitacoes/ListaSolicitacoes";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { criarSolicitacao } from "@/services/solicitacoes";
import type { BlocoGrade, UsuarioLogado } from "@/types";
import { FormularioSolicitacaoHorario } from "./FormularioSolicitacaoHorario";
import { QuadroHorarioProfessor } from "./QuadroHorarioProfessor";
import { useHorarioProfessor } from "./useHorarioProfessor";
import estilos from "./PainelHorarioProfessor.module.css";

/** Aba Horário do professor: grade publicada, pedido de alteração (RF 3.4) e histórico dos pedidos (RF 9.1). */
export function PainelHorarioProfessor({ usuario }: { usuario: UsuarioLogado }) {
  const { mostrarAviso } = useAvisos();
  const { dados, falhou, recarregar, adicionarSolicitacao } = useHorarioProfessor(usuario.id);
  const [selecionando, setSelecionando] = useState(false);
  const [blocoSelecionado, setBlocoSelecionado] = useState<BlocoGrade | null>(null);

  function cancelar() {
    setSelecionando(false);
    setBlocoSelecionado(null);
  }

  async function enviar(descricao: string) {
    if (!blocoSelecionado || !dados) return;
    const { dia, turno, indice, disciplinaId, turmaId } = blocoSelecionado;
    const nova = await criarSolicitacao({
      tipo: "horario",
      professor: { id: usuario.id, nome: usuario.nome },
      descricao,
      aula: {
        dia,
        turno,
        indice,
        disciplina: dados.nomes.disciplina(disciplinaId ?? "")?.nome ?? "",
        turma: turmaId ? dados.nomes.turma(turmaId) : "",
      },
    });
    adicionarSolicitacao(nova);
    cancelar();
    mostrarAviso({
      tipo: "sucesso",
      titulo: "Solicitação enviada",
      descricao: "A coordenação verá seu pedido. Ajustes entram como travas numa nova geração.",
    });
  }

  if (falhou) return <ErroCarregamento titulo="Não foi possível carregar o horário" aoTentarNovamente={recarregar} />;

  return (
    <>
      {!dados ? (
        <div className={estilos.esqueleto} aria-busy="true" aria-label="Carregando horário">
          <Esqueleto largura="40%" altura="1.5rem" />
          <Esqueleto largura="180px" />
          <Esqueleto forma="bloco" altura="360px" />
        </div>
      ) : !dados.horario.publicadoEm ? (
        <EstadoVazio
          contorno
          titulo="Horário ainda não publicado"
          descricao="A coordenação só publica uma grade com o ótimo comprovado. Assim que ela for publicada, você verá aqui todas as suas aulas, por bloco."
        />
      ) : dados.horario.posicoes.every((b) => !b.disciplinaId) ? (
        <EstadoVazio contorno titulo="Nenhuma aula na grade publicada" descricao="A grade vigente não atribuiu aulas a você neste período." />
      ) : (
        <QuadroHorarioProfessor
          nomeProfessor={usuario.nome}
          posicoes={dados.horario.posicoes}
          aulasPorBloco={dados.horario.aulasPorBloco}
          estruturas={dados.estruturas}
          nomes={dados.nomes}
          situacao={{ rotulo: "Publicado", variante: "sucesso" }}
          publicadoEm={dados.horario.publicadoEm}
          selecionando={selecionando}
          selecionado={blocoSelecionado}
          aoIniciarSelecao={() => setSelecionando(true)}
          aoCancelar={cancelar}
          aoSelecionar={setBlocoSelecionado}
        >
          <FormularioSolicitacaoHorario bloco={blocoSelecionado} nomes={dados.nomes} aulasPorBloco={dados.horario.aulasPorBloco} aoCancelar={cancelar} aoEnviar={enviar} />
        </QuadroHorarioProfessor>
      )}

      <section className={estilos.secao} aria-labelledby="titulo-solicitacoes-horario">
        <CabecalhoSecao
          id="titulo-solicitacoes-horario"
          titulo="Suas solicitações de horário"
          descricao="Pedidos enviados à coordenação. Eles não precisam de aprovação: a coordenação lê e, quando possível, trava o ajuste para a próxima geração."
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
