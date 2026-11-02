import type { ItemMenu } from "@/components/layout/MenuLateral";

/** RF 6.1: horários, formulário, professores e cadastros. */
export const itensMenuAdministrador: ItemMenu[] = [
  { rotulo: "Horário", href: "/admin/horarios", icone: "boletim" },
  { rotulo: "Formulário", href: "/admin/formulario", icone: "chamada" },
  { rotulo: "Professores", href: "/admin/professores", icone: "perfil" },
  { rotulo: "Dados", href: "/admin/dados", icone: "turma" },
];

/** RF 6.3: apenas o próprio horário e formulário. */
export const itensMenuProfessor: ItemMenu[] = [
  { rotulo: "Horário", href: "/professor/horario", icone: "boletim" },
  { rotulo: "Formulário", href: "/professor/formulario", icone: "chamada" },
];

export const hrefConfiguracoes = {
  administrador: "/admin/configuracoes",
  professor: "/professor/configuracoes",
} as const;

/** Aba Formulário do professor: situação + sub-rota de preenchimento/visualização. */
export const hrefsFormularioProfessor = {
  inicio: "/professor/formulario",
  resposta: "/professor/formulario/resposta",
} as const;
