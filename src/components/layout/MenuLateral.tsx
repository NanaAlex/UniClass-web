"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImagemApi } from "@/components/ui/ImagemApi";
import { iniciais } from "@/lib/formatacao";
import type { UsuarioLogado } from "@/types";
import { IconeMenu, type NomeIcone } from "./IconeMenu";
import estilos from "./MenuLateral.module.css";

export type ItemMenu = {
  rotulo: string;
  href: string;
  icone: NomeIcone;
  /** Número de pendências (ex.: solicitações não lidas). */
  contador?: number;
};

type MenuLateralProps = {
  itens: ItemMenu[];
  usuario: UsuarioLogado;
  hrefConfiguracoes: string;
  hrefSair?: string;
  /** Com ele, a foto e o nome do usuário levam à tela de perfil. */
  hrefPerfil?: string;
  /** Força a rota ativa (prévias em /dev). Por padrão usa a rota atual. */
  caminhoAtivo?: string;
};

function estaAtivo(caminho: string, href: string) {
  return caminho === href || caminho.startsWith(`${href}/`);
}

function ItemNavegacao({ item, ativo }: { item: ItemMenu; ativo: boolean }) {
  const temContador = item.contador !== undefined && item.contador > 0;
  return (
    <li>
      <Link
        href={item.href}
        className={estilos.item}
        aria-current={ativo ? "page" : undefined}
        title={item.rotulo}
      >
        <IconeMenu nome={item.icone} />
        <span className={estilos.rotuloItem}>{item.rotulo}</span>
        {temContador && (
          <span className={estilos.contador}>
            {item.contador}
            <span className="apenas-leitor"> pendentes</span>
          </span>
        )}
      </Link>
    </li>
  );
}

/** Foto (ou iniciais), nome e perfil; com hrefPerfil, vira link para a tela de perfil. */
function BlocoUsuario({ usuario, hrefPerfil, ativo }: { usuario: UsuarioLogado; hrefPerfil?: string; ativo: boolean }) {
  const textoIniciais = iniciais(usuario.nome);
  const conteudo = (
    <>
      <span className={estilos.avatar} aria-hidden="true">
        {usuario.fotoUrl ? (
          <ImagemApi src={usuario.fotoUrl} alt="" className={estilos.fotoAvatar} reserva={textoIniciais} />
        ) : (
          textoIniciais
        )}
      </span>
      <span className={estilos.dadosUsuario}>
        <span className={estilos.nomeUsuario}>{usuario.nome}</span>
        <span className={estilos.perfilUsuario}>
          {usuario.descricao ?? (usuario.perfil === "administrador" ? "Administrador" : "Professor")}
        </span>
      </span>
    </>
  );

  if (!hrefPerfil) {
    return (
      <div className={estilos.usuario} title={`${usuario.nome} — ${usuario.descricao ?? ""}`}>
        {conteudo}
      </div>
    );
  }

  return (
    <Link
      href={hrefPerfil}
      className={`${estilos.usuario} ${estilos.usuarioLink}`}
      title={`${usuario.nome} — editar meu perfil`}
      aria-label={`Meu perfil: ${usuario.nome}`}
      aria-current={ativo ? "page" : undefined}
    >
      {conteudo}
    </Link>
  );
}

export function MenuLateral({ itens, usuario, hrefConfiguracoes, hrefSair = "/sair", hrefPerfil, caminhoAtivo }: MenuLateralProps) {
  const caminhoAtual = usePathname();
  const caminho = caminhoAtivo ?? caminhoAtual ?? "";

  return (
    <aside className={estilos.menu}>
      <Link href={itens[0]?.href ?? "/"} className={estilos.marca} aria-label="Staggy — início">
        <span className={estilos.monograma} aria-hidden="true">
          S
        </span>
        <span className={estilos.nomeMarca}>Staggy</span>
      </Link>

      <nav className={estilos.navegacao} aria-label="Principal">
        <p className={estilos.rotuloSecao}>Menu</p>
        <ul className={estilos.lista}>
          {itens.map((item) => (
            <ItemNavegacao key={item.href} item={item} ativo={estaAtivo(caminho, item.href)} />
          ))}
        </ul>
      </nav>

      <div className={estilos.rodape}>
        <ul className={estilos.lista}>
          <ItemNavegacao
            item={{ rotulo: "Configurações", href: hrefConfiguracoes, icone: "configuracoes" }}
            ativo={estaAtivo(caminho, hrefConfiguracoes)}
          />
          <ItemNavegacao item={{ rotulo: "Sair", href: hrefSair, icone: "sair" }} ativo={false} />
        </ul>

        <BlocoUsuario usuario={usuario} hrefPerfil={hrefPerfil} ativo={!!hrefPerfil && estaAtivo(caminho, hrefPerfil)} />
      </div>
    </aside>
  );
}
