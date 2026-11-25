import { Esqueleto } from "@/components/ui/Esqueleto";
import estilos from "./GestaoHorario.module.css";

/** Carregamento no formato do cartão de geração + cartões das turmas. */
export function EsqueletoHorarios() {
  return (
    <div className={estilos.painel} aria-busy="true" aria-label="Carregando horários">
      <div className={estilos.cartaoGeracao}>
        <Esqueleto largura="220px" altura="1.5rem" />
        <Esqueleto largura="60%" />
        <Esqueleto forma="bloco" altura="28px" />
        <Esqueleto forma="bloco" altura="72px" />
      </div>
      <Esqueleto largura="180px" altura="1.5rem" />
      <ul className={estilos.grade}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <li key={n} className={estilos.esqueletoCartao}>
            <Esqueleto largura="70%" altura="1.25rem" />
            <Esqueleto largura="45%" />
            <Esqueleto largura="55%" altura="24px" />
          </li>
        ))}
      </ul>
    </div>
  );
}
