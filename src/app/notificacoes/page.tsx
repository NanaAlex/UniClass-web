'use client';

import { useState } from 'react';
import {
  Search,
  ChevronDown,
  X,
  Send
} from 'lucide-react';

import Header from '../components/Header';
import NavBar from '../components/NavBar';

import styles from '../../styles/TelaListaNotificacoes.module.css';

type AbaNotificacao = 'avisos' | 'excluidos';

interface Notificacao {
  id: number;
  tempo: string;
  titulo: string;
  mensagem: string;
}

const notificacoesMock: Notificacao[] = [
  {
    id: 1,
    tempo: 'Há 6 dias',
    titulo: 'Frequência pendente',
    mensagem:
      'Olá, professor(a). Identificamos que a frequência da aula de hoje ainda não foi registrada no diário de classe. Acesse o sistema escolar assim que possível para atualizar as presenças e faltas dos alunos.',
  },
  {
    id: 2,
    tempo: 'Há 1 semana',
    titulo: 'Lançamento de notas',
    mensagem:
      'Olá, professor(a). O prazo para lançamento das notas está se aproximando. Verifique suas turmas no sistema e finalize os registros avaliativos para manter as informações acadêmicas atualizadas.',
  },
  {
    id: 3,
    tempo: 'Há 2 semanas',
    titulo: 'Comunicado da coordenação',
    mensagem:
      'Olá, professor(a). A coordenação publicou um novo comunicado com orientações importantes para a rotina escolar. Acesse o sistema para ler a mensagem completa.',
  },
  {
    id: 4,
    tempo: 'Há 3 semanas',
    titulo: 'Reunião pedagógica',
    mensagem:
      'Olá, professor(a). Uma reunião pedagógica foi agendada e sua participação é importante. Consulte no calendário escolar a data, o horário e as informações relacionadas ao encontro.',
  },
  {
    id: 5,
    tempo: 'Há 3 semanas',
    titulo: 'Reunião pedagógica',
    mensagem:
      'Olá, professor(a). Uma reunião pedagógica foi agendada e sua participação é importante. Consulte no calendário escolar a data, o horário e as informações relacionadas ao encontro.',
  },
  {
    id: 6,
    tempo: 'Há 3 semanas',
    titulo: 'Reunião pedagógica',
    mensagem:
      'Olá, professor(a). Uma reunião pedagógica foi agendada e sua participação é importante. Consulte no calendário escolar a data, o horário e as informações relacionadas ao encontro.',
  },
  {
    id: 7,
    tempo: 'Há 3 semanas',
    titulo: 'Reunião pedagógica',
    mensagem:
      'Olá, professor(a). Uma reunião pedagógica foi agendada e sua participação é importante. Consulte no calendário escolar a data, o horário e as informações relacionadas ao encontro.',
  },
  {
    id: 8,
    tempo: 'Há 3 semanas',
    titulo: 'Reunião pedagógica',
    mensagem:
      'Olá, professor(a). Uma reunião pedagógica foi agendada e sua participação é importante. Consulte no calendário escolar a data, o horário e as informações relacionadas ao encontro.',
  },
  {
    id: 9,
    tempo: 'Há 3 semanas',
    titulo: 'Reunião pedagógica',
    mensagem:
      'Olá, professor(a). Uma reunião pedagógica foi agendada e sua participação é importante. Consulte no calendário escolar a data, o horário e as informações relacionadas ao encontro.',
  },
  {
    id: 10,
    tempo: 'Há 3 semanas',
    titulo: 'Reunião pedagógica',
    mensagem:
      'Olá, professor(a). Uma reunião pedagógica foi agendada e sua participação é importante. Consulte no calendário escolar a data, o horário e as informações relacionadas ao encontro.',
  },
  {
    id: 11,
    tempo: 'Há 3 semanas',
    titulo: 'Reunião pedagógica',
    mensagem:
      'Olá, professor(a). Uma reunião pedagógica foi agendada e sua participação é importante. Consulte no calendário escolar a data, o horário e as informações relacionadas ao encontro.',
  },
];

