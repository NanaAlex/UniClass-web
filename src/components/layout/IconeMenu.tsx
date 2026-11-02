import type { CSSProperties } from "react";
import estilos from "./MenuLateral.module.css";

/** Nomes base dos arquivos em public/icons (cada um tem versão Branco e Preto). */
export type NomeIcone =
  | "boletim"
  | "chamada"
  | "configuracoes"
  | "notificacoes"
  | "perfil"
  | "sair"
  | "telaInicial"
  | "turma";

/**
 * Usa o SVG como máscara: a cor vem de `currentColor`, então o mesmo arquivo
 * funciona no item normal, no hover e no ativo sem trocar Branco/Preto.
 */
export function IconeMenu({ nome }: { nome: NomeIcone }) {
  const estilo = { "--icone": `url(/icons/${nome}Branco.svg)` } as CSSProperties;
  return <span className={estilos.icone} style={estilo} aria-hidden="true" />;
}
