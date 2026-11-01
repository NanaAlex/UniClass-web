import type { Professor, UsuarioLogado } from "@/types";

export const professores: Professor[] = [
  { id: "p1", nome: "Ana Paula Souza", email: "ana.souza@fatec.sp.gov.br", statusConta: "ativa", areas: ["Matemática Discreta", "Estatística Aplicada"], criadoEm: "2024-02-05T12:00:00Z" },
  { id: "p2", nome: "João Pereira Lima", email: "joao.lima@fatec.sp.gov.br", telefone: "(11) 98765-4321", statusConta: "ativa", areas: ["Algoritmos", "Estrutura de Dados", "POO"], criadoEm: "2023-08-01T12:00:00Z" },
  { id: "p3", nome: "Carla Mendes Ribeiro", email: "carla.ribeiro@fatec.sp.gov.br", statusConta: "ativa", areas: ["Desenvolvimento Web", "IHC"], criadoEm: "2024-02-05T12:00:00Z" },
  { id: "p4", nome: "Rafael Costa Nogueira", email: "rafael.nogueira@fatec.sp.gov.br", statusConta: "ativa", areas: ["Inglês Instrumental"], criadoEm: "2022-03-10T12:00:00Z" },
  { id: "p5", nome: "Beatriz Rocha Almeida", email: "beatriz.almeida@fatec.sp.gov.br", statusConta: "ativa", areas: ["Engenharia de Software", "Qualidade de Software"], criadoEm: "2021-08-02T12:00:00Z" },
  { id: "p6", nome: "Marcos Vinícius Oliveira", email: "marcos.oliveira@fatec.sp.gov.br", telefone: "(11) 99812-3344", statusConta: "ativa", areas: ["Redes", "Sistemas Operacionais", "Nuvem"], criadoEm: "2020-02-03T12:00:00Z" },
  { id: "p7", nome: "Fernanda Carvalho Dias", email: "fernanda.dias@fatec.sp.gov.br", statusConta: "ativa", areas: ["Banco de Dados", "Ciência de Dados"], criadoEm: "2023-02-06T12:00:00Z" },
  { id: "p8", nome: "Luiz Henrique Barbosa", email: "luiz.barbosa@fatec.sp.gov.br", statusConta: "ativa", areas: ["Arquitetura de Computadores", "Segurança"], criadoEm: "2019-08-05T12:00:00Z" },
  { id: "p9", nome: "Juliana Martins Ferreira", email: "juliana.ferreira@fatec.sp.gov.br", statusConta: "ativa", areas: ["Comunicação e Expressão", "Ética"], criadoEm: "2022-08-01T12:00:00Z" },
  { id: "p10", nome: "Thiago Santos Moreira", email: "thiago.moreira@fatec.sp.gov.br", statusConta: "ativa", areas: ["Mobile", "Inteligência Artificial"], criadoEm: "2024-08-05T12:00:00Z" },
  { id: "p11", nome: "Patrícia Gomes Teixeira", email: "patricia.teixeira@fatec.sp.gov.br", statusConta: "convidado", areas: ["Gestão de Projetos", "Empreendedorismo"], criadoEm: "2026-10-18T12:00:00Z" },
  { id: "p12", nome: "Eduardo Araújo Cunha", email: "eduardo.cunha@fatec.sp.gov.br", statusConta: "desativada", areas: ["Sistemas de Informação"], criadoEm: "2018-02-05T12:00:00Z" },
];

/**
 * Professores com conta no Staggy, mas vinculados a outro curso. Convidar um destes e-mails
 * envia um convite de vínculo em vez de um convite de criação de conta (RF 1.13).
 */
export const professoresOutrosCursos: Professor[] = [
  { id: "p20", nome: "Roberto Alves Silva", email: "roberto.silva@fatec.sp.gov.br", statusConta: "ativa", areas: ["Lógica de Programação"], criadoEm: "2021-02-01T12:00:00Z" },
];

export const usuarioAdministrador: UsuarioLogado = {
  id: "adm1",
  nome: "Marina Albuquerque",
  email: "marina.albuquerque@fatec.sp.gov.br",
  perfil: "administrador",
  descricao: "Coordenação · ADS",
};

export const usuarioProfessor: UsuarioLogado = {
  id: "p2",
  nome: "João Pereira Lima",
  email: "joao.lima@fatec.sp.gov.br",
  perfil: "professor",
  descricao: "Professor",
};

/** Senha única das contas fictícias. Não existe autenticação real. */
export const SENHA_DEMONSTRACAO = "staggy123";
