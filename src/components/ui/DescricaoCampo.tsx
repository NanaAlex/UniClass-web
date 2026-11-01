import { IconeErro } from "./Icones";
import estilos from "./Campo.module.css";

type DescricaoCampoProps = {
  id?: string;
  erro?: string;
  dica?: string;
};

/** Texto abaixo do campo: erro (com ícone, anunciado) ou dica. Ligado ao campo via aria-describedby. */
export function DescricaoCampo({ id, erro, dica }: DescricaoCampoProps) {
  if (!erro && !dica) return null;
  if (!erro) return <p id={id} className={estilos.dica}>{dica}</p>;

  return (
    <p id={id} className={estilos.erro} aria-live="polite">
      <IconeErro className={estilos.iconeErro} />
      {erro}
    </p>
  );
}
