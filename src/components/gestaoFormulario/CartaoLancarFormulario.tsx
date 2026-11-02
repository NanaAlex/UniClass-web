"use client";

import { useState, type FormEvent } from "react";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import {
  deCampoData,
  paraCampoData,
  periodoDoNome,
  temErros,
  validarLancamento,
  type ErrosFormulario,
} from "@/lib/gestaoFormulario";
import type { DadosLancamento } from "@/services/formularios";
import estilos from "./GestaoFormulario.module.css";

type CartaoLancarFormularioProps = {
  /** Se a Promise falhar, os campos continuam preenchidos para tentar de novo. */
  aoLancar: (dados: DadosLancamento) => Promise<void>;
};

/** RF 2.7, RF 2.8: nome e período de respostas; encerra sozinho na data de término. */
export function CartaoLancarFormulario({ aoLancar }: CartaoLancarFormularioProps) {
  const [nome, setNome] = useState("");
  const [inicio, setInicio] = useState(() => paraCampoData(new Date().toISOString()));
  const [fim, setFim] = useState("");
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [enviando, setEnviando] = useState(false);

  function limparErro(campo: keyof ErrosFormulario) {
    if (erros[campo]) setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const encontrados = validarLancamento({ nome, inicio, fim });
    setErros(encontrados);
    if (temErros(encontrados)) return;

    setEnviando(true);
    try {
      await aoLancar({
        nome: nome.trim(),
        periodoLetivo: periodoDoNome(nome, inicio),
        inicio: deCampoData(inicio),
        fim: deCampoData(fim),
      });
    } catch {
      setEnviando(false);
    }
  }

  return (
    <Cartao
      titulo="Lançar formulário"
      descricao="Os professores são notificados quando o período começa e o formulário encerra sozinho na data de término."
    >
      <form className={estilos.lancamento} onSubmit={enviar} noValidate aria-label="Lançar formulário">
        <CampoTexto
          rotulo="Nome"
          required
          className={estilos.campoNome}
          placeholder="Ex.: Disponibilidade 2027.1"
          dica={nome.trim() ? `Período letivo: ${periodoDoNome(nome, inicio)}` : undefined}
          value={nome}
          erro={erros.nome}
          disabled={enviando}
          onChange={(e) => {
            setNome(e.target.value);
            limparErro("nome");
          }}
        />
        <CampoTexto
          rotulo="Data de início"
          type="datetime-local"
          required
          value={inicio}
          erro={erros.inicio}
          disabled={enviando}
          onChange={(e) => {
            setInicio(e.target.value);
            limparErro("inicio");
          }}
        />
        <CampoTexto
          rotulo="Data de término"
          type="datetime-local"
          required
          min={inicio}
          value={fim}
          erro={erros.fim}
          disabled={enviando}
          onChange={(e) => {
            setFim(e.target.value);
            limparErro("fim");
          }}
        />
        <div className={estilos.acaoLancamento}>
          <Botao type="submit" carregando={enviando}>
            Lançar formulário
          </Botao>
        </div>
      </form>
    </Cartao>
  );
}
