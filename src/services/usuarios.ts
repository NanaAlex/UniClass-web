import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PerfilUsuario, UsuarioLogado } from "@/types";
import { CHAVE_TOKEN, URL_API } from "./api";
import { converterUsuario, destinoDoPerfil, type UsuarioApi } from "./autenticacao";

export async function obterUsuarioLogado(perfil: PerfilUsuario): Promise<UsuarioLogado> {
  const token = cookies().get(CHAVE_TOKEN)?.value;

  if (!token) redirect("/login");

  let resposta: Response | null = null;
  try {
    resposta = await fetch(`${URL_API}/auth/eu`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    resposta = null; // back desligado
  }

  // 401 (sessão vencida ou encerrada), 403 (conta desativada) ou back fora do ar
  if (!resposta || !resposta.ok) redirect("/login");

  const dados: { usuario: UsuarioApi } = await resposta.json();
  const usuario = converterUsuario(dados.usuario);

  // RF 1.5: cada perfil só acessa a própria área
  if (usuario.perfil !== perfil) redirect(destinoDoPerfil(usuario.perfil));

  return usuario;
}