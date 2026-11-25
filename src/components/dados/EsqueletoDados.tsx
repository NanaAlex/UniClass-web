import { Esqueleto } from "@/components/ui/Esqueleto";
import type { AbaDados } from "@/lib/dadosAcademicos";
import estilos from "./Dados.module.css";

/** Carregamento no formato de cada aba. */
export function EsqueletoDados({ aba }: { aba: AbaDados }) {
  if (aba === "semestres") {
    return (
      <div className={estilos.gradeSemestres} aria-label="Carregando semestres">
        {Array.from({ length: 6 }, (_, i) => (
          <Esqueleto key={i} forma="bloco" altura="168px" />
        ))}
      </div>
    );
  }

  return (
    <div className={estilos.cartaoSecao} aria-label={aba === "horarios" ? "Carregando dias e horários" : "Carregando disciplinas"}>
      <Esqueleto largura="40%" altura="1.5rem" />
      <Esqueleto largura="60%" />
      <Esqueleto forma="bloco" altura={aba === "horarios" ? "320px" : "120px"} />
      {aba === "disciplinas" && <Esqueleto forma="bloco" altura="240px" />}
    </div>
  );
}
