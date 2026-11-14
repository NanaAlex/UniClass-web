import type { UsuarioLogado } from "@/types";
import { apagarToken, chamarApi, ErroApi, salvarToken } from "./api";

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
   Usuário como o back devolve
   Mesmo formato no POST /auth/login e no GET /auth/eu
*/
export type UsuarioApi = RespostaLogin["usuario"];

/* 
   Converte o usuário do back para o formato do front
   Usado pelo services/usuarios.ts (layouts no servidor)
*/
export function converterUsuario(usuario: UsuarioApi): UsuarioLogado {
  const ehAdministrador = usuario.tipoUsuario === "ADMINISTRADOR";

  return {
    id: String(usuario.id), // no front os ids são texto
    nome: usuario.nome,
    email: usuario.email,
    perfil: ehAdministrador ? "administrador" : "professor",
    descricao: ehAdministrador ? "Coordenação" : "Professor",
  };
}

/* 
   Página inicial de cada perfil (RF 1.2)
*/
export function destinoDoPerfil(perfil: UsuarioLogado["perfil"]): string {
  return perfil === "administrador" ? "/admin/horarios" : "/professor/horario";
}

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
   Recuperação de senha (RF 1.4, CU-003, ADR 012)
   1. Pede o link: POST /auth/recuperar-senha
      O back responde igual exista o e-mail ou não; a tela mostra
      "Se houver uma conta para ...", sem confirmar nada.
*/
export async function solicitarRecuperacaoSenha(email: string): Promise<{ enviadoPara: string }> {
  const enviadoPara = email.trim().toLowerCase();
  await chamarApi("/auth/recuperar-senha", { method: "POST", body: { email: enviadoPara } });
  return { enviadoPara };
}

/* 
   2. A tela do link confere se ele ainda vale
   (não usado, não substituído por um pedido mais novo, dentro de 1 hora)
*/
export async function verificarLinkRecuperacao(token: string): Promise<boolean> {
  try {
    await chamarApi(`/auth/recuperar-senha/${token}`);
    return true;
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 400) return false;
    throw erro;
  }
}

/* 
   3. Grava a senha nova: POST /auth/redefinir-senha
   Se o back recusar (link vencido, senha fraca), o ErroApi traz
   a mensagem dele para a tela mostrar.
*/
export async function redefinirSenha(token: string, novaSenha: string, confirmacaoSenha: string): Promise<void> {
  await chamarApi("/auth/redefinir-senha", { method: "POST", body: { token, novaSenha, confirmacaoSenha } });
}