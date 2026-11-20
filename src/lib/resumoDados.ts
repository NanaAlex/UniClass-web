import { aulasPorBlocoDoCurso, ordemDias } from "@/lib/dadosAcademicos";
import { rotulosDia, rotulosTurno } from "@/lib/horario";
import type { DadosAcademicos, EstruturaTurno, Turma } from "@/types";

/*
   Resumo do que o "Salvar dados" vai gravar: compara o que veio do banco
   com o que está na tela. Desfazer uma edição (ligar e desligar o mesmo
   dia, criar e excluir a mesma turma) não deixa nada no resumo.
*/

const assinaturaBlocos = (estrutura: EstruturaTurno) =>
  estrutura.blocos.map((bloco) => bloco.aulas.map((aula) => `${aula.inicio}-${aula.fim}`).join(",")).join("|");

// Turma nova ganha outro id: compara pelo que a identifica na tela
const chaveTurma = (turma: Turma) => `${turma.semestre}|${turma.nome}|${turma.turno}`;
const nomeTurma = (turma: Turma) => `turma ${turma.nome} do ${turma.semestre}º semestre (${rotulosTurno[turma.turno].toLowerCase()})`;

const listar = (itens: string[]) =>
  itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;

export function resumirMudancas(antes: DadosAcademicos, depois: DadosAcademicos): string[] {
  const mudancas: string[] = [];

  // Dias e blocos, turno a turno
  const aulasAntes = aulasPorBlocoDoCurso(antes);
  const aulasDepois = aulasPorBlocoDoCurso(depois);
  if (aulasAntes !== aulasDepois) mudancas.push(`Aulas por bloco: ${aulasDepois} (eram ${aulasAntes})`);

  for (const estrutura of depois.estruturas) {
    const anterior = antes.estruturas.find((e) => e.turno === estrutura.turno);
    if (!anterior) continue;
    const turno = rotulosTurno[estrutura.turno];

    const incluidos = ordemDias.filter((d) => estrutura.dias.includes(d) && !anterior.dias.includes(d));
    const retirados = ordemDias.filter((d) => anterior.dias.includes(d) && !estrutura.dias.includes(d));
    if (incluidos.length) mudancas.push(`${turno}: incluir ${listar(incluidos.map((d) => rotulosDia[d].longo))}`);
    if (retirados.length) mudancas.push(`${turno}: retirar ${listar(retirados.map((d) => rotulosDia[d].longo))}`);

    if (estrutura.blocos.length !== anterior.blocos.length) {
      mudancas.push(`${turno}: ${estrutura.blocos.length} bloco(s) de aula (eram ${anterior.blocos.length})`);
    } else if (aulasAntes === aulasDepois && assinaturaBlocos(estrutura) !== assinaturaBlocos(anterior)) {
      mudancas.push(`${turno}: horário dos blocos alterado`);
    }
  }

  // Semestres
  const numerosAntes = antes.semestres.map((s) => s.numero);
  const numerosDepois = depois.semestres.map((s) => s.numero);
  for (const numero of numerosDepois.filter((n) => !numerosAntes.includes(n))) mudancas.push(`Criar o ${numero}º semestre`);
  for (const numero of numerosAntes.filter((n) => !numerosDepois.includes(n))) mudancas.push(`Excluir o ${numero}º semestre`);

  // Turmas (as de um semestre excluído já estão na linha dele)
  const chavesAntes = new Set(antes.turmas.map(chaveTurma));
  const chavesDepois = new Set(depois.turmas.map(chaveTurma));
  for (const turma of depois.turmas) if (!chavesAntes.has(chaveTurma(turma))) mudancas.push(`Criar a ${nomeTurma(turma)}`);
  for (const turma of antes.turmas) {
    if (!chavesDepois.has(chaveTurma(turma)) && numerosDepois.includes(turma.semestre)) mudancas.push(`Excluir a ${nomeTurma(turma)}`);
  }

  // Disciplinas (idem)
  const idsAntes = new Set(antes.disciplinas.map((d) => d.id));
  const idsDepois = new Set(depois.disciplinas.map((d) => d.id));
  for (const d of depois.disciplinas) if (!idsAntes.has(d.id)) mudancas.push(`Criar a disciplina ${d.nome} (${d.semestre}º semestre)`);
  for (const d of antes.disciplinas) {
    if (!idsDepois.has(d.id) && numerosDepois.includes(d.semestre)) mudancas.push(`Excluir a disciplina ${d.nome}`);
  }

  return mudancas;
}
