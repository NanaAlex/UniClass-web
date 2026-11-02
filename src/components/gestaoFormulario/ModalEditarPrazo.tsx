"use client";

import { useState, type FormEvent } from "react";
import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Modal } from "@/components/ui/Modal";
import { deCampoData, paraCampoData, temErros, validarPrazo, type ErrosFormulario } from "@/lib/gestaoFormulario";
import type { Formulario } from "@/types";
import estilos from "./GestaoFormulario.module.css";

type ModalEditarPrazoProps = {
  formulario: Formulario;
  /** O início só muda enquanto o período não começou. */
  inicioBloqueado: boolean;
  aoFechar: () => void;
  aoSalvar: (prazo: Pick<Formulario, "inicio" | "fim">) => Promise<void>;
};

/** RF 2.8. Montado só quando aberto, para sempre começar com as datas atuais. */
export function ModalEditarPrazo({ formulario, inicioBloqueado, aoFechar, aoSalvar }: ModalEditarPrazoProps) {
  const [inicio, setInicio] = useState(() => paraCampoData(formulario.inicio));
  const [fim, setFim] = useState(() => paraCampoData(formulario.fim));
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [salvando, setSalvando] = useState(false);

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    const encontrados = validarPrazo({ inicio, fim });
    setErros(encontrados);
    if (temErros(encontrados)) return;

    setSalvando(true);
    try {
      await aoSalvar({ inicio: deCampoData(inicio), fim: deCampoData(fim) });
    } catch {
      setSalvando(false);
    }
  }

  const idFormulario = "formulario-editar-prazo";

  return (
    <Modal
      aberto
      aoFechar={salvando ? () => {} : aoFechar}
      tamanho="p"
      titulo="Editar prazo"
      descricao={`Período de respostas de "${formulario.nome}".`}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={salvando}>
            Cancelar
          </Botao>
          <Botao type="submit" form={idFormulario} carregando={salvando}>
            Salvar prazo
          </Botao>
        </>
      }
    >
      <form id={idFormulario} className={estilos.camposModal} onSubmit={salvar} noValidate>
        <CampoTexto
          rotulo="Data de início"
          type="datetime-local"
          required
          value={inicio}
          erro={erros.inicio}
          disabled={inicioBloqueado || salvando}
          dica={inicioBloqueado ? "O período já começou; só o término pode mudar." : undefined}
          onChange={(e) => setInicio(e.target.value)}
        />
        <CampoTexto
          rotulo="Data de término"
          type="datetime-local"
          required
          min={inicio}
          value={fim}
          erro={erros.fim}
          disabled={salvando}
          dica="O formulário encerra automaticamente nesta data."
          onChange={(e) => {
            setFim(e.target.value);
            if (erros.fim) setErros((atuais) => ({ ...atuais, fim: undefined }));
          }}
        />
      </form>
    </Modal>
  );
}
