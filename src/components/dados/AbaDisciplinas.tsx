"use client";

import { useState } from "react";
import { FiltroSemestre } from "@/components/compartilhados/FiltroSemestre";
import { CabecalhoSecao } from "@/components/layout/CabecalhoSecao";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { adicionarDisciplina, removerDisciplina } from "@/lib/dadosAcademicos";
import type { DadosAcademicos, Disciplina } from "@/types";
import { FormularioDisciplina } from "./FormularioDisciplina";
import { ModalConfirmacao, type PedidoConfirmacao } from "@/components/ui/ModalConfirmacao";
import { TabelaDisciplinas } from "./TabelaDisciplinas";
import estilos from "./Dados.module.css";

type AbaDisciplinasProps = {
  dados: DadosAcademicos;
  atualizar: (transformar: (atuais: DadosAcademicos) => DadosAcademicos) => void;
};

/** RF 7.6–7.8: cadastro, listagem filtrada por semestre e exclusão de disciplinas. */
export function AbaDisciplinas({ dados, atualizar }: AbaDisciplinasProps) {
  const { mostrarAviso } = useAvisos();
  const [filtro, setFiltro] = useState<number[]>([]);
  const [exclusao, setExclusao] = useState<PedidoConfirmacao | null>(null);

  const visiveis = filtro.length ? dados.disciplinas.filter((d) => filtro.includes(d.semestre)) : dados.disciplinas;
  const maiorSemestre = Math.max(1, ...dados.semestres.map((s) => s.numero));
  const contadores: Record<number, number> = {};
  for (const d of dados.disciplinas) contadores[d.semestre] = (contadores[d.semestre] ?? 0) + 1;

  function criar(nova: Omit<Disciplina, "id">) {
    atualizar((atuais) => adicionarDisciplina(atuais, nova));
    // A nova disciplina precisa aparecer na lista, mesmo com outro semestre filtrado
    if (filtro.length && !filtro.includes(nova.semestre)) setFiltro([...filtro, nova.semestre].sort((a, b) => a - b));
    mostrarAviso({ tipo: "sucesso", titulo: "Disciplina criada", descricao: `${nova.nome} · ${nova.semestre}º semestre.` });
  }

  function pedirExclusao(disciplina: Disciplina) {
    setExclusao({
      titulo: `Excluir ${disciplina.nome}?`,
      descricao: "Ela deixa de aparecer no formulário dos professores e nas próximas gerações de horário.",
      rotuloAcao: "Excluir disciplina",
      aoConfirmar: () => {
        atualizar((atuais) => removerDisciplina(atuais, disciplina.id));
        mostrarAviso({ tipo: "sucesso", titulo: "Disciplina excluída", descricao: disciplina.nome });
      },
    });
  }

  return (
    <section className={estilos.cartaoSecao} aria-labelledby="titulo-disciplinas">
      <CabecalhoSecao
        id="titulo-disciplinas"
        titulo="Disciplinas"
        descricao="As disciplinas aparecem no formulário de interesse dos professores e são usadas na geração do horário."
      />

      {dados.semestres.length === 0 ? (
        <Aviso
          tipo="info"
          embutido
          titulo="Cadastre um semestre primeiro"
          descricao="Toda disciplina pertence a um semestre. Crie os semestres na aba Semestres e turmas."
        />
      ) : (
        <FormularioDisciplina semestres={dados.semestres} disciplinas={dados.disciplinas} aoCriar={criar} />
      )}

      <div className={estilos.cabecalhoSecao}>
        <FiltroSemestre multiplo selecionados={filtro} aoMudar={setFiltro} quantidade={maiorSemestre} contadores={contadores} />
        <p className={estilos.descricaoSecao} aria-live="polite">
          {visiveis.length === 1 ? "1 disciplina" : `${visiveis.length} disciplinas`}
        </p>
      </div>

      {visiveis.length > 0 ? (
        <TabelaDisciplinas disciplinas={visiveis} aoRemover={pedirExclusao} />
      ) : (
        <EstadoVazio
          titulo={filtro.length ? "Nenhuma disciplina nesse filtro" : "Nenhuma disciplina cadastrada"}
          descricao={
            filtro.length ? "Os semestres selecionados ainda não têm disciplinas." : "Use o formulário acima para criar a primeira."
          }
          acao={
            filtro.length > 0 && (
              <Botao variante="secundario" onClick={() => setFiltro([])}>
                Mostrar todas
              </Botao>
            )
          }
        />
      )}

      <ModalConfirmacao pedido={exclusao} aoFechar={() => setExclusao(null)} />
    </section>
  );
}
