export type PerfilUsuario = "administrador" | "professor";

export type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  /** Texto exibido abaixo do nome, ex.: "Coordenação · ADS". */
  descricao?: string;
  fotoUrl?: string;
};

/** convidado: recebeu convite por e-mail e ainda não ativou a conta (RF 8.1, RF 1.13). */
export type StatusConta = "ativa" | "desativada" | "convidado";

export type Professor = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  fotoUrl?: string;
  statusConta: StatusConta; // RF 1.8, RF 8.10
  /** Disciplinas que já lecionou ou para as quais tem habilitação. */
  areas: string[];
  criadoEm: string; // ISO 8601
};

export type ProfessorResumo = Pick<Professor, "id" | "nome" | "fotoUrl">;

/** Linha da listagem do administrador (RF 8.2–8.4): o professor e o que está pendente com ele. */
export type ProfessorComSituacao = Professor & {
  /** Data de envio da resposta do formulário atual; null = ainda não respondeu (RF 2.10). */
  formularioRespondidoEm: string | null;
  /** Pedidos que ainda dependem do administrador (RF 4.4). */
  pedidosAbertos: { horario: number; formulario: number };
};
