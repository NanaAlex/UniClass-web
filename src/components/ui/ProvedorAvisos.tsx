"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Aviso, type TipoAviso } from "./Aviso";
import estilos from "./ProvedorAvisos.module.css";

type NovoAviso = {
  tipo?: TipoAviso;
  titulo: string;
  descricao?: string;
};

type AvisoAtivo = NovoAviso & { id: number };

type ContextoAvisos = {
  mostrarAviso: (aviso: NovoAviso) => void;
};

const DURACAO_MS = 5000;
const Contexto = createContext<ContextoAvisos | null>(null);

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<AvisoAtivo[]>([]);
  const proximoId = useRef(0);

  const fechar = useCallback((id: number) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
  }, []);

  const mostrarAviso = useCallback(
    (aviso: NovoAviso) => {
      const id = proximoId.current++;
      setAvisos((atuais) => [...atuais, { ...aviso, id }]);
      // Erros ficam na tela até o usuário fechar
      if (aviso.tipo !== "perigo") setTimeout(() => fechar(id), DURACAO_MS);
    },
    [fechar],
  );

  const valor = useMemo(() => ({ mostrarAviso }), [mostrarAviso]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div className={estilos.regiao}>
        {avisos.map((aviso) => (
          <div key={aviso.id} className={estilos.item}>
            <Aviso {...aviso} aoFechar={() => fechar(aviso.id)} />
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function useAvisos() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAvisos precisa estar dentro de <ProvedorAvisos>");
  return contexto;
}
