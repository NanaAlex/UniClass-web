import { chamarApi, URL_API } from "./api";

/*
   Perfil do professor (task 20): telefone e foto, informados por ele
   A foto não vem no JSON: só a versão, que entra na URL da imagem.
*/
type PerfilApi = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  fotoVersao: string | null;
  coordenacoes: { idAdmin: number; nome: string; dataVinculo: string }[];
};

export type Coordenacao = { id: string; nome: string; desde: string };

export type PerfilProfessor = {
  id: string;
  nome: string;
  email: string;
  /** Só dígitos; null = não informado. */
  telefone: string | null;
  /** Rota protegida da foto (mostrar com ImagemApi); undefined = sem foto. */
  fotoUrl?: string;
  /** Coordenações com vínculo ativo, da mais antiga para a mais recente. */
  coordenacoes: Coordenacao[];
};

function dePerfil(perfil: PerfilApi): PerfilProfessor {
  return {
    id: String(perfil.id),
    nome: perfil.nome,
    email: perfil.email,
    telefone: perfil.telefone,
    fotoUrl: perfil.fotoVersao ? `${URL_API}/professor/perfil/foto?v=${perfil.fotoVersao}` : undefined,
    // O back manda o horário de Brasília sem fuso (RNF 9)
    coordenacoes: perfil.coordenacoes.map((c) => ({ id: String(c.idAdmin), nome: c.nome, desde: `${c.dataVinculo}-03:00` })),
  };
}

export async function obterPerfil(): Promise<PerfilProfessor> {
  const { perfil } = await chamarApi<{ perfil: PerfilApi }>("/professor/perfil");
  return dePerfil(perfil);
}

/** Aceita o telefone formatado ("(11) 98765-4321"); vazio apaga. */
export async function salvarTelefone(telefone: string): Promise<PerfilProfessor> {
  const { perfil } = await chamarApi<{ perfil: PerfilApi }>("/professor/perfil", {
    method: "PUT",
    body: { telefone: telefone.trim() === "" ? null : telefone },
  });
  return dePerfil(perfil);
}

/** JPG, PNG ou WebP, até 2 MB (o back confere de novo pelo conteúdo do arquivo). */
export async function enviarFoto(arquivo: File): Promise<PerfilProfessor> {
  const dados = new FormData();
  dados.append("foto", arquivo);
  const { perfil } = await chamarApi<{ perfil: PerfilApi }>("/professor/perfil/foto", { method: "PUT", body: dados });
  return dePerfil(perfil);
}

export async function removerFoto(): Promise<PerfilProfessor> {
  const { perfil } = await chamarApi<{ perfil: PerfilApi }>("/professor/perfil/foto", { method: "DELETE" });
  return dePerfil(perfil);
}
