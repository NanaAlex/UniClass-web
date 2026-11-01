import { professores, SENHA_DEMONSTRACAO, usuarioAdministrador } from "@/mocks/usuarios";
import type { UsuarioLogado } from "@/types";
import { esperar, responder } from "./simulacao";

export type MotivoFalhaLogin = "credenciais_invalidas" | "conta_desativada" | "convite_pendente";

export class ErroAutenticacao extends Error {
  constructor(public motivo: MotivoFalhaLogin) {
    super(motivo);
    this.name = "ErroAutenticacao";
  }
}

export type ResultadoLogin = {
  usuario: UsuarioLogado;
  /** RF 1.2: cada perfil entra na sua área. */
  destino: string;
};

/** RF 1.1, 1.6, 1.12. Sem back-end: confere e-mail e senha contra os mocks. */
export async function entrar(email: string, senha: string): Promise<ResultadoLogin> {
  await esperar(800);
  const emailNormalizado = email.trim().toLowerCase();

  if (emailNormalizado === usuarioAdministrador.email && senha === SENHA_DEMONSTRACAO) {
    return { usuario: structuredClone(usuarioAdministrador), destino: "/admin/horarios" };
  }

  const professor = professores.find((p) => p.email === emailNormalizado);
  if (!professor || senha !== SENHA_DEMONSTRACAO) throw new ErroAutenticacao("credenciais_invalidas");
  if (professor.statusConta === "desativada") throw new ErroAutenticacao("conta_desativada");
  if (professor.statusConta === "convidado") throw new ErroAutenticacao("convite_pendente");

  return {
    usuario: { id: professor.id, nome: professor.nome, email: professor.email, perfil: "professor", descricao: "Professor" },
    destino: "/professor/horario",
  };
}

/**
 * RF 1.4. A resposta é a mesma exista ou não a conta, para não revelar
 * quais e-mails estão cadastrados.
 */
export async function solicitarRecuperacaoSenha(email: string): Promise<{ enviadoPara: string }> {
  return responder({ enviadoPara: email.trim().toLowerCase() }, 900);
}
