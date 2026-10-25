import { usuarioAdministrador, usuarioProfessor } from "@/mocks/usuarios";
import type { PerfilUsuario, UsuarioLogado } from "@/types";
import { responder } from "./simulacao";

export function obterUsuarioLogado(perfil: PerfilUsuario): Promise<UsuarioLogado> {
  return responder(perfil === "administrador" ? usuarioAdministrador : usuarioProfessor, 150);
}
