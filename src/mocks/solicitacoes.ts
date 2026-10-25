import type { Solicitacao } from "@/types";

export const solicitacoes: Solicitacao[] = [
  {
    id: "s1",
    tipo: "horario",
    status: "pendente",
    professor: { id: "p2", nome: "João Pereira Lima" },
    descricao:
      "Tenho consulta médica fixa às terças pela manhã durante este semestre. Seria possível trocar as aulas de Estrutura de Dados de terça por outro horário?",
    criadaEm: "2026-10-21T13:12:00Z",
    aula: { dia: "ter", posicao: 3, disciplina: "Estrutura de Dados", turma: "2º A · Manhã" },
  },
  {
    id: "s2",
    tipo: "formulario",
    status: "pendente",
    professor: { id: "p6", nome: "Marcos Vinícius Oliveira" },
    descricao: "Esqueci de marcar disponibilidade na quinta à noite. Gostaria de reabrir o formulário para corrigir.",
    criadaEm: "2026-10-20T18:40:00Z",
  },
  {
    id: "s3",
    tipo: "horario",
    status: "pendente",
    lidaEm: "2026-10-16T12:00:00Z",
    professor: { id: "p1", nome: "Ana Paula Souza" },
    descricao: "Prefiro que as quatro aulas de Matemática Discreta não fiquem concentradas na segunda e na sexta.",
    criadaEm: "2026-10-15T11:05:00Z",
    aula: { dia: "sex", posicao: 1, disciplina: "Matemática Discreta", turma: "1º A · Manhã" },
  },
  {
    id: "s4",
    tipo: "formulario",
    status: "aprovada",
    respondidaEm: "2026-10-18T09:00:00Z",
    professor: { id: "p4", nome: "Rafael Costa Nogueira" },
    descricao: "Preciso incluir interesse em Inglês Instrumental II, que foi cadastrada depois do meu envio.",
    criadaEm: "2026-10-17T09:30:00Z",
  },
  {
    id: "s5",
    tipo: "formulario",
    status: "rejeitada",
    respondidaEm: "2026-10-14T15:00:00Z",
    professor: { id: "p8", nome: "Luiz Henrique Barbosa" },
    descricao: "Gostaria de alterar todas as minhas respostas.",
    resposta: "O prazo para ajustes gerais já passou. Se houver uma mudança pontual de disponibilidade, envie um novo pedido explicando qual.",
    criadaEm: "2026-10-12T16:20:00Z",
  },
];
