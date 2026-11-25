import { LinkVoltar } from "@/components/layout/LinkVoltar";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { formatarData } from "@/lib/formatacao";
import { etiquetasConta, nomeExibido } from "@/lib/professores";
import type { ProfessorComSituacao } from "@/types";
import { AcoesConta } from "./AcoesConta";
import { AvatarProfessor } from "./AvatarProfessor";
import { BotaoEditarFoto } from "./BotaoEditarFoto";
import estilos from "./CabecalhoPerfilProfessor.module.css";

type CabecalhoPerfilProfessorProps = {
  professor: ProfessorComSituacao;
  aoAtualizar: (professor: ProfessorComSituacao) => void;
  /** Tela de onde o perfil foi aberto. */
  voltar: { href: string; rotulo: string };
};

/** RF 8.6: foto, dados pessoais e situação da conta. */
export function CabecalhoPerfilProfessor({ professor, aoAtualizar, voltar }: CabecalhoPerfilProfessorProps) {
  const conta = etiquetasConta[professor.statusConta];

  return (
    <header className={estilos.cabecalho}>
      <LinkVoltar href={voltar.href} rotulo={voltar.rotulo} />

      <div className={estilos.perfil}>
        <div className={estilos.foto}>
          <AvatarProfessor professor={professor} tamanho="g" />
          <BotaoEditarFoto professorId={professor.id} aoAtualizar={aoAtualizar} />
        </div>

        <div className={estilos.dados}>
          <div className={estilos.linhaTitulo}>
            <h1 className={estilos.nome}>{nomeExibido(professor)}</h1>
            <Etiqueta variante={conta.variante} ponto>
              {conta.rotulo}
            </Etiqueta>
          </div>

          <dl className={estilos.lista} aria-label="Dados pessoais">
            <div>
              <dt>E-mail</dt>
              <dd>
                <a href={`mailto:${professor.email}`}>{professor.email}</a>
              </dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{professor.telefone ?? "Não informado"}</dd>
            </div>
            <div>
              <dt>{professor.statusConta === "convidado" ? "Convidado em" : "No curso desde"}</dt>
              <dd>{formatarData(professor.criadoEm)}</dd>
            </div>
            {professor.areas.length > 0 && (
              <div className={estilos.largo}>
                <dt>Áreas</dt>
                <dd className={estilos.areas}>
                  {professor.areas.map((area) => (
                    <Etiqueta key={area}>{area}</Etiqueta>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className={estilos.acoes}>
          <AcoesConta professor={professor} aoAtualizar={aoAtualizar} />
        </div>
      </div>
    </header>
  );
}
