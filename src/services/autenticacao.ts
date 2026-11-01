import type { UsuarioLogado } from "@/types";
import { apagarToken, chamarApi, ErroApi, salvarToken } from "./api";
import { responder } from "./simulacao";

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

type RespostaLogin = {
  message: string;
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    tipoUsuario: "PROFESSOR" | "ADMINISTRADOR";
  };
};

/* 
   Login (RF 1.1, CU-001)
 */
export async function entrar(email: string, senha: string): Promise<ResultadoLogin> {
  try {
    const resposta = await chamarApi<RespostaLogin>("/auth/login", {
      method: "POST",
      body: { email: email.trim().toLowerCase(), senha },
    });

    salvarToken(resposta.token);

    const ehAdministrador = resposta.usuario.tipoUsuario === "ADMINISTRADOR";

    return {
      usuario: {
        id: String(resposta.usuario.id), // no front os ids são texto
        nome: resposta.usuario.nome,
        email: resposta.usuario.email,
        perfil: ehAdministrador ? "administrador" : "professor",
        descricao: ehAdministrador ? "Coordenação" : "Professor",
      },
      destino: ehAdministrador ? "/admin/horarios" : "/professor/horario",
    };

  } catch (erro) {
    // 401: email ou senha errados · 403: conta desativada
    if (erro instanceof ErroApi && erro.status === 401) throw new ErroAutenticacao("credenciais_invalidas");
    if (erro instanceof ErroApi && erro.status === 403) throw new ErroAutenticacao("conta_desativada");
    // Qualquer outro erro (back desligado, 500...) vira "inesperada" na tela
    throw erro;
  }
}

/* 
   Logout (RF 1.3, CU-002)
 */
export async function sair(): Promise<void> {
  try {
    await chamarApi("/auth/logout", { method: "POST" });
  } finally {
    apagarToken();
  }
}

/* 
   Recuperação de senha (RF 1.4, CU-003)
 */
export async function solicitarRecuperacaoSenha(email: string): Promise<{ enviadoPara: string }> {
    return responder({ enviadoPara: email.trim().toLowerCase() }, 900);
}