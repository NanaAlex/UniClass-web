import { Botao } from "@/components/ui/Botao";
import { descreverAcao, type Nomes } from "@/lib/gestaoHorario";
import type { AcaoPendente } from "./useEdicaoExecucao";
import estilos from "./GradeTurma.module.css";

type BarraEdicaoGradeProps = {
  instrucao: string;
  pendentes: AcaoPendente[];
  nomes: Nomes;
  registrando: boolean;
  /** Ações extras da visão (ex.: fixar disciplina com professor). */
  extras?: React.ReactNode;
  aoDesfazerUltima: () => void;
  aoDescartar: () => void;
  aoRegistrar: () => void;
};

/** Fixa no topo durante a edição: como editar, as ações acumuladas e o registro das travas. */
export function BarraEdicaoGrade({ instrucao, pendentes, nomes, registrando, extras, aoDesfazerUltima, aoDescartar, aoRegistrar }: BarraEdicaoGradeProps) {
  const travas = pendentes.reduce((soma, p) => soma + p.travas.length, 0);

  return (
    <div className={estilos.barraEdicao} role="region" aria-label="Edição da grade">
      <div className={estilos.textos}>
        <p className={estilos.tituloBarra}>Editando sobre esta grade validada</p>
        <p className={estilos.instrucao}>{instrucao}</p>
      </div>
      <p className={estilos.contador} aria-live="polite">
        {pendentes.length === 0
          ? "Nenhuma ação"
          : `${pendentes.length === 1 ? "1 ação" : `${pendentes.length} ações`} · ${travas === 1 ? "1 trava" : `${travas} travas`}`}
      </p>
      <div className={estilos.acoes}>
        {extras}
        <Botao variante="fantasma" onClick={aoDesfazerUltima} disabled={registrando || pendentes.length === 0}>
          Desfazer última
        </Botao>
        <Botao variante="secundario" onClick={aoDescartar} disabled={registrando}>
          {pendentes.length === 0 ? "Sair da edição" : "Descartar"}
        </Botao>
        <Botao onClick={aoRegistrar} carregando={registrando} disabled={pendentes.length === 0}>
          Registrar travas
        </Botao>
      </div>
      {pendentes.length > 0 && (
        <ol className={estilos.listaAcoes} aria-label="Ações a registrar">
          {pendentes.map((p, i) => (
            <li key={i}>{descreverAcao(p.acao, nomes)}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
