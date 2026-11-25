"use client";

import { useState } from "react";
import { CabecalhoPagina } from "@/components/layout/CabecalhoPagina";
import { BarraPesquisa } from "@/components/ui/BarraPesquisa";
import { Botao } from "@/components/ui/Botao";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { IconeMais } from "@/components/ui/Icones";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { contarPorFiltro, filtrarProfessores, ordenarPorNome, type FiltroProfessores as Filtro } from "@/lib/professores";
import type { ResultadoConvite } from "@/services/professores";
import { FiltroProfessores } from "./FiltroProfessores";
import { ListaProfessores } from "./ListaProfessores";
import { ModalConvidarProfessores } from "./ModalConvidarProfessores";
import { useProfessores } from "./useProfessores";
import estilos from "./PainelProfessores.module.css";

/** Aba Professores do administrador (RF 8.1–8.5). */
export function PainelProfessores() {
  const { mostrarAviso } = useAvisos();
  const { professores, falhou, recarregar, adicionar } = useProfessores();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [convidando, setConvidando] = useState(false);

  const visiveis = professores && ordenarPorNome(filtrarProfessores(professores, busca, filtro));
  const contadores = contarPorFiltro(professores ?? []);
  const comFiltro = busca.trim() !== "" || filtro !== "todos";

  function aoConvidar(resultados: ResultadoConvite[]) {
    adicionar(resultados.map((r) => r.professor));
    setConvidando(false);
    setBusca("");
    setFiltro("todos");
    const vinculos = resultados.filter((r) => r.jaTinhaConta).length;
    mostrarAviso({
      tipo: "sucesso",
      titulo: resultados.length === 1 ? "Convite enviado" : `${resultados.length} convites enviados`,
      descricao:
        vinculos > 0
          ? `${vinculos === 1 ? "Um professor já tinha" : `${vinculos} professores já tinham`} conta no Staggy e vai receber um convite de vínculo.`
          : "Os professores aparecem na lista como \"Convite enviado\" até criarem a conta.",
    });
  }

  function limparFiltros() {
    setBusca("");
    setFiltro("todos");
  }

  const botaoConvidar = (
    <Botao icone={<IconeMais />} onClick={() => setConvidando(true)} disabled={!professores}>
      Convidar professores
    </Botao>
  );

  return (
    <>
      <CabecalhoPagina
        titulo="Professores"
        subtitulo="Acompanhe quem respondeu o formulário, os pedidos de alteração e as contas do curso."
        acoes={botaoConvidar}
      />

      {falhou ? (
        <ErroCarregamento titulo="Não foi possível carregar os professores" aoTentarNovamente={recarregar} />
      ) : (
        <div className={estilos.painel}>
          <div className={estilos.controles}>
            <BarraPesquisa
              valor={busca}
              aoMudar={setBusca}
              placeholder="Buscar por nome ou e-mail"
              rotuloAcessivel="Buscar professores por nome ou e-mail"
              desabilitada={!professores}
            />
            <FiltroProfessores valor={filtro} aoMudar={setFiltro} contadores={contadores} desabilitado={!professores} />
          </div>

          {visiveis && (
            <p className={estilos.total} aria-live="polite">
              {visiveis.length === 1 ? "1 professor" : `${visiveis.length} professores`}
            </p>
          )}

          {visiveis?.length === 0 ? (
            comFiltro ? (
              <EstadoVazio
                contorno
                titulo="Nenhum professor encontrado"
                descricao="Nenhum professor corresponde à busca e ao filtro escolhidos."
                acao={
                  <Botao variante="secundario" onClick={limparFiltros}>
                    Limpar busca e filtro
                  </Botao>
                }
              />
            ) : (
              <EstadoVazio
                contorno
                titulo="Nenhum professor cadastrado"
                descricao="Convide os professores do curso pelo e-mail para que eles respondam o formulário."
                acao={botaoConvidar}
              />
            )
          ) : (
            <ListaProfessores professores={visiveis} />
          )}
        </div>
      )}

      <ModalConvidarProfessores
        aberto={convidando}
        aoFechar={() => setConvidando(false)}
        professoresDoCurso={professores ?? []}
        aoConvidar={aoConvidar}
      />
    </>
  );
}
