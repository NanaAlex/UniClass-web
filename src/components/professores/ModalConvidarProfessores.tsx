"use client";

import { useEffect, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import { analisarEmails } from "@/lib/professores";
import { convidarProfessores, type ResultadoConvite } from "@/services/professores";
import type { Professor } from "@/types";
import { CampoEmails } from "./CampoEmails";

type ModalConvidarProfessoresProps = {
  aberto: boolean;
  aoFechar: () => void;
  /** Para avisar quem já está na lista. */
  professoresDoCurso: Pick<Professor, "email">[];
  aoConvidar: (resultados: ResultadoConvite[]) => void;
};

/** RF 8.1, RF 1.13: convida um ou mais professores pelo e-mail. */
export function ModalConvidarProfessores({ aberto, aoFechar, professoresDoCurso, aoConvidar }: ModalConvidarProfessoresProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [erro, setErro] = useState<string>();
  const [enviando, setEnviando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setEmails([]);
    setErro(undefined);
    setFalhou(false);
  }, [aberto]);

  const analisados = analisarEmails(emails, professoresDoCurso);
  const comProblema = analisados.filter((e) => e.problema).length;
  const validos = analisados.length - comProblema;

  async function enviar() {
    if (emails.length === 0) return setErro("Adicione pelo menos um e-mail.");
    if (comProblema > 0) return setErro("Corrija ou remova os e-mails destacados em vermelho.");
    setEnviando(true);
    setFalhou(false);
    try {
      aoConvidar(await convidarProfessores(emails));
    } catch {
      setFalhou(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      aoFechar={enviando ? () => {} : aoFechar}
      titulo="Convidar professores"
      descricao="Cada professor recebe por e-mail um link para criar a conta. Quem já usa o Staggy em outro curso recebe um convite para se vincular a este."
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={enviando}>
            Cancelar
          </Botao>
          <Botao onClick={enviar} carregando={enviando}>
            {validos > 1 ? `Enviar ${validos} convites` : "Enviar convite"}
          </Botao>
        </>
      }
    >
      {falhou && (
        <Aviso tipo="perigo" embutido titulo="Os convites não foram enviados" descricao="Os e-mails continuam aqui. Tente novamente." />
      )}
      <CampoEmails
        emails={analisados}
        erro={erro}
        aoAdicionar={(novos) => {
          setEmails((atuais) => [...atuais, ...novos]);
          setErro(undefined);
        }}
        aoRemover={(indice) => {
          setEmails((atuais) => atuais.filter((_, i) => i !== indice));
          setErro(undefined);
        }}
      />
    </Modal>
  );
}
