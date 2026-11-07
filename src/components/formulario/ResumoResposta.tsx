import { rotulosTurno } from "@/lib/horario";
import type { ChaveHorario, EstruturaTurno, InteresseDisciplina } from "@/types";
import estilos from "./ResumoResposta.module.css";

type ResumoRespostaProps = {
  estruturas: EstruturaTurno[];
  disponibilidade: ChaveHorario[];
  interesses: InteresseDisciplina[];
};

/** Conferência antes do envio: horários por turno e matérias escolhidas. */
export function ResumoResposta({ estruturas, disponibilidade, interesses }: ResumoRespostaProps) {
  const muitoInteresse = interesses.filter((i) => i.nivel >= 4).length;

  return (
    <dl className={estilos.resumo}>
      {estruturas.map(({ turno }) => {
        const total = disponibilidade.filter((chave) => chave.startsWith(`${turno}:`)).length;
        return (
          <div key={turno} className={estilos.item}>
            <dt>{rotulosTurno[turno]}</dt>
            <dd>
              <strong>{total}</strong> {total === 1 ? "horário" : "horários"}
            </dd>
          </div>
        );
      })}
      <div className={estilos.item}>
        <dt>Matérias</dt>
        <dd>
          <strong>{interesses.length}</strong> {interesses.length === 1 ? "selecionada" : "selecionadas"}
          {muitoInteresse > 0 && <span className={estilos.extra}>{muitoInteresse} com interesse alto</span>}
        </dd>
      </div>
    </dl>
  );
}
