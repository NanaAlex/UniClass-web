"use client";

import { useState } from "react";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeMais } from "@/components/ui/Icones";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import {
  MAXIMO_SEMESTRES,
  adicionarSemestre,
  adicionarTurma,
  proximaLetraTurma,
  proximoSemestre,
  removerSemestre,
  removerTurma,
  turmasDoSemestre,
} from "@/lib/dadosAcademicos";
import type { DadosAcademicos, Turma, Turno } from "@/types";
import { CartaoSemestre } from "./CartaoSemestre";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { ModalNovaTurma } from "./ModalNovaTurma";
import estilos from "./Dados.module.css";

type AbaSemestresProps = {
  dados: DadosAcademicos;
  atualizar: (transformar: (atuais: DadosAcademicos) => DadosAcademicos) => void;
};

/** RF 7.4–7.5: semestres do curso e as turmas de cada um. */
export function AbaSemestres({ dados, atualizar }: AbaSemestresProps) {
  const { mostrarAviso } = useAvisos();
  const [semestreNovaTurma, setSemestreNovaTurma] = useState<number | null>(null);
  const [exclusao, setExclusao] = useState<PedidoConfirmacao | null>(null);
  const proximo = proximoSemestre(dados);

  function incluirSemestre() {
    if (proximo === null) return;
    atualizar((atuais) => adicionarSemestre(atuais, proximo));
    mostrarAviso({ tipo: "sucesso", titulo: `${proximo}º semestre criado`, descricao: "Adicione as turmas dele." });
  }

  function criarTurma(turno: Turno) {
    if (semestreNovaTurma === null) return;
    const nome = proximaLetraTurma(dados, semestreNovaTurma);
    atualizar((atuais) => adicionarTurma(atuais, semestreNovaTurma, turno));
    mostrarAviso({ tipo: "sucesso", titulo: `Turma ${nome} criada`, descricao: `${semestreNovaTurma}º semestre.` });
    setSemestreNovaTurma(null);
  }

  function pedirExclusaoSemestre(numero: number) {
    const turmas = turmasDoSemestre(dados, numero).length;
    const disciplinas = dados.disciplinas.filter((d) => d.semestre === numero).length;
    setExclusao({
      titulo: `Excluir o ${numero}º semestre?`,
      descricao:
        turmas + disciplinas > 0
          ? `As ${turmas} turma(s) e ${disciplinas} disciplina(s) dele também serão excluídas.`
          : "Ele ainda não tem turmas nem disciplinas.",
      rotuloAcao: "Excluir semestre",
      aoConfirmar: () => {
        atualizar((atuais) => removerSemestre(atuais, numero));
        mostrarAviso({ tipo: "sucesso", titulo: `${numero}º semestre excluído` });
      },
    });
  }

  function pedirExclusaoTurma(turma: Turma) {
    setExclusao({
      titulo: `Excluir a turma ${turma.nome}?`,
      descricao: `Ela sai do ${turma.semestre}º semestre e das próximas gerações de horário.`,
      rotuloAcao: "Excluir turma",
      aoConfirmar: () => {
        atualizar((atuais) => removerTurma(atuais, turma.id));
        mostrarAviso({ tipo: "sucesso", titulo: `Turma ${turma.nome} excluída`, descricao: `${turma.semestre}º semestre.` });
      },
    });
  }

  const botaoAdicionar = (
    <Botao
      variante="secundario"
      icone={<IconeMais />}
      onClick={incluirSemestre}
      disabled={proximo === null}
      title={proximo === null ? `O curso já tem ${MAXIMO_SEMESTRES} semestres` : undefined}
    >
      Adicionar semestre
    </Botao>
  );

  return (
    <section className={estilos.cartaoSecao} aria-labelledby="titulo-semestres">
      <CabecalhoSecao
        id="titulo-semestres"
        titulo="Semestres e turmas"
        descricao={`Cada semestre pode ter várias turmas, em turnos diferentes. Até ${MAXIMO_SEMESTRES} semestres.`}
        acoes={dados.semestres.length > 0 && botaoAdicionar}
      />

      {dados.semestres.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum semestre cadastrado"
          descricao="Crie o primeiro semestre para começar a cadastrar turmas e disciplinas."
          acao={botaoAdicionar}
        />
      ) : (
        <div className={estilos.gradeSemestres}>
          {dados.semestres.map(({ numero }) => (
            <CartaoSemestre
              key={numero}
              numero={numero}
              turmas={turmasDoSemestre(dados, numero)}
              quantidadeDisciplinas={dados.disciplinas.filter((d) => d.semestre === numero).length}
              aoAdicionarTurma={() => setSemestreNovaTurma(numero)}
              aoRemoverTurma={pedirExclusaoTurma}
              aoRemoverSemestre={() => pedirExclusaoSemestre(numero)}
            />
          ))}
        </div>
      )}

      <ModalNovaTurma
        semestre={semestreNovaTurma}
        nomeSugerido={semestreNovaTurma === null ? "" : proximaLetraTurma(dados, semestreNovaTurma)}
        aoFechar={() => setSemestreNovaTurma(null)}
        aoCriar={criarTurma}
      />
      <ModalConfirmacao pedido={exclusao} aoFechar={() => setExclusao(null)} />
    </section>
  );
}
