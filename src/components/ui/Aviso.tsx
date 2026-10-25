import type { ReactNode } from "react";
import { BotaoIcone } from "./BotaoIcone";
import { IconeAlerta, IconeErro, IconeFechar, IconeInfo, IconeSucesso } from "./Icones";
import estilos from "./Aviso.module.css";

export type TipoAviso = "sucesso" | "perigo" | "aviso" | "info";

type AvisoProps = {
  tipo?: TipoAviso;
  titulo: string;
  descricao?: string;
  aoFechar?: () => void;
  /** Dentro do conteúdo (ex.: erro no topo de um formulário), sem sombra e em largura total. */
  embutido?: boolean;
};

const icones: Record<TipoAviso, ReactNode> = {
  sucesso: <IconeSucesso />,
  perigo: <IconeErro />,
  aviso: <IconeAlerta />,
  info: <IconeInfo />,
};

export function Aviso({ tipo = "info", titulo, descricao, aoFechar, embutido = false }: AvisoProps) {
  return (
    <div className={[estilos.caixa, estilos[tipo], embutido && estilos.embutido].filter(Boolean).join(" ")} role={tipo === "perigo" ? "alert" : "status"}>
      <span className={estilos.icone}>{icones[tipo]}</span>
      <div className={estilos.texto}>
        <p className={estilos.titulo}>{titulo}</p>
        {descricao && <p className={estilos.descricao}>{descricao}</p>}
      </div>
      {aoFechar && (
        <BotaoIcone rotulo="Fechar aviso" icone={<IconeFechar />} tamanho="p" onClick={aoFechar} />
      )}
    </div>
  );
}
