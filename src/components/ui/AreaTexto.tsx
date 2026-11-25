import { useId, type TextareaHTMLAttributes } from "react";
import { DescricaoCampo } from "./DescricaoCampo";
import estilos from "./Campo.module.css";

type AreaTextoProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  rotulo: string;
  dica?: string;
  erro?: string;
  /** Mostra "120 / 500" abaixo do campo; exige `maxLength`. */
  mostrarContador?: boolean;
};

export function AreaTexto({ rotulo, dica, erro, mostrarContador = false, id, className, ...props }: AreaTextoProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idDescricao = erro || dica ? `${idCampo}-descricao` : undefined;
  const tamanho = String(props.value ?? "").length;

  return (
    <div className={[estilos.grupo, className].filter(Boolean).join(" ")}>
      <label htmlFor={idCampo} className={estilos.rotulo}>
        {rotulo}
        {props.required && <span className={estilos.obrigatorio} aria-hidden="true"> *</span>}
      </label>
      <textarea
        id={idCampo}
        className={`${estilos.campo} ${estilos.areaTexto}`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={idDescricao}
        {...props}
      />
      <div className={estilos.rodapeCampo}>
        <DescricaoCampo id={idDescricao} erro={erro} dica={dica} />
        {mostrarContador && props.maxLength && (
          <span className={estilos.contador} aria-hidden="true">
            {tamanho} / {props.maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
