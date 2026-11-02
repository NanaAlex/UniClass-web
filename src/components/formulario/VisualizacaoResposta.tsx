import { GradeDisponibilidade } from "@/components/compartilhados/GradeDisponibilidade";
import { Aviso } from "@/components/ui/Aviso";
import { Cartao } from "@/components/ui/Cartao";
import { formatarData } from "@/lib/formatacao";
import type { Disciplina, Formulario, RespostaFormulario } from "@/types";
import { ListaInteresseDisciplinas } from "./ListaInteresseDisciplinas";
import { TabelaPrioridadePeriodo } from "./TabelaPrioridadePeriodo";
import estilos from "./AssistenteFormulario.module.css";

type VisualizacaoRespostaProps = {
  formulario: Formulario;
  resposta: RespostaFormulario;
  disciplinas: Disciplina[];
  encerrado: boolean;
  /** professor: a própria resposta (RF 2.14) · administrador: resposta de um professor (RF 8.7) */
  perfil?: "professor" | "administrador";
};

const nada = () => {};

function descricaoAviso(perfil: VisualizacaoRespostaProps["perfil"], encerrado: boolean, edicaoLiberada: boolean) {
  if (perfil === "administrador") {
    if (edicaoLiberada) return "A edição foi liberada. O professor pode alterar a resposta até o fim do prazo.";
    return encerrado ? "O prazo do formulário terminou." : "Para mudar a resposta, o professor precisa pedir a reabertura.";
  }
  return encerrado
    ? "O prazo do formulário terminou. Sua resposta não pode mais ser alterada."
    : "Para alterar alguma informação, volte à página do formulário e solicite a reabertura à coordenação.";
}

/** A resposta enviada, somente leitura (RF 2.18). */
export function VisualizacaoResposta({ formulario, resposta, disciplinas, encerrado, perfil = "professor" }: VisualizacaoRespostaProps) {
  const ehAdmin = perfil === "administrador";

  return (
    <div className={estilos.leitura}>
      <Aviso
        tipo="info"
        embutido
        titulo={`Resposta enviada em ${formatarData(resposta.enviadaEm)}`}
        descricao={descricaoAviso(perfil, encerrado, resposta.edicaoLiberada)}
      />

      <Cartao titulo="Disponibilidade" descricao={ehAdmin ? "Dias e horários em que o professor pode dar aula." : "Dias e horários em que você pode dar aula."}>
        <GradeDisponibilidade estruturas={formulario.estruturas} valor={resposta.disponibilidade} aoMudar={nada} desabilitada />
      </Cartao>

      <Cartao titulo="Prioridade por período" descricao="1 é a menor preferência e 5 a maior.">
        <TabelaPrioridadePeriodo
          estruturas={formulario.estruturas}
          disponibilidade={resposta.disponibilidade}
          valor={resposta.prioridadesPeriodo}
          somenteLeitura
        />
      </Cartao>

      <Cartao titulo="Matérias de interesse" descricao="Ordenadas do maior para o menor interesse.">
        <ListaInteresseDisciplinas disciplinas={disciplinas} valor={resposta.interesses} modo="leitura" />
      </Cartao>
    </div>
  );
}
