"use client";

import { useRespostaFormulario } from "@/components/formulario/useRespostaFormulario";
import { VisualizacaoResposta } from "@/components/formulario/VisualizacaoResposta";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { formatarData } from "@/lib/formatacao";
import { formularioEncerrado } from "@/lib/formulario";
import { nomeExibido } from "@/lib/professores";
import type { ProfessorComSituacao } from "@/types";
import estilos from "./PainelPerfilProfessor.module.css";

/** RF 8.7: a resposta do professor ao formulário atual, somente leitura. */
export function AbaFormularioProfessor({ professor }: { professor: ProfessorComSituacao }) {
  const { estado, recarregar } = useRespostaFormulario(professor.id);
  const nome = nomeExibido(professor);

  if (estado.tipo === "carregando") {
    return (
      <div className={estilos.esqueleto} aria-busy="true" aria-label="Carregando resposta do formulário">
        <Esqueleto forma="bloco" altura="72px" />
        <Esqueleto forma="bloco" altura="320px" />
        <Esqueleto forma="bloco" altura="160px" />
      </div>
    );
  }

  if (estado.tipo === "erro") {
    return (
      <ErroCarregamento titulo="Não foi possível carregar a resposta" aoTentarNovamente={recarregar} />
    );
  }

  const { formulario, resposta, disciplinas } = estado.dados;
  const encerrado = formularioEncerrado(formulario);

  if (resposta) {
    return <VisualizacaoResposta formulario={formulario} resposta={resposta} disciplinas={disciplinas} encerrado={encerrado} perfil="administrador" />;
  }

  const vazio =
    formulario.status === "rascunho"
      ? { titulo: "Formulário ainda não publicado", descricao: "Quando o formulário for aberto, a resposta do professor aparecerá aqui." }
      : professor.statusConta === "convidado"
        ? { titulo: "Convite ainda não aceito", descricao: `${nome} precisa criar a conta antes de responder o formulário.` }
        : encerrado
          ? { titulo: "Sem resposta", descricao: `O prazo terminou em ${formatarData(formulario.fim)} e ${nome} não respondeu.` }
          : { titulo: "Resposta pendente", descricao: `${nome} ainda não respondeu o formulário. O prazo vai até ${formatarData(formulario.fim)}.` };

  return (
    <EstadoVazio contorno titulo={vazio.titulo} descricao={vazio.descricao} />
  );
}
