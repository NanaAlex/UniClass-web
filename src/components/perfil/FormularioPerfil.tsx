"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AvatarProfessor } from "@/components/professores/AvatarProfessor";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { ErroCarregamento } from "@/components/ui/ErroCarregamento";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { IconeCamera } from "@/components/ui/Icones";
import { useAvisos } from "@/components/ui/ProvedorAvisos";
import { formatarData, formatarTelefone } from "@/lib/formatacao";
import { TAMANHO_MAXIMO_FOTO_MB } from "@/lib/professores";
import { ErroApi } from "@/services/api";
import { enviarFoto, obterPerfil, removerFoto, salvarTelefone, type PerfilProfessor } from "@/services/perfil";
import estilos from "./FormularioPerfil.module.css";

const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

const soDigitos = (texto: string) => texto.replace(/\D/g, "");
const mensagemDoErro = (erro: unknown) => (erro instanceof ErroApi ? erro.message : "Tente novamente em alguns instantes.");

/** Perfil do professor: foto e telefone editáveis; nome e e-mail só para leitura. */
export function FormularioPerfil() {
  const router = useRouter();
  const { mostrarAviso } = useAvisos();
  const refArquivo = useRef<HTMLInputElement>(null);

  const [perfil, setPerfil] = useState<PerfilProfessor | null>(null);
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [erroTelefone, setErroTelefone] = useState<string>();
  const [novaFoto, setNovaFoto] = useState<{ arquivo: File; previa: string } | null>(null);
  const [removerFotoSalva, setRemoverFotoSalva] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setFalhaCarregamento(false);
    try {
      const dados = await obterPerfil();
      setPerfil(dados);
      setTelefone(dados.telefone ? formatarTelefone(dados.telefone) : "");
    } catch {
      setFalhaCarregamento(true);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Libera a prévia local quando ela é trocada ou a tela fecha
  useEffect(() => () => {
    if (novaFoto) URL.revokeObjectURL(novaFoto.previa);
  }, [novaFoto]);

  function aoEscolherFoto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;

    if (!TIPOS_FOTO.includes(arquivo.type)) {
      return mostrarAviso({ tipo: "perigo", titulo: "Formato não aceito", descricao: "Escolha uma foto em JPG, PNG ou WebP." });
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO_MB * 1024 * 1024) {
      return mostrarAviso({ tipo: "perigo", titulo: "Foto muito grande", descricao: `O limite é ${TAMANHO_MAXIMO_FOTO_MB} MB.` });
    }
    setNovaFoto({ arquivo, previa: URL.createObjectURL(arquivo) });
    setRemoverFotoSalva(false);
  }

  /** Descarta a foto escolhida e, se havia uma salva, marca para remover ao salvar. */
  function aoRemoverFoto() {
    setNovaFoto(null);
    if (perfil?.fotoUrl) setRemoverFotoSalva(true);
  }

  const fotoExibida = novaFoto?.previa ?? (removerFotoSalva ? undefined : perfil?.fotoUrl);
  const telefoneAlterado = perfil !== null && soDigitos(telefone) !== (perfil.telefone ?? "");
  const alterado = novaFoto !== null || removerFotoSalva || telefoneAlterado;

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault();
    if (!perfil || !alterado) return;

    const digitos = soDigitos(telefone);
    if (digitos && (digitos.length < 10 || digitos.length > 20 || /[^\d\s().+-]/.test(telefone))) {
      return setErroTelefone("Informe o DDD e o número, ex.: (11) 98765-4321.");
    }
    setErroTelefone(undefined);

    setSalvando(true);
    let etapa: "foto" | "telefone" = "foto";
    try {
      if (novaFoto || removerFotoSalva) {
        setPerfil(novaFoto ? await enviarFoto(novaFoto.arquivo) : await removerFoto());
        setNovaFoto(null);
        setRemoverFotoSalva(false);
        router.refresh(); // a foto também aparece no menu lateral, que vem do layout
      }
      if (telefoneAlterado) {
        etapa = "telefone";
        const dados = await salvarTelefone(telefone);
        setPerfil(dados);
        setTelefone(dados.telefone ? formatarTelefone(dados.telefone) : "");
      }
      mostrarAviso({ tipo: "sucesso", titulo: "Perfil salvo" });
    } catch (erro) {
      if (etapa === "telefone" && erro instanceof ErroApi && erro.status === 400) setErroTelefone(erro.message);
      else mostrarAviso({ tipo: "perigo", titulo: "Não foi possível salvar o perfil", descricao: mensagemDoErro(erro) });
    } finally {
      setSalvando(false);
    }
  }

  if (falhaCarregamento) {
    return <ErroCarregamento titulo="Não foi possível carregar o seu perfil" aoTentarNovamente={carregar} />;
  }

  if (!perfil) {
    return (
      <div className={estilos.perfil} aria-busy="true">
        <Cartao titulo="Foto">
          <div className={estilos.conteudoFoto}>
            <Esqueleto forma="circulo" largura="120px" altura="120px" />
          </div>
        </Cartao>
        <Cartao titulo="Dados pessoais">
          <Esqueleto largura="60%" />
          <Esqueleto largura="40%" />
        </Cartao>
      </div>
    );
  }

  return (
    <form className={estilos.perfil} onSubmit={aoSalvar} noValidate>
      <Cartao titulo="Foto">
        <div className={estilos.conteudoFoto}>
          <button
            type="button"
            className={estilos.foto}
            onClick={() => refArquivo.current?.click()}
            aria-label={fotoExibida ? "Trocar foto" : "Adicionar foto"}
            title={fotoExibida ? "Trocar foto" : "Adicionar foto"}
          >
            <AvatarProfessor professor={{ ...perfil, fotoUrl: fotoExibida }} tamanho="g" />
            <span className={estilos.iconeFoto} aria-hidden="true">
              <IconeCamera />
            </span>
          </button>

          {fotoExibida && (
            <button type="button" className={estilos.removerFoto} onClick={aoRemoverFoto}>
              Remover foto
            </button>
          )}
        </div>
        <input
          ref={refArquivo}
          type="file"
          accept={TIPOS_FOTO.join(",")}
          className="apenas-leitor"
          tabIndex={-1}
          aria-hidden="true"
          onChange={aoEscolherFoto}
        />
      </Cartao>

      <Cartao titulo="Dados pessoais">
        <dl className={estilos.lista} aria-label="Dados da conta">
          <div>
            <dt>Nome</dt>
            <dd>{perfil.nome}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{perfil.email}</dd>
          </div>
          {perfil.coordenacoes.length > 0 && (
            <div className={estilos.inteira}>
              <dt>{perfil.coordenacoes.length === 1 ? "Coordenação" : "Coordenações"}</dt>
              {perfil.coordenacoes.map((coordenacao) => (
                <dd key={coordenacao.id}>
                  {coordenacao.nome} <span className={estilos.desde}>· desde {formatarData(coordenacao.desde)}</span>
                </dd>
              ))}
            </div>
          )}
        </dl>

        <div className={estilos.campos}>
          <CampoTexto
            rotulo="Telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 98765-4321"
            maxLength={30}
            value={telefone}
            onChange={(evento) => setTelefone(evento.target.value)}
            erro={erroTelefone}
          />
        </div>

        <div className={estilos.acoes}>
          <Botao type="submit" carregando={salvando} disabled={!alterado}>
            Salvar
          </Botao>
        </div>
      </Cartao>
    </form>
  );
}