export default function TelaNotificacoes() {

    function fecharELimparModal() {
      setAgendamento('');
      setAno('');
      setTurma('');
      setPeriodo('');
      setDestinatario('');
      setTituloNotificacao('');
      setConteudo('');

      setModalAberto(false);
    }

  const [abaSelecionada, setAbaSelecionada] =
    useState<AbaNotificacao>('avisos');

  const [
    notificacoesSelecionadas,
    setNotificacoesSelecionadas
  ] = useState<number[]>([1, 2]);

  const [pesquisa, setPesquisa] = useState('');

  /* ==========================================
     MODAL
  ========================================== */

  const [modalAberto, setModalAberto] =
    useState(false);

  const [agendamento, setAgendamento] =
    useState('');

  const [ano, setAno] =
    useState('');

  const [turma, setTurma] =
    useState('');

  const [periodo, setPeriodo] =
    useState('');

  const [destinatario, setDestinatario] =
    useState('');

  const [tituloNotificacao, setTituloNotificacao] =
    useState('');

  const [conteudo, setConteudo] =
    useState('');

  /* ==========================================
     NOTIFICAÇÕES
  ========================================== */

  const alternarNotificacao = (id: number) => {

    setNotificacoesSelecionadas(
      (selecionadas) => {

        if (selecionadas.includes(id)) {

          return selecionadas.filter(
            (notificacaoId) =>
              notificacaoId !== id
          );
        }

        return [
          ...selecionadas,
          id
        ];
      }
    );
  };

  const selecionarTodas = () => {

    if (
      notificacoesSelecionadas.length ===
      notificacoesMock.length
    ) {

      setNotificacoesSelecionadas([]);

      return;
    }

    setNotificacoesSelecionadas(
      notificacoesMock.map(
        (notificacao) =>
          notificacao.id
      )
    );
  };

  const todasSelecionadas =
    notificacoesSelecionadas.length ===
    notificacoesMock.length;

  /* ==========================================
     MODAL
  ========================================== */

  function abrirModal() {
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function handleEnviar() {

    /*
      Apenas visual por enquanto.
      Aqui futuramente poderá entrar
      a chamada para a API.
    */

    console.log({
      agendamento,
      ano,
      turma,
      periodo,
      destinatario,
      tituloNotificacao,
      conteudo
    });
  }

  return (
    <main className={styles.paginaNotificacoes}>

      {/* HEADER */}

      <div
        className={
          styles.headerTelaNotificacoes
        }
      >
        <Header />
      </div>

      <div className={styles.telaNotificacoes}>

        {/* NAVBAR */}

        <div className={styles.menuLateral}>
          <NavBar />
        </div>

        {/* CONTEÚDO */}

        <div
          className={
            styles.containerConteudos
          }
        >

          {/* ==========================================
              PARTE SUPERIOR
          ========================================== */}

          <div
            className={
              styles.parteSuperior
            }
          >

            <div
              className={
                styles.cabecalhoConteudo
              }
            >

              <h1
                className={
                  styles.tituloPagina
                }
              >
                Notificações
              </h1>

              <div className={styles.abas}>

                <button
                  type="button"
                  className={`${styles.botaoAba} ${
                    abaSelecionada === 'avisos'
                      ? styles.botaoAbaSelecionado
                      : ''
                  }`}
                  onClick={() =>
                    setAbaSelecionada(
                      'avisos'
                    )
                  }
                >
                  Todos os Avisos
                </button>

                <button
                  type="button"
                  className={`${styles.botaoAba} ${
                    abaSelecionada === 'excluidos'
                      ? styles.botaoAbaSelecionado
                      : ''
                  }`}
                  onClick={() =>
                    setAbaSelecionada(
                      'excluidos'
                    )
                  }
                >
                  Excluídos
                </button>

              </div>
            </div>

            {/* PESQUISA */}

            <div
              className={
                styles.areaPesquisa
              }
            >

              <Search
                className={
                  styles.iconePesquisa
                }
                size={20}
                strokeWidth={2}
              />

              <input
                type="text"
                value={pesquisa}
                onChange={(event) =>
                  setPesquisa(
                    event.target.value
                  )
                }
                placeholder="Pesquise por nome"
                className={
                  styles.inputPesquisa
                }
              />

            </div>
          </div>

          {/* ==========================================
              PARTE INFERIOR
          ========================================== */}

          <div
            className={
              styles.parteInferior
            }
          >

            {/* FILTROS */}

            <div className={styles.filtros}>

              <button
                type="button"
                className={
                  styles.botaoFiltro
                }
              >
                Data

                <ChevronDown size={16} />
              </button>

              <button
                type="button"
                className={
                  styles.botaoFiltro
                }
              >
                Não Lido
              </button>

              <button
                type="button"
                className={
                  styles.botaoFiltro
                }
              >
                Excluir Avisos de Sistema
              </button>

              <button
                type="button"
                className={
                  styles.botaoFiltro
                }
              >
                Com anexo
              </button>

            </div>

            {/* AÇÕES */}

            <div className={styles.acoes}>

              <button
                type="button"
                className={
                  styles.selecionarTudo
                }
                onClick={
                  selecionarTodas
                }
              >

                <span>
                  Selecionar Tudo
                </span>

                <span
                  className={`${styles.checkboxSelecionarTudo} ${
                    todasSelecionadas
                      ? styles.checkboxSelecionarTudoMarcado
                      : ''
                  }`}
                >
                  {todasSelecionadas &&
                    '✓'}
                </span>

              </button>

              <button
                type="button"
                className={
                  styles.botaoRecuperar
                }
              >
                Recuperar
              </button>

              <button
                type="button"
                className={
                  styles.botaoExcluir
                }
              >
                Excluir
              </button>

            </div>

            {/* ==========================================
                LISTA
            ========================================== */}

            <div
              className={
                styles.listaDeNotificacoes
              }
            >

              {notificacoesMock.map(
                (notificacao) => {

                  const selecionada =
                    notificacoesSelecionadas.includes(
                      notificacao.id
                    );

                  return (
                    <div
                      key={notificacao.id}
                      className={`${styles.notificacao} ${
                        selecionada
                          ? styles.notificacaoSelecionada
                          : ''
                      }`}
                      onClick={() =>
                        alternarNotificacao(
                          notificacao.id
                        )
                      }
                    >

                      <div
                        className={
                          styles.linhaTempo
                        }
                      >

                        <input
                          type="checkbox"
                          checked={
                            selecionada
                          }
                          className={
                            styles.checkboxNotificacao
                          }
                          onChange={() =>
                            alternarNotificacao(
                              notificacao.id
                            )
                          }
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          aria-label={`Selecionar ${notificacao.titulo}`}
                        />

                        <span
                          className={
                            styles.tempoNotificacao
                          }
                        >
                          {notificacao.tempo}
                        </span>

                      </div>

                      <div
                        className={
                          styles.cabecalhoNotificacao
                        }
                      >
                        <span
                          className={
                            styles.tituloNotificacao
                          }
                        >
                          {notificacao.titulo}
                        </span>
                      </div>

                      <div
                        className={
                          styles.conteudoNotificacao
                        }
                      >
                        {notificacao.mensagem}
                      </div>

                    </div>
                  );
                }
              )}

            </div>

            <div
              className={
                styles.avisoExclusao
              }
            >
              Essas notificações serão
              excluídas automaticamente
              depois de 30 dias.
            </div>

          </div>

          {/* ==========================================
              BOTÃO MANDAR NOTIFICAÇÃO
          ========================================== */}

          <button
            type="button"
            className={
              styles.botaoMandarNotificacao
            }
            onClick={abrirModal}
          >
            MANDAR NOTIFICAÇÃO +
          </button>

        </div>
      </div>

      {/* ==========================================
          MODAL
      ========================================== */}

      {modalAberto && (

        <div
          className={
            styles.overlayModal
          }
        >

          <div
            className={
              styles.modalNotificacao
            }
          >

            <div
              className={
                styles.conteudoModal
                
              }
            >

              <h2
                className={
                  styles.tituloModal
                }
              >
                Enviar Notificação
              </h2>
              
              <div
                className={
                  styles.linhaFiltrosModal
                }
              >

                <select
                  value={agendamento}
                  onChange={(event) =>
                    setAgendamento(
                      event.target.value
                    )
                  }
                  className={
                    styles.selectModal
                  }
                >
                  <option value="">
                    Agendar Data
                  </option>

                  <option value="hoje">
                    Hoje
                  </option>

                  <option value="amanha">
                    Amanhã
                  </option>
                </select>

                <select
                  value={ano}
                  onChange={(event) =>
                    setAno(
                      event.target.value
                    )
                  }
                  className={
                    styles.selectModal
                  }
                >
                  <option value="">
                    Ano
                  </option>

                  <option value="1">
                    1º Ano
                  </option>

                  <option value="2">
                    2º Ano
                  </option>

                  <option value="3">
                    3º Ano
                  </option>
                </select>

                <select
                  value={turma}
                  onChange={(event) =>
                    setTurma(
                      event.target.value
                    )
                  }
                  className={
                    styles.selectModal
                  }
                >
                  <option value="">
                    Turma
                  </option>

                  <option value="A">
                    Turma A
                  </option>

                  <option value="B">
                    Turma B
                  </option>

                  <option value="C">
                    Turma C
                  </option>
                </select>

                <select
                  value={periodo}
                  onChange={(event) =>
                    setPeriodo(
                      event.target.value
                    )
                  }
                  className={
                    styles.selectModal
                  }
                >
                  <option value="">
                    Período
                  </option>

                  <option value="matutino">
                    Matutino
                  </option>

                  <option value="vespertino">
                    Vespertino
                  </option>

                  <option value="noturno">
                    Noturno
                  </option>
                </select>

              </div>

              {/* PARA */}

              <input
                type="text"
                value={destinatario}
                onChange={(event) =>
                  setDestinatario(
                    event.target.value
                  )
                }
                placeholder="Para:"
                className={
                  styles.inputModal
                }
              />

              {/* TÍTULO + ANEXO */}

              <div
                className={
                  styles.linhaTituloModal
                }
              >

                <input
                  type="text"
                  value={
                    tituloNotificacao
                  }
                  onChange={(event) =>
                    setTituloNotificacao(
                      event.target.value
                    )
                  }
                  placeholder="Título:"
                  className={
                    styles.inputTituloModal
                  }
                />

                <label
                  className={
                    styles.botaoAnexo
                  }
                >
                  Adicionar Anexo +

                  <input
                    type="file"
                    className={
                      styles.inputArquivo
                    }
                  />
                </label>

              </div>

              {/* CONTEÚDO */}

              <div
                className={
                  styles.areaConteudoModal
                }
              >

                <textarea
                  value={conteudo}
                  maxLength={400}
                  onChange={(event) =>
                    setConteudo(
                      event.target.value
                    )
                  }
                  placeholder="Conteúdo:"
                  className={
                    styles.textareaModal
                  }
                />

                <span
                  className={
                    styles.contadorCaracteres
                  }
                >
                  {conteudo.length}/400 caracteres
                </span>

              </div>

              {/* ENVIAR */}

              <button
                type="button"
                className={
                  styles.botaoEnviar
                }
                onClick={handleEnviar}
              >
                ENVIAR

                <Send
                  size={17}
                  fill="currentColor"
                />
              </button>

            </div>

          </div>

          {/* BOTÃO FECHAR */}

          <button
            type="button"
            className={
              styles.botaoFecharModal
            }
            onClick={fecharModal}
            aria-label="Fechar modal"
          >
            <X
              size={39}
              strokeWidth={4}
            />
          </button>

        </div>
      )}

    </main>
  );
}