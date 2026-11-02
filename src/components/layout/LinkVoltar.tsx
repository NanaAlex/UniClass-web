import { IconeSetaEsquerda } from "@/components/ui/Icones";
import { LinkBotao } from "@/components/ui/LinkBotao";
import estilos from "./LinkVoltar.module.css";

type LinkVoltarProps = {
  href: string;
  /** Nome da tela de destino, ex.: "Horários". */
  rotulo: string;
};

/** Link de retorno acima do título; o ícone fica alinhado à borda do conteúdo. */
export function LinkVoltar({ href, rotulo }: LinkVoltarProps) {
  return (
    <LinkBotao href={href} variante="fantasma" tamanho="p" icone={<IconeSetaEsquerda />} className={estilos.voltar}>
      {rotulo}
    </LinkBotao>
  );
}
