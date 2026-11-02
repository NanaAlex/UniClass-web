"use client";

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { DescricaoCampo } from "@/components/ui/DescricaoCampo";
import { IconeFechar } from "@/components/ui/Icones";
import { separarEmails, type EmailConvite } from "@/lib/professores";
import campo from "@/components/ui/Campo.module.css";
import estilos from "./CampoEmails.module.css";

type CampoEmailsProps = {
  emails: EmailConvite[];
  aoAdicionar: (emails: string[]) => void;
  aoRemover: (indice: number) => void;
  erro?: string;
};

const SEPARADORES = ["Enter", ",", ";", " "];

/** Vários e-mails num campo só: cada um vira um chip, marcado em vermelho se não puder ser convidado. */
export function CampoEmails({ emails, aoAdicionar, aoRemover, erro }: CampoEmailsProps) {
  const id = useId();
  const refCampo = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");

  function confirmar(valor = texto) {
    const novos = separarEmails(valor);
    if (novos.length) aoAdicionar(novos);
    setTexto("");
  }

  function aoTeclar(evento: KeyboardEvent<HTMLInputElement>) {
    if (SEPARADORES.includes(evento.key) && texto.trim()) {
      evento.preventDefault();
      confirmar();
    } else if (evento.key === "Backspace" && !texto && emails.length) {
      aoRemover(emails.length - 1);
    }
  }

  function aoColar(evento: ClipboardEvent<HTMLInputElement>) {
    evento.preventDefault();
    confirmar(texto + " " + evento.clipboardData.getData("text"));
  }

  return (
    <div className={campo.grupo}>
      <label htmlFor={id} className={campo.rotulo}>
        E-mails dos professores
      </label>
      {/* Clicar em qualquer ponto da caixa leva o foco ao campo de digitação */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={[estilos.caixa, erro && estilos.comErro].filter(Boolean).join(" ")} onClick={() => refCampo.current?.focus()}>
        {emails.length > 0 && (
          <ul className={estilos.chips} aria-label="E-mails adicionados">
            {emails.map(({ email, problema }, i) => (
              <li key={`${email}-${i}`} className={[estilos.chip, problema && estilos.chipErro].filter(Boolean).join(" ")}>
                <span className={estilos.textoChip}>{email}</span>
                {problema && <span className={estilos.problema}>{problema}</span>}
                <button type="button" className={estilos.remover} onClick={() => aoRemover(i)} aria-label={`Remover ${email}`}>
                  <IconeFechar />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={refCampo}
          id={id}
          type="email"
          multiple
          className={estilos.campo}
          value={texto}
          placeholder={emails.length ? "Adicionar outro e-mail" : "nome@fatec.sp.gov.br"}
          aria-invalid={erro ? true : undefined}
          aria-describedby={`${id}-descricao`}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={aoTeclar}
          onPaste={aoColar}
          onBlur={() => confirmar()}
        />
      </div>
      <DescricaoCampo id={`${id}-descricao`} erro={erro} dica="Separe por vírgula, espaço ou Enter. Também dá para colar uma lista." />
    </div>
  );
}
