"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { IconeOlho, IconeOlhoFechado } from "@/components/ui/Icones";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { emailValido } from "@/lib/validacao";
import { entrar, ErroAutenticacao, type MotivoFalhaLogin } from "@/services/autenticacao";
import estilos from "./Autenticacao.module.css";

const ID_EMAIL = "login-email";
const ID_SENHA = "login-senha";

const falhas: Record<MotivoFalhaLogin | "inesperada", { titulo: string; descricao: string }> = {
  credenciais_invalidas: { titulo: "E-mail ou senha incorretos", descricao: "Confira os dados e tente novamente." },
  conta_desativada: {
    titulo: "Conta desativada",
    descricao: "Esta conta foi desativada pela coordenação. Procure a coordenação do curso para reativá-la.",
  },
  convite_pendente: {
    titulo: "Convite ainda não aceito",
    descricao: "Abra o link de convite enviado para o seu e-mail para ativar a conta antes de entrar.",
  },
  inesperada: { titulo: "Não foi possível entrar agora", descricao: "Tente novamente em alguns instantes." },
};

type Erros = { email?: string; senha?: string };

function validar(email: string, senha: string): Erros {
  return {
    email: !email.trim() ? "Informe seu e-mail." : !emailValido(email) ? "Digite um e-mail válido, como nome@escola.com." : undefined,
    senha: !senha ? "Informe sua senha." : undefined,
  };
}

export function FormularioLogin() {
  const router = useRouter();
  const { mostrarAviso } = useAvisos();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [falha, setFalha] = useState<keyof typeof falhas | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setFalha(null);
    const novosErros = validar(email, senha);
    setErros(novosErros);
    if (novosErros.email || novosErros.senha) {
      document.getElementById(novosErros.email ? ID_EMAIL : ID_SENHA)?.focus();
      return;
    }

    setEnviando(true);
    try {
      const { usuario, destino } = await entrar(email, senha);
      mostrarAviso({ tipo: "sucesso", titulo: `Olá, ${usuario.nome.split(" ")[0]}!`, descricao: "Login realizado com sucesso." });
      router.push(destino); // o botão segue carregando até a nova página abrir
    } catch (erro) {
      setEnviando(false);
      setFalha(erro instanceof ErroAutenticacao ? erro.motivo : "inesperada");
      document.getElementById(ID_SENHA)?.focus();
    }
  }

  const hrefRecuperar = `/recuperar-senha${emailValido(email) ? `?email=${encodeURIComponent(email.trim())}` : ""}`;

  return (
    <>
      <header className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>Entrar no Staggy</h1>
        <p className={estilos.subtitulo}>Use o e-mail e a senha cadastrados pela coordenação do curso.</p>
      </header>

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        {falha && <Aviso tipo="perigo" embutido titulo={falhas[falha].titulo} descricao={falhas[falha].descricao} />}

        <CampoTexto
          id={ID_EMAIL}
          rotulo="E-mail"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="nome@escola.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErros((atuais) => ({ ...atuais, email: undefined }));
          }}
          erro={erros.email}
          autoFocus
        />

        <CampoTexto
          id={ID_SENHA}
          rotulo="Senha"
          type={mostrarSenha ? "text" : "password"}
          autoComplete="current-password"
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            setErros((atuais) => ({ ...atuais, senha: undefined }));
          }}
          erro={erros.senha}
          acessorioRotulo={
            <Link href={hrefRecuperar} className={estilos.link}>
              Esqueci minha senha
            </Link>
          }
          acaoDireita={
            <BotaoIcone
              rotulo="Mostrar senha"
              icone={mostrarSenha ? <IconeOlhoFechado /> : <IconeOlho />}
              aria-pressed={mostrarSenha}
              onClick={() => setMostrarSenha((atual) => !atual)}
            />
          }
        />

        <Botao type="submit" tamanho="g" larguraTotal carregando={enviando}>
          Entrar
        </Botao>
      </form>
    </>
  );
}
