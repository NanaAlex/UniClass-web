"use client";

import { useEffect, useState, type ReactNode } from "react";
import { baixarImagemApi, URL_API } from "@/services/api";

type ImagemApiProps = {
  src: string;
  alt: string;
  className?: string;
  /** Mostrado enquanto carrega ou se a imagem não existir (ex.: as iniciais). */
  reserva?: ReactNode;
};

/**
 * Imagem que pode vir de uma rota protegida da API (foto do professor).
 * Endereços da API são baixados com o token; os demais (blob:, mocks) vão direto para o <img>.
 */
export function ImagemApi({ src, alt, className, reserva = null }: ImagemApiProps) {
  const protegida = src.startsWith(URL_API);
  const [endereco, setEndereco] = useState<string | null>(protegida ? null : src);

  useEffect(() => {
    if (!protegida) {
      setEndereco(src);
      return;
    }

    let ativo = true;
    let urlLocal: string | null = null;
    setEndereco(null);

    baixarImagemApi(src)
      .then((blob) => {
        if (!ativo || !blob) return;
        urlLocal = URL.createObjectURL(blob);
        setEndereco(urlLocal);
      })
      .catch(() => {
        // sem a imagem, fica a reserva (iniciais)
      });

    return () => {
      ativo = false;
      if (urlLocal) URL.revokeObjectURL(urlLocal);
    };
  }, [src, protegida]);

  if (!endereco) return <>{reserva}</>;

  // Endereço blob: local; next/image não otimiza esse tipo de endereço
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={endereco} alt={alt} className={className} />;
}
