"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sair } from "@/services/autenticacao";

/* 
   Logout (RF 1.3, CU-002)
   O item "Sair" do menu aponta para esta página. Ela avisa o
   back (POST /auth/logout grava encerrada_em na sessão), apaga
   o cookie e volta para o login.
   Se o back falhar, o cookie é apagado do mesmo jeito e o usuário sai do mesmo jeito.
*/

export default function PaginaSair() {
  const router = useRouter();

  useEffect(() => {
    sair()
      .catch(() => undefined)
      .finally(() => router.replace("/login"));
  }, [router]);

  return <p style={{ padding: 24 }}>Saindo...</p>;
}