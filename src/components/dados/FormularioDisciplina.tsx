"use client";

import { useState, type FormEvent } from "react";
import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Seletor } from "@/components/ui/Seletor";
import { opcoesCarga } from "@/lib/dadosAcademicos";
import type { Disciplina, Semestre } from "@/types";
import estilos from "./FormularioDisciplina.module.css";

type FormularioDisciplinaProps = {
  semestres: Semestre[];
  disciplinas: Disciplina[];
  /** K: a carga é sempre múltipla das aulas por bloco (RN-13). */
  aulasPorBloco: number;
  aoCriar: (nova: Omit<Disciplina, "id">) => void;
};

/**
 * RN-06, RN-07, RN-13: nome, semestre e carga semanal múltipla de K. O turno vem da turma (RN-05) e
 * cada turma–disciplina tem um único professor responsável (RN-19): não há turno nem co-docência aqui.
 */
export function FormularioDisciplina({ semestres, disciplinas, aulasPorBloco: K, aoCriar }: FormularioDisciplinaProps) {
  const cargas = opcoesCarga(K);
  const [nome, setNome] = useState("");
  const [aulas, setAulas] = useState(String(cargas[0] ?? K));
  const [semestre, setSemestre] = useState(String(semestres[0]?.numero ?? ""));
  const [erro, setErro] = useState<string>();

  const semestreValido = semestres.some((s) => String(s.numero) === semestre) ? semestre : String(semestres[0]?.numero ?? "");
  const cargaValida = cargas.includes(Number(aulas)) ? aulas : String(cargas[0] ?? K);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return setErro("Informe o nome da disciplina.");
    const repetida = disciplinas.some((d) => d.semestre === Number(semestreValido) && d.nome.toLowerCase() === nomeLimpo.toLowerCase());
    if (repetida) return setErro(`Já existe "${nomeLimpo}" no ${semestreValido}º semestre.`);

    aoCriar({ nome: nomeLimpo, semestre: Number(semestreValido), aulasPorSemana: Number(cargaValida) });
    setNome("");
    setErro(undefined);
  }

  return (
    <form className={estilos.formulario} onSubmit={enviar} noValidate aria-label="Nova disciplina">
      <CampoTexto
        rotulo="Nome"
        required
        className={estilos.nome}
        placeholder="Ex.: Banco de Dados I"
        value={nome}
        erro={erro}
        onChange={(evento) => {
          setNome(evento.target.value);
          if (erro) setErro(undefined);
        }}
      />
      <Seletor
        rotulo="Aulas por semana"
        dica={`Múltiplo de ${K} (${K} ${K === 1 ? "aula" : "aulas"} por bloco).`}
        opcoes={cargas.map((n) => ({ valor: String(n), rotulo: `${n} (${n / K} ${n / K === 1 ? "bloco" : "blocos"})` }))}
        value={cargaValida}
        onChange={(e) => setAulas(e.target.value)}
      />
      <Seletor
        rotulo="Semestre"
        opcoes={semestres.map((s) => ({ valor: String(s.numero), rotulo: `${s.numero}º semestre` }))}
        value={semestreValido}
        onChange={(e) => setSemestre(e.target.value)}
      />
      <div className={estilos.acoes}>
        <Botao type="submit">Criar disciplina</Botao>
      </div>
    </form>
  );
}
