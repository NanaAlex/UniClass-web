import { useId, type SelectHTMLAttributes } from "react";
import { DescricaoCampo } from "./DescricaoCampo";
import estilos from "./Campo.module.css";

export type OpcaoSeletor = {
  valor: string;
  rotulo: string;
};

type SeletorProps = SelectHTMLAttributes<HTMLSelectElement> & {
  rotulo: string;
  opcoes: OpcaoSeletor[];
  placeholder?: string;
  dica?: string;
  erro?: string;
  /** Rótulo só para leitores de tela (ex.: seletor dentro de uma tabela com cabeçalhos). */
  ocultarRotulo?: boolean;
};

export function Seletor({
  rotulo,
  opcoes,
  placeholder,
  dica,
  erro,
  ocultarRotulo = false,
  id,
  className,
  ...props
}: SeletorProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idDescricao = erro || dica ? `${idCampo}-descricao` : undefined;

  return (
    <div className={[estilos.grupo, className].filter(Boolean).join(" ")}>
      <label htmlFor={idCampo} className={ocultarRotulo ? "apenas-leitor" : estilos.rotulo}>
        {rotulo}
      </label>
      <div className={estilos.envoltorio}>
        <select
          id={idCampo}
          className={`${estilos.campo} ${estilos.seletor}`}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDescricao}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        <svg className={estilos.seta} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <DescricaoCampo id={idDescricao} erro={erro} dica={dica} />
    </div>
  );
}
