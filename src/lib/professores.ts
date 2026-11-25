import type { VarianteEtiqueta } from "@/components/ui/Etiqueta";
import type { Professor, ProfessorComSituacao, StatusConta } from "@/types";
import { semAcento } from "./formatacao";
import { emailValido } from "./validacao";

// Regras puras da aba Professores (RF 8). As telas só chamam estas funções.

/** Filtros da listagem (protótipo "Professores", RF 8.4). */
export type FiltroProfessores = "todos" | "resposta_pendente" | "alteracao_formulario" | "alteracao_horario";

export const rotulosFiltro: Record<FiltroProfessores, string> = {
  todos: "Todos",
  resposta_pendente: "Resposta pendente",
  alteracao_formulario: "Pediram alteração de formulário",
  alteracao_horario: "Pediram alteração de horário",
};

export const filtrosProfessores = Object.keys(rotulosFiltro) as FiltroProfessores[];

/** Só conta ativa pode estar devendo resposta: convidado ainda não entrou e desativado não participa. */
export function respostaPendente(professor: ProfessorComSituacao) {
  return professor.statusConta === "ativa" && !professor.formularioRespondidoEm;
}

function atendeFiltro(professor: ProfessorComSituacao, filtro: FiltroProfessores) {
  if (filtro === "resposta_pendente") return respostaPendente(professor);
  if (filtro === "alteracao_formulario") return professor.pedidosAbertos.formulario > 0;
  if (filtro === "alteracao_horario") return professor.pedidosAbertos.horario > 0;
  return true;
}

/** RF 8.3: busca por nome ou e-mail, sem diferenciar acento e maiúsculas. */
export function filtrarProfessores(lista: ProfessorComSituacao[], busca: string, filtro: FiltroProfessores) {
  const termo = semAcento(busca.trim());
  return lista.filter(
    (p) =>
      atendeFiltro(p, filtro) && (!termo || semAcento(p.nome).includes(termo) || semAcento(p.email).includes(termo)),
  );
}

export function contarPorFiltro(lista: ProfessorComSituacao[]): Record<FiltroProfessores, number> {
  return Object.fromEntries(
    filtrosProfessores.map((filtro) => [filtro, lista.filter((p) => atendeFiltro(p, filtro)).length]),
  ) as Record<FiltroProfessores, number>;
}

/** Convite recém-enviado ainda não tem nome: o professor informa ao criar a conta. */
export function nomeExibido(professor: Pick<Professor, "nome" | "email">) {
  return professor.nome || professor.email;
}

export function ordenarPorNome<T extends Pick<Professor, "nome" | "email">>(lista: T[]) {
  return [...lista].sort((a, b) => nomeExibido(a).localeCompare(nomeExibido(b), "pt-BR"));
}

export const etiquetasConta: Record<StatusConta, { rotulo: string; variante: VarianteEtiqueta }> = {
  ativa: { rotulo: "Conta ativa", variante: "sucesso" },
  convidado: { rotulo: "Convite enviado", variante: "info" },
  desativada: { rotulo: "Conta desativada", variante: "neutra" },
};

/** Abas do perfil; a ativa fica em `?aba=` na URL. */
export type AbaPerfilProfessor = "formulario" | "horario" | "solicitacoes";
export const abasPerfilProfessor: AbaPerfilProfessor[] = ["formulario", "horario", "solicitacoes"];

/** Tela de onde o perfil foi aberto; define o destino do "voltar" (`?origem=` na URL). */
export type OrigemPerfilProfessor = "professores" | "formulario" | "horarios";

export const destinosVoltarPerfil: Record<OrigemPerfilProfessor, { href: string; rotulo: string }> = {
  professores: { href: "/admin/professores", rotulo: "Professores" },
  formulario: { href: "/admin/formulario", rotulo: "Formulário" },
  horarios: { href: "/admin/horarios", rotulo: "Horário" },
};

export function origemPerfilValida(valor: string | undefined): OrigemPerfilProfessor {
  return valor && valor in destinosVoltarPerfil ? (valor as OrigemPerfilProfessor) : "professores";
}

export function hrefPerfilProfessor(id: string, aba?: AbaPerfilProfessor, origem?: OrigemPerfilProfessor) {
  const parametros = new URLSearchParams();
  if (aba) parametros.set("aba", aba);
  if (origem && origem !== "professores") parametros.set("origem", origem);
  const busca = parametros.toString();
  return `/admin/professores/${id}${busca ? `?${busca}` : ""}`;
}

// Convite (RF 8.1, RF 1.13)

/** Aceita e-mails colados com vírgula, ponto e vírgula, espaço ou quebra de linha. */
export function separarEmails(texto: string) {
  return texto
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export type EmailConvite = { email: string; problema?: string };

/** Marca cada e-mail com o motivo que impede o convite, se houver. */
export function analisarEmails(emails: string[], professoresDoCurso: Pick<Professor, "email">[]): EmailConvite[] {
  const doCurso = new Set(professoresDoCurso.map((p) => p.email.toLowerCase()));
  return emails.map((email, i) => {
    if (!emailValido(email)) return { email, problema: "E-mail inválido" };
    if (emails.indexOf(email) !== i) return { email, problema: "Repetido" };
    if (doCurso.has(email)) return { email, problema: "Já está na lista" };
    return { email };
  });
}

export const TAMANHO_MAXIMO_FOTO_MB = 2;
