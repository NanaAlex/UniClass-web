import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { hrefExecucao, hrefHorarios } from "@/lib/gestaoHorario";
import estilos from "./GradeTurma.module.css";

type EstadoGradeProps = {
  estado: "carregando" | "pronto" | "nao_encontrada" | "falhou";
  aoTentarNovamente: () => void;
};

/** Carregamento, erro e "não encontrada" das telas de grade (turma e professor). Null quando pronto. */
export function EstadoGrade({ estado, aoTentarNovamente }: EstadoGradeProps) {
  if (estado === "falhou") return <ErroCarregamento titulo="Não foi possível carregar a grade" aoTentarNovamente={aoTentarNovamente} />;
  if (estado === "nao_encontrada") {
    return (
      <EstadoVazio
        contorno
        titulo="Grade não encontrada"
        descricao="A execução ou a grade pedida não existe."
        acao={
          <LinkBotao href={hrefHorarios} variante="secundario">
            Voltar para Horários
          </LinkBotao>
        }
      />
    );
  }
  if (estado === "carregando") {
    return (
      <div className={estilos.painel} aria-busy="true" aria-label="Carregando grade">
        <Esqueleto largura="120px" altura="32px" />
        <Esqueleto largura="40%" altura="2rem" />
        <Esqueleto largura="30%" />
        <Esqueleto forma="bloco" altura="320px" />
      </div>
    );
  }
  return null;
}

/** A execução não tem grade completa e validada (RN-28): não há o que mostrar nem editar. */
export function GradeSemValidacao({ execucaoId }: { execucaoId: string }) {
  return (
    <EstadoVazio
      contorno
      titulo="Esta execução não tem grade validada"
      descricao="Só uma grade completa e aprovada pela validação independente pode ser exibida e usada como base de edição."
      acao={
        <LinkBotao href={hrefExecucao(execucaoId)} variante="secundario">
          Ver o resultado da execução
        </LinkBotao>
      }
    />
  );
}
