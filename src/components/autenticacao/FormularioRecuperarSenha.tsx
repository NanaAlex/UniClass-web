"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeEmail, IconeSetaEsquerda } from "@/components/ui/Icones";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { emailValido } from "@/lib/validacao";
import { solicitarRecuperacaoSenha } from "@/services/autenticacao";
import estilos from "./Autenticacao.module.css";

const ID_EMAIL = "recuperar-email";
const ESPERA_REENVIO_S = 30;

/** RF 1.4: pede o e-mail e confirma o envio do link na mesma tela. */
export function FormularioRecuperarSenha({ emailInicial = "" }: { emailInicial?: string }) {
  const { mostrarAviso } = useAvisos();
  const [email, setEmail] = useState(emailInicial);
  const [erro, setErro] = useState<string>();
  const [falhaEnvio, setFalhaEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);
  const [espera, setEspera] = useState(0);

  // Contagem regressiva para liberar o reenvio
  useEffect(() => {
    if (espera <= 0) return;
    const id = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [espera]);

  async function solicitar(reenvio = false) {
    setEnviando(true);
    setFalhaEnvio(false);
    try {
      const { enviadoPara: destino } = await solicitarRecuperacaoSenha(email);
      setEnviadoPara(destino);
      setEspera(ESPERA_REENVIO_S);
      if (reenvio) mostrarAviso({ tipo: "info", titulo: "Link reenviado", descricao: `Confira a caixa de entrada de ${destino}.` });
    } catch {
      setFalhaEnvio(true);
    } finally {
      setEnviando(false);
    }
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const mensagem = !email.trim()
      ? "Informe o e-mail da sua conta."
      : !emailValido(email)
        ? "Digite um e-mail válido, como nome@escola.com."
        : undefined;
    setErro(mensagem);
    if (mensagem) {
      document.getElementById(ID_EMAIL)?.focus();
      return;
    }
    solicitar();
  }

  const voltar = (
    <Link href="/login" className={estilos.voltar}>
      <IconeSetaEsquerda aria-hidden="true" /> Voltar para o login
    </Link>
  );

  if (enviadoPara) {
    return (
      <>
        {voltar}
        <EstadoVazio
          icone={<IconeEmail />}
          titulo="Verifique seu e-mail"
          descricao={
            <>
              Se houver uma conta para <span className={estilos.destaque}>{enviadoPara}</span>, você receberá um link
              para criar uma nova senha. Confira também a caixa de spam.
            </>
          }
          acao={
            <div className={estilos.acoesConfirmacao}>
              <Botao variante="secundario" larguraTotal carregando={enviando} disabled={espera > 0} onClick={() => solicitar(true)}>
                {espera > 0 ? `Reenviar em ${espera}s` : "Reenviar link"}
              </Botao>
              <Botao variante="fantasma" larguraTotal onClick={() => setEnviadoPara(null)}>
                Usar outro e-mail
              </Botao>
            </div>
          }
        />
      </>
    );
  }

  return (
    <>
      {voltar}
      <header className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>Recuperar senha</h1>
        <p className={estilos.subtitulo}>Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.</p>
      </header>

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        {falhaEnvio && (
          <Aviso tipo="perigo" embutido titulo="Não foi possível enviar o link" descricao="Tente novamente em alguns instantes." />
        )}
        <CampoTexto
          id={ID_EMAIL}
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nome@escola.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErro(undefined);
          }}
          erro={erro}
          autoFocus
        />
        <Botao type="submit" tamanho="g" larguraTotal carregando={enviando}>
          Enviar link de recuperação
        </Botao>
      </form>
    </>
  );
}
