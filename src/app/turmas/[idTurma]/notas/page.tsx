'use client'

import { useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../../../../styles/NotasDaTurma.module.css'
import Header from '../../../components/Header'
import NavBar from '../../../components/NavBar'

interface Turma {
  id: number
  serie: string
  turma: string
  periodo: string
  tipo: string
  media: number
  alunos: number
  cor: string
  imagem: string
}

interface NotaBimestre {
  prova: string
  trabalho: string
}

interface AlunoNotas {
  id: number
  nome: string
  matricula: string
  bimestres: [
    NotaBimestre,
    NotaBimestre,
    NotaBimestre,
    NotaBimestre
  ]
}

interface NotasDaTurmaProps {
  params: {
    idTurma: string
  }
}

const turmas: Turma[] = [
  {
    id: 1,
    serie: '1º',
    turma: 'A',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    media: 86.5,
    alunos: 30,
    cor: '#E53935',
    imagem: '/images/imgTurma.png'
  },
  {
    id: 2,
    serie: '1º',
    turma: 'B',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    media: 86.5,
    alunos: 30,
    cor: '#F57C00',
    imagem: '/images/imgTurma.png'
  },
  {
    id: 3,
    serie: '1º',
    turma: 'C',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    media: 86.5,
    alunos: 30,
    cor: '#FBC02D',
    imagem: '/images/imgTurma.png'
  },
  {
    id: 4,
    serie: '2º',
    turma: 'A',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    media: 86.5,
    alunos: 30,
    cor: '#7CB342',
    imagem: '/images/imgTurma.png'
  },
  {
    id: 5,
    serie: '2º',
    turma: 'B',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    media: 86.5,
    alunos: 30,
    cor: '#00897B',
    imagem: '/images/imgTurma.png'
  },
  {
    id: 6,
    serie: '2º',
    turma: 'C',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    media: 86.5,
    alunos: 30,
    cor: '#1E88E5',
    imagem: '/images/imgTurma.png'
  }
]

const alunosIniciais: AlunoNotas[] = Array.from(
  { length: 20 },
  (_, index) => ({
    id: index + 1,
    nome: 'Ana Beatriz Cardoso',
    matricula: ``,
    bimestres: [
      {
        prova: '9.2',
        trabalho: '8.4'
      },
      {
        prova: '9.2',
        trabalho: '8.4'
      },
      {
        prova: '9.2',
        trabalho: '8.4'
      },
      {
        prova: '9.2',
        trabalho: '8.4'
      }
    ]
  })
)

function getTurmaById(id: number): Turma | undefined {
  return turmas.find((turma) => turma.id === id)
}

function notaParaNumero(valor: string): number | null {
  if (valor.trim() === '') {
    return null
  }

  const numero = Number(valor.replace(',', '.'))

  if (Number.isNaN(numero)) {
    return null
  }

  return numero
}

function calcularTotal(bimestre: NotaBimestre): number | null {
  const prova = notaParaNumero(bimestre.prova)
  const trabalho = notaParaNumero(bimestre.trabalho)

  if (prova === null || trabalho === null) {
    return null
  }

  return (prova + trabalho) / 2
}

function calcularMediaFinal(aluno: AlunoNotas): number | null {
  const totais = aluno.bimestres.map((bimestre) =>
    calcularTotal(bimestre)
  )

  const possuiBimestreIncompleto = totais.some(
    (total) => total === null
  )

  if (possuiBimestreIncompleto) {
    return null
  }

  const soma = totais.reduce<number>(
    (acumulador, total) => acumulador + (total ?? 0),
    0
  )

  return soma / totais.length
}

function formatarNota(valor: number | null): string {
  if (valor === null) {
    return ''
  }

  return valor.toFixed(1)
}

function formatarNotaDigitada(valor: string): string {
  const numero = notaParaNumero(valor)

  if (numero === null) {
    return ''
  }

  return numero.toFixed(1)
}

function formatarPeriodo(periodo: string): string {
  return (
    periodo.charAt(0).toUpperCase() +
    periodo.slice(1).toLowerCase()
  )
}

export default function NotasDaTurma({
  params
}: NotasDaTurmaProps) {
  const router = useRouter()

  const idTurma = Number(params.idTurma)
  const turma = getTurmaById(idTurma)

  const [editandoNotas, setEditandoNotas] =
    useState<boolean>(false)

  const [alunos, setAlunos] =
    useState<AlunoNotas[]>(alunosIniciais)

  if (!turma) {
    return (
      <main className={styles.notasDaTurma}>
        <div className={styles.headerNotasDaTurma}>
          <Header />
        </div>

        <div className={styles.telaNotasDaTurma}>
          <div className={styles.menuLateral}>
            <NavBar />
          </div>

          <div className={styles.turmaNaoEncontrada}>
            Turma não encontrada.
          </div>
        </div>
      </main>
    )
  }

  function handleVoltar() {
    router.back()
  }

  function handleAlterarNota(
    alunoId: number,
    bimestreIndex: number,
    campo: 'prova' | 'trabalho',
    valorDigitado: string
  ) {
    const valorNormalizado = valorDigitado.replace(',', '.')

    /*
      Aceita:
      ""
      "9"
      "9."
      "9.2"
      "10"
      "10.0"

      Não permite letras ou mais de duas casas decimais.

      IMPORTANTE:
      O campo vazio é permitido, então o usuário consegue
      apagar completamente uma nota.
    */
    const formatoValido =
      /^(?:\d{1,2}(?:\.\d{0,2})?)?$/.test(
        valorNormalizado
      )

    if (!formatoValido) {
      return
    }

    setAlunos((alunosAtuais) =>
      alunosAtuais.map((aluno) => {
        if (aluno.id !== alunoId) {
          return aluno
        }

        const bimestresAtualizados =
          aluno.bimestres.map(
            (bimestre, index) => {
              if (index !== bimestreIndex) {
                return bimestre
              }

              return {
                ...bimestre,
                [campo]: valorNormalizado
              }
            }
          ) as AlunoNotas['bimestres']

        return {
          ...aluno,
          bimestres: bimestresAtualizados
        }
      })
    )
  }

  function possuiNotasInvalidas(): boolean {
    return alunos.some((aluno) =>
      aluno.bimestres.some((bimestre) => {
        const prova = notaParaNumero(
          bimestre.prova
        )

        const trabalho = notaParaNumero(
          bimestre.trabalho
        )

        const provaInvalida =
          prova !== null &&
          (prova < 0 || prova > 10)

        const trabalhoInvalido =
          trabalho !== null &&
          (trabalho < 0 || trabalho > 10)

        return (
          provaInvalida ||
          trabalhoInvalido
        )
      })
    )
  }

  function handleAcaoNotas() {
    /*
      Quando está na tela estática,
      clicar no botão apenas ativa a edição.
    */
    if (!editandoNotas) {
      setEditandoNotas(true)
      return
    }

    /*
      Quando estiver salvando,
      primeiro verificamos se existe alguma
      nota fora do intervalo permitido.
    */
    if (possuiNotasInvalidas()) {
      alert(
        'As notas devem possuir valores entre 0 e 10.'
      )

      return
    }

    /*
      Aqui montamos os dados no formato que
      normalmente seria enviado para a API.

      Campos vazios são enviados como null.
    */
    const dadosParaSalvar = alunos.map(
      (aluno) => ({
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.matricula,

        bimestres: aluno.bimestres.map(
          (bimestre) => ({
            prova: notaParaNumero(
              bimestre.prova
            ),

            trabalho: notaParaNumero(
              bimestre.trabalho
            ),

            total: calcularTotal(
              bimestre
            )
          })
        ),

        mediaFinal:
          calcularMediaFinal(aluno)
      })
    )

    console.log(
      'Notas salvas:',
      dadosParaSalvar
    )

    /*
      FUTURAMENTE, SUA API PODERÁ SER
      CHAMADA AQUI.

      Exemplo:

      await fetch('/api/notas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          turmaId: turma.id,
          alunos: dadosParaSalvar
        })
      })
    */

    /*
      Depois de salvar,
      volta para o modo de visualização.
    */
    setEditandoNotas(false)
  }

  const nomeTurma =
    `${turma.serie}${turma.turma} ` +
    `${turma.tipo.charAt(0)}` +
    `${turma.tipo.slice(1).toLowerCase()} ` +
    `${formatarPeriodo(turma.periodo)}`

  return (
    <main className={styles.notasDaTurma}>
      <div className={styles.headerNotasDaTurma}>
        <Header />
      </div>

      <div className={styles.telaNotasDaTurma}>
        <div className={styles.menuLateral}>
          <NavBar />
        </div>

        <div
          className={styles.containerNotas}
          style={
            {
              '--cor-turma': turma.cor
            } as CSSProperties
          }
        >
          <section className={styles.painelNotas}>
            <div className={styles.topoPainel}>
              <button
                type="button"
                className={styles.botaoVoltar}
                onClick={handleVoltar}
                aria-label="Voltar"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={styles.iconeVoltar}
                  aria-hidden="true"
                >
                  <path
                    d="M15 5L8 12L15 19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className={styles.mediaTurma}>
                <p className={styles.mediaTurmaTitulo}>
                  Média da turma na sua matéria
                </p>

                <p className={styles.mediaTurmaValor}>
                  {turma.media.toFixed(1)}
                </p>
              </div>
            </div>

            <div className={styles.linhaTitulo}>
              <button
                type="button"
                className={`${styles.botaoNotas} ${
                  editandoNotas
                    ? styles.botaoSalvarNotas
                    : styles.botaoLancarNotas
                }`}
                onClick={handleAcaoNotas}
              >
                {editandoNotas
                  ? 'SALVAR NOTAS'
                  : 'LANÇAR NOTAS'}
              </button>

              <h1 className={styles.tituloTurma}>
                {nomeTurma}
              </h1>

              <div
                className={styles.espacoTitulo}
              />
            </div>

            <div className={styles.areaTabela}>
              <div className={styles.tabelaNotas}>
                <div
                  className={
                    styles.cabecalhoTabelaNotas
                  }
                >
                  <div
                    className={`${styles.cabecalhoCelula} ${styles.cabecalhoAluno}`}
                  >
                    Nome do Aluno
                  </div>

                  {[1, 2, 3, 4].map(
                    (bimestre) => (
                      <div
                        key={bimestre}
                        className={`${styles.cabecalhoCelula} ${styles.cabecalhoBimestre}`}
                      >
                        <span>
                          {bimestre}º Prova
                        </span>

                        <span>
                          Trabalho
                        </span>

                        <span
                          className={
                            styles.cabecalhoTotal
                          }
                        >
                          Total
                        </span>
                      </div>
                    )
                  )}

                  <div
                    className={`${styles.cabecalhoCelula} ${styles.cabecalhoMedia}`}
                  >
                    Média Final
                  </div>
                </div>

                <div className={styles.corpoTabela}>
                  {alunos.map((aluno) => {
                    const mediaFinal =
                      calcularMediaFinal(aluno)

                    return (
                      <div
                        key={aluno.id}
                        className={
                          styles.linhaAluno
                        }
                      >
                        <div
                          className={
                            styles.celulaAluno
                          }
                        >
                          <span
                            className={
                              styles.nomeAluno
                            }
                          >
                            {aluno.nome}
                          </span>

                          <span
                            className={
                              styles.matriculaAluno
                            }
                          >
                            Matrícula{' '}
                            {aluno.matricula}
                          </span>
                        </div>

                        {aluno.bimestres.map(
                          (
                            bimestre,
                            bimestreIndex
                          ) => {
                            const total =
                              calcularTotal(
                                bimestre
                              )

                            return (
                              <div
                                key={
                                  bimestreIndex
                                }
                                className={
                                  styles.grupoNotas
                                }
                              >
                                {editandoNotas ? (
                                  <>
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      autoComplete="off"
                                      className={
                                        styles.campoNota
                                      }
                                      value={
                                        bimestre.prova
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleAlterarNota(
                                          aluno.id,
                                          bimestreIndex,
                                          'prova',
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      aria-label={`Prova do ${bimestreIndex + 1}º bimestre de ${aluno.nome}`}
                                    />

                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      autoComplete="off"
                                      className={
                                        styles.campoNota
                                      }
                                      value={
                                        bimestre.trabalho
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleAlterarNota(
                                          aluno.id,
                                          bimestreIndex,
                                          'trabalho',
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      aria-label={`Trabalho do ${bimestreIndex + 1}º bimestre de ${aluno.nome}`}
                                    />

                                    <span
                                      className={
                                        styles.campoTotalEditavel
                                      }
                                    >
                                      {formatarNota(
                                        total
                                      )}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className={
                                        styles.notaEstatica
                                      }
                                    >
                                      {formatarNotaDigitada(
                                        bimestre.prova
                                      )}
                                    </span>

                                    <span
                                      className={
                                        styles.notaEstatica
                                      }
                                    >
                                      {formatarNotaDigitada(
                                        bimestre.trabalho
                                      )}
                                    </span>

                                    <span
                                      className={`${styles.notaEstatica} ${styles.notaTotal}`}
                                    >
                                      {formatarNota(
                                        total
                                      )}
                                    </span>
                                  </>
                                )}
                              </div>
                            )
                          }
                        )}

                        <div
                          className={
                            styles.mediaFinal
                          }
                        >
                          {editandoNotas ? (
                            <span
                              className={
                                styles.campoMediaEditavel
                              }
                            >
                              {formatarNota(
                                mediaFinal
                              )}
                            </span>
                          ) : (
                            <span
                              className={
                                styles.valorMediaFinal
                              }
                            >
                              {formatarNota(
                                mediaFinal
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}