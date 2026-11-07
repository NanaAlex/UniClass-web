"use client";

import { useState, type FormEvent } from "react";
import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Seletor } from "@/components/ui/Seletor";
import { rotulosTurno } from "@/lib/horario";
import type { Disciplina, Semestre, Turno } from "@/types";
import estilos from "./FormularioDisciplina.module.css";

type FormularioDisciplinaProps = {
  semestres: Semestre[];
  disciplinas: Disciplina[];
  aoCriar: (nova: Omit<Disciplina, "id">) => void;
};

const numeros = (ate: number) => Array.from({ length: ate }, (_, i) => String(i + 1));
const opcoesAulas = numeros(8).map((n) => ({ valor: n, rotulo: n }));
const opcoesProfessores = numeros(3).map((n) => ({ valor: n, rotulo: n }));
const opcoesTurno = (Object.keys(rotulosTurno) as Turno[]).map((t) => ({ valor: t, rotulo: rotulosTurno[t] }));

/** RF 7.6: nome, aulas por semana, semestre, quantidade de professores e turno. */
export function FormularioDisciplina({ semestres, disciplinas, aoCriar }: FormularioDisciplinaProps) {
  const [nome, setNome] = useState("");
  const [aulas, setAulas] = useState("2");
  const [semestre, setSemestre] = useState(String(semestres[0]?.numero ?? ""));
  const [professores, setProfessores] = useState("1");
  const [turno, setTurno] = useState<Turno>("manha");
  const [erro, setErro] = useState<string>();

  const semestreValido = semestres.some((s) => String(s.numero) === semestre) ? semestre : String(semestres[0]?.numero ?? "");

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return setErro("Informe o nome da disciplina.");
    const repetida = disciplinas.some(
      (d) => d.semestre === Number(semestreValido) && d.nome.toLowerCase() === nomeLimpo.toLowerCase(),
    );
    if (repetida) return setErro(`Já existe "${nomeLimpo}" no ${semestreValido}º semestre.`);

    aoCriar({
      nome: nomeLimpo,
      semestre: Number(semestreValido),
      aulasPorSemana: Number(aulas),
      quantidadeProfessores: Number(professores),
      turno,
    });
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
      <Seletor rotulo="Aulas por semana" opcoes={opcoesAulas} value={aulas} onChange={(e) => setAulas(e.target.value)} />
      <Seletor
        rotulo="Semestre"
        opcoes={semestres.map((s) => ({ valor: String(s.numero), rotulo: `${s.numero}º semestre` }))}
        value={semestreValido}
        onChange={(e) => setSemestre(e.target.value)}
      />
      <Seletor
        rotulo="Professores"
        dica="Quantos dividem a disciplina."
        opcoes={opcoesProfessores}
        value={professores}
        onChange={(e) => setProfessores(e.target.value)}
      />
      <Seletor rotulo="Turno" opcoes={opcoesTurno} value={turno} onChange={(e) => setTurno(e.target.value as Turno)} />
      <div className={estilos.acoes}>
        <Botao type="submit">Criar disciplina</Botao>
      </div>
    </form>
  );
}
