"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { BotaoIcone } from "@/components/ui/BotaoIcone";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeAlerta, IconeOlho, IconeOlhoFechado, IconeSetaEsquerda, IconeSucesso } from "@/components/ui/Icones";
import { LinkBotao } from "@/components/ui/LinkBotao";
import { ErroApi } from "@/services/api";
import { redefinirSenha, verificarLinkRecuperacao } from "@/services/autenticacao";
import estilos from "./Autenticacao.module.css";

const ID_SENHA = "redefinir-senha";
const ID_CONFIRMACAO = "redefinir-confirmacao";

// Mesmas regras do back (utils/validacoes.ts): 8+ caracteres, maiúscula, minúscula, número e símbolo
const REGRAS_SENHA = [/.{8,}/, /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
const DICA_SENHA = "Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.";

/*
   carregando: conferindo o link no back
   invalido:   link usado, vencido ou substituído por um pedido mais novo
   formulario: link válido, mostra os campos
   concluido:  senha trocada, manda para o login
*/
type Etapa = "carregando" | "invalido" | "formulario" | "concluido";

/** RF 1.4: tela aberta pelo link do e-mail; cria a senha nova. */
export function FormularioRedefinirSenha({ token }: { token: string }) {
  const [etapa, setEtapa] = useState<Etapa>("carregando");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<{ senha?: string; confirmacao?: string }>({});
  const [falha, setFalha] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Ao abrir a página, pergunta ao back se o link ainda vale
  useEffect(() => {
    verificarLinkRecuperacao(token)
      .then((valido) => setEtapa(valido ? "formulario" : "invalido"))
      .catch(() => {
        // Back fora do ar: mostra o formulário e o erro aparece no envio
        setEtapa("formulario");
      });
  }, [token]);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    // Validação na tela antes de ir ao back (o back valida de novo)
    const novosErros = {
      senha: !senha
        ? "Informe a nova senha."
        : !REGRAS_SENHA.every((regra) => regra.test(senha))
          ? DICA_SENHA
          : undefined,
      confirmacao: !confirmacao
        ? "Repita a nova senha."
        : confirmacao !== senha
          ? "As senhas não são iguais."
          : undefined,
    };
    setErros(novosErros);
    if (novosErros.senha || novosErros.confirmacao) {
      document.getElementById(novosErros.senha ? ID_SENHA : ID_CONFIRMACAO)?.focus();
      return;
    }

    setEnviando(true);
    setFalha(null);
    try {
      await redefinirSenha(token, senha, confirmacao);
      setEtapa("concluido");
    } catch (erro) {
      // 400 de link vencido: troca para a tela de link inválido
      if (erro instanceof ErroApi && erro.status === 400 && erro.message.includes("link")) {
        setEtapa("invalido");
        return;
      }
      setFalha(erro instanceof ErroApi ? erro.message : "Tente novamente em alguns instantes.");
    } finally {
      setEnviando(false);
    }
  }

  const voltar = (
    <Link href="/login" className={estilos.voltar}>
      <IconeSetaEsquerda aria-hidden="true" /> Voltar para o login
    </Link>
  );

  if (etapa === "carregando") {
    return (
      <div aria-busy="true" aria-label="Conferindo o link">
        <Esqueleto largura="60%" altura="2rem" />
        <Esqueleto largura="90%" />
        <Esqueleto forma="bloco" altura="160px" />
      </div>
    );
  }

  if (etapa === "invalido") {
    return (
      <>
        {voltar}
        <EstadoVazio
          icone={<IconeAlerta />}
          titulo="Link inválido ou expirado"
          descricao="O link de recuperação vale por 1 hora e só pode ser usado uma vez. Peça um novo para criar sua senha."
          acao={<LinkBotao href="/recuperar-senha">Pedir um novo link</LinkBotao>}
        />
      </>
    );
  }

  if (etapa === "concluido") {
    return (
      <EstadoVazio
        icone={<IconeSucesso />}
        titulo="Senha alterada"
        descricao="Sua nova senha já está valendo. Por segurança, todas as sessões abertas foram encerradas."
        acao={<LinkBotao href="/login">Ir para o login</LinkBotao>}
      />
    );
  }

  const botaoMostrar = (
    <BotaoIcone
      rotulo="Mostrar senha"
      icone={mostrarSenha ? <IconeOlhoFechado /> : <IconeOlho />}
      aria-pressed={mostrarSenha}
      onClick={() => setMostrarSenha((atual) => !atual)}
    />
  );

  return (
    <>
      {voltar}
      <header className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>Criar nova senha</h1>
        <p className={estilos.subtitulo}>Escolha uma senha nova para entrar no Staggy.</p>
      </header>

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        {falha && <Aviso tipo="perigo" embutido titulo="Não foi possível alterar a senha" descricao={falha} />}

        <CampoTexto
          id={ID_SENHA}
          rotulo="Nova senha"
          type={mostrarSenha ? "text" : "password"}
          autoComplete="new-password"
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            setErros((atuais) => ({ ...atuais, senha: undefined }));
          }}
          dica={DICA_SENHA}
          erro={erros.senha}
          acaoDireita={botaoMostrar}
          autoFocus
        />

        <CampoTexto
          id={ID_CONFIRMACAO}
          rotulo="Confirmar nova senha"
          type={mostrarSenha ? "text" : "password"}
          autoComplete="new-password"
          value={confirmacao}
          onChange={(e) => {
            setConfirmacao(e.target.value);
            setErros((atuais) => ({ ...atuais, confirmacao: undefined }));
          }}
          erro={erros.confirmacao}
        />

        <Botao type="submit" tamanho="g" larguraTotal carregando={enviando}>
          Salvar nova senha
        </Botao>
      </form>
    </>
  );
}