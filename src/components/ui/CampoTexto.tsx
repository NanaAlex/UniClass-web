import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { DescricaoCampo } from "./DescricaoCampo";
import estilos from "./Campo.module.css";

type CampoTextoProps = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  dica?: string;
  erro?: string;
  icone?: ReactNode;
  /** Botão dentro do campo, à direita (ex.: mostrar senha). */
  acaoDireita?: ReactNode;
  /** Conteúdo alinhado à direita do rótulo (ex.: link "Esqueci minha senha"). */
  acessorioRotulo?: ReactNode;
};

export function CampoTexto({
  rotulo,
  dica,
  erro,
  icone,
  acaoDireita,
  acessorioRotulo,
  id,
  className,
  ...props
}: CampoTextoProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idDescricao = erro || dica ? `${idCampo}-descricao` : undefined;

  return (
    <div className={[estilos.grupo, className].filter(Boolean).join(" ")}>
      <div className={estilos.linhaRotulo}>
        <label htmlFor={idCampo} className={estilos.rotulo}>
          {rotulo}
          {props.required && <span className={estilos.obrigatorio} aria-hidden="true"> *</span>}
        </label>
        {acessorioRotulo}
      </div>
      <div className={estilos.envoltorio}>
        {icone && <span className={estilos.iconeEsquerda} aria-hidden="true">{icone}</span>}
        <input
          id={idCampo}
          className={[estilos.campo, icone && estilos.comIcone, acaoDireita && estilos.comAcao].filter(Boolean).join(" ")}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDescricao}
          {...props}
        />
        {acaoDireita && <span className={estilos.acaoDireita}>{acaoDireita}</span>}
      </div>
      <DescricaoCampo id={idDescricao} erro={erro} dica={dica} />
    </div>
  );
}
