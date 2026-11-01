import type { VarianteEtiqueta } from "@/components/ui/Etiqueta";
import type { Formulario, ProfessorComSituacao } from "@/types";
import { formularioEncerrado } from "./formulario";
import { ordenarPorNome, respostaPendente } from "./professores";

// Regras puras da aba Formulário do administrador (RF 2.7–2.11, RF 4.6).

/** sem_formulario: nada lançado · agendado: lançado, mas o período ainda não começou. */
export type SituacaoGestao = "sem_formulario" | "agendado" | "aberto" | "encerrado";

export function situacaoDaGestao(formulario: Formulario | null, agora = new Date()): SituacaoGestao {
  if (!formulario || formulario.status === "rascunho") return "sem_formulario";
  if (formularioEncerrado(formulario, agora)) return "encerrado";
  return new Date(formulario.inicio).getTime() > agora.getTime() ? "agendado" : "aberto";
}

export const etiquetasGestao: Record<Exclude<SituacaoGestao, "sem_formulario">, { rotulo: string; variante: VarianteEtiqueta }> = {
  agendado: { rotulo: "Agendado", variante: "info" },
  aberto: { rotulo: "Ativo", variante: "sucesso" },
  encerrado: { rotulo: "Encerrado", variante: "neutra" },
};

/** Encerrado só pela data (RF 2.8): o administrador ainda pode prorrogar o prazo. */
export function podeProrrogar(formulario: Formulario) {
  return formulario.status === "aberto";
}

const UMA_HORA_MS = 60 * 60 * 1000;
const UM_DIA_MS = 24 * UMA_HORA_MS;

function textoDistancia(ate: string, agora: Date) {
  const ms = new Date(ate).getTime() - agora.getTime();
  if (ms < UMA_HORA_MS) return "menos de 1 hora";
  if (ms < UM_DIA_MS) {
    const horas = Math.floor(ms / UMA_HORA_MS);
    return horas === 1 ? "1 hora" : `${horas} horas`;
  }
  const dias = Math.floor(ms / UM_DIA_MS);
  return dias === 1 ? "1 dia" : `${dias} dias`;
}

/** "Tempo restante" do protótipo. `urgente` quando faltam 2 dias ou menos para encerrar. */
export function tempoRestante(formulario: Formulario, situacao: SituacaoGestao, agora = new Date()) {
  if (situacao === "agendado") return { texto: `Abre em ${textoDistancia(formulario.inicio, agora)}`, urgente: false };
  if (situacao !== "aberto") return null;
  const urgente = new Date(formulario.fim).getTime() - agora.getTime() <= 2 * UM_DIA_MS;
  return { texto: `Encerra em ${textoDistancia(formulario.fim, agora)}`, urgente };
}

/** RF 2.10, 2.11, 4.6: quem respondeu (mais recentes primeiro) e quem ainda deve a resposta. */
export function separarPorResposta(professores: ProfessorComSituacao[]) {
  const responderam = professores
    .filter((p) => p.formularioRespondidoEm)
    .sort((a, b) => (b.formularioRespondidoEm ?? "").localeCompare(a.formularioRespondidoEm ?? ""));
  return { responderam, pendentes: ordenarPorNome(professores.filter(respostaPendente)) };
}

// Campos de data (input datetime-local trabalha com o horário local, sem fuso)

const doisDigitos = (n: number) => String(n).padStart(2, "0");

export function paraCampoData(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

export function deCampoData(valor: string) {
  return new Date(valor).toISOString();
}

/** "2027.1" no nome tem prioridade; sem ele, o próximo período a partir da data de início. */
export function periodoDoNome(nome: string, inicio: string) {
  const encontrado = nome.match(/\b(\d{4})[.\-/ ]([12])\b/);
  if (encontrado) return `${encontrado[1]}.${encontrado[2]}`;
  const data = inicio ? new Date(inicio) : new Date();
  return data.getMonth() >= 6 ? `${data.getFullYear() + 1}.1` : `${data.getFullYear()}.2`;
}

export type CamposPrazo = { inicio: string; fim: string };
export type ErrosFormulario = Partial<Record<"nome" | keyof CamposPrazo, string>>;

export function validarPrazo({ inicio, fim }: CamposPrazo, agora = new Date()): ErrosFormulario {
  const erros: ErrosFormulario = {};
  if (!inicio) erros.inicio = "Informe a data de início.";
  if (!fim) erros.fim = "Informe a data de término.";
  else if (new Date(fim).getTime() <= agora.getTime()) erros.fim = "O término precisa ser uma data futura.";
  else if (inicio && new Date(fim).getTime() <= new Date(inicio).getTime()) erros.fim = "O término precisa ser depois do início.";
  return erros;
}

export function validarLancamento(dados: CamposPrazo & { nome: string }, agora = new Date()): ErrosFormulario {
  const erros = validarPrazo(dados, agora);
  if (dados.nome.trim().length < 3) erros.nome = "Informe um nome com pelo menos 3 caracteres.";
  return erros;
}

export const temErros = (erros: ErrosFormulario) => Object.values(erros).some(Boolean);
