import { Aviso } from "./Aviso";
import { Botao } from "./Botao";
import estilos from "./ErroCarregamento.module.css";

type ErroCarregamentoProps = {
  /** Ex.: "Não foi possível carregar os horários". */
  titulo: string;
  descricao?: string;
  aoTentarNovamente: () => void;
};

/** Estado de erro padrão das telas que carregam dados: aviso + "Tentar novamente". */
export function ErroCarregamento({
  titulo,
  descricao = "Verifique sua conexão e tente novamente.",
  aoTentarNovamente,
}: ErroCarregamentoProps) {
  return (
    <div className={estilos.erro}>
      <Aviso tipo="perigo" embutido titulo={titulo} descricao={descricao} />
      <Botao variante="secundario" onClick={aoTentarNovamente}>
        Tentar novamente
      </Botao>
    </div>
  );
}
