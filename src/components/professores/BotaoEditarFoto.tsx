"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Botao } from "@/components/ui/Botao";
import { IconeCamera } from "@/components/ui/Icones";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { TAMANHO_MAXIMO_FOTO_MB } from "@/lib/professores";
import { atualizarFotoProfessor } from "@/services/professores";
import type { ProfessorComSituacao } from "@/types";

type BotaoEditarFotoProps = {
  professorId: string;
  aoAtualizar: (professor: ProfessorComSituacao) => void;
};

/** Protótipo "Editar foto": escolhe uma imagem do computador (JPG, PNG ou WebP, até 2 MB). */
export function BotaoEditarFoto({ professorId, aoAtualizar }: BotaoEditarFotoProps) {
  const { mostrarAviso } = useAvisos();
  const refArquivo = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEscolher(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      return mostrarAviso({ tipo: "perigo", titulo: "Arquivo não é uma imagem", descricao: "Escolha uma foto em JPG, PNG ou WebP." });
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO_MB * 1024 * 1024) {
      return mostrarAviso({ tipo: "perigo", titulo: "Foto muito grande", descricao: `O limite é ${TAMANHO_MAXIMO_FOTO_MB} MB.` });
    }

    setEnviando(true);
    try {
      aoAtualizar(await atualizarFotoProfessor(professorId, URL.createObjectURL(arquivo)));
      mostrarAviso({ tipo: "sucesso", titulo: "Foto atualizada" });
    } catch {
      mostrarAviso({ tipo: "perigo", titulo: "Não foi possível trocar a foto", descricao: "Tente novamente." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <input
        ref={refArquivo}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="apenas-leitor"
        tabIndex={-1}
        aria-hidden="true"
        onChange={aoEscolher}
      />
      <Botao variante="fantasma" tamanho="p" icone={<IconeCamera />} carregando={enviando} onClick={() => refArquivo.current?.click()}>
        Editar foto
      </Botao>
    </>
  );
}
