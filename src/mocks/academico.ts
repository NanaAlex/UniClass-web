import type { DiaSemana, Disciplina, EstruturaTurno, Semestre, Turma } from "@/types";

const diasUteis: DiaSemana[] = ["seg", "ter", "qua", "qui", "sex"];

export const estruturasTurno: EstruturaTurno[] = [
  {
    turno: "manha",
    dias: diasUteis,
    blocos: [
      { aulas: [{ posicao: 1, inicio: "07:30", fim: "08:20" }, { posicao: 2, inicio: "08:20", fim: "09:10" }] },
      { aulas: [{ posicao: 3, inicio: "09:30", fim: "10:20" }, { posicao: 4, inicio: "10:20", fim: "11:10" }] },
    ],
  },
  {
    turno: "tarde",
    dias: diasUteis,
    blocos: [
      { aulas: [{ posicao: 1, inicio: "13:30", fim: "14:20" }, { posicao: 2, inicio: "14:20", fim: "15:10" }] },
      { aulas: [{ posicao: 3, inicio: "15:30", fim: "16:20" }, { posicao: 4, inicio: "16:20", fim: "17:10" }] },
    ],
  },
  {
    turno: "noite",
    dias: [...diasUteis, "sab"],
    blocos: [
      { aulas: [{ posicao: 1, inicio: "19:00", fim: "19:50" }, { posicao: 2, inicio: "19:50", fim: "20:40" }] },
      { aulas: [{ posicao: 3, inicio: "20:50", fim: "21:40" }, { posicao: 4, inicio: "21:40", fim: "22:30" }] },
    ],
  },
];

export const turmas: Turma[] = [
  { id: "t1a", nome: "A", semestre: 1, turno: "manha" },
  { id: "t1b", nome: "B", semestre: 1, turno: "noite" },
  { id: "t2a", nome: "A", semestre: 2, turno: "manha" },
  { id: "t2b", nome: "B", semestre: 2, turno: "noite" },
  { id: "t3a", nome: "A", semestre: 3, turno: "manha" },
  { id: "t4a", nome: "A", semestre: 4, turno: "manha" },
  { id: "t5a", nome: "A", semestre: 5, turno: "noite" },
  { id: "t6a", nome: "A", semestre: 6, turno: "noite" },
];

export const semestres: Semestre[] = [1, 2, 3, 4, 5, 6].map((numero) => ({
  id: `s${numero}`,
  numero,
  turmaIds: turmas.filter((t) => t.semestre === numero).map((t) => t.id),
}));

// [id, nome, semestre, aulas por semana, cor]
const catalogo: [string, string, number, number, number][] = [
  ["alg", "Algoritmos e Lógica de Programação", 1, 4, 1],
  ["mat", "Matemática Discreta", 1, 4, 2],
  ["arq", "Arquitetura e Organização de Computadores", 1, 4, 3],
  ["fsi", "Fundamentos de Sistemas de Informação", 1, 2, 4],
  ["ing1", "Inglês Instrumental I", 1, 2, 5],
  ["com", "Comunicação e Expressão", 1, 2, 6],
  ["ed", "Estrutura de Dados", 2, 4, 1],
  ["bd1", "Banco de Dados I", 2, 4, 7],
  ["es1", "Engenharia de Software I", 2, 4, 8],
  ["web1", "Desenvolvimento Web I", 2, 4, 3],
  ["est", "Estatística Aplicada", 2, 2, 2],
  ["poo", "Programação Orientada a Objetos", 3, 4, 1],
  ["bd2", "Banco de Dados II", 3, 4, 7],
  ["red", "Redes de Computadores", 3, 4, 6],
  ["ihc", "Interação Humano-Computador", 3, 2, 5],
  ["ing2", "Inglês Instrumental II", 3, 2, 4],
  ["mob", "Desenvolvimento para Dispositivos Móveis", 4, 4, 3],
  ["so", "Sistemas Operacionais", 4, 4, 6],
  ["es2", "Engenharia de Software II", 4, 4, 8],
  ["gp", "Gestão de Projetos", 4, 2, 2],
  ["seg", "Segurança da Informação", 4, 2, 5],
  ["ia", "Inteligência Artificial", 5, 4, 1],
  ["web2", "Desenvolvimento Web II", 5, 4, 3],
  ["nuv", "Computação em Nuvem", 5, 4, 6],
  ["emp", "Empreendedorismo", 5, 2, 4],
  ["tg", "Trabalho de Graduação", 6, 4, 8],
  ["qs", "Qualidade de Software", 6, 4, 7],
  ["dados", "Ciência de Dados", 6, 4, 2],
  ["etica", "Ética e Legislação em TI", 6, 2, 5],
];

export const disciplinas: Disciplina[] = catalogo.map(([id, nome, semestre, aulasPorSemana, cor]) => ({
  id,
  nome,
  semestre,
  aulasPorSemana,
  quantidadeProfessores: 1,
  turno: semestre >= 5 ? "noite" : "manha",
  cor,
}));
