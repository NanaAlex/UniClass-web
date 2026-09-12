'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useRouter } from 'next/navigation'
import styles from '../../../../styles/Chamada.module.css'

import Header from '../../../components/Header'
import NavBar from '../../../components/NavBar'

interface Turma {
  id: number
  serie: string
  turma: string
  periodo: string
  tipo: string
  alunos: number
  cor: string
}

type SituacaoPresenca = 'PRESENTE' | 'AUSENTE' | null

interface Aluno {
  id: number
  nome: string
  matricula: string
  faltas: number
  limiteFaltas: number
  situacao: SituacaoPresenca
}

const turmas: Turma[] = [
  {
    id: 1,
    serie: '1º',
    turma: 'A',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    alunos: 30,
    cor: '#E53935'
  },
  {
    id: 2,
    serie: '1º',
    turma: 'B',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    alunos: 30,
    cor: '#F57C00'
  },
  {
    id: 3,
    serie: '1º',
    turma: 'C',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    alunos: 30,
    cor: '#FBC02D'
  },
  {
    id: 4,
    serie: '2º',
    turma: 'A',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    alunos: 30,
    cor: '#7CB342'
  },
  {
    id: 5,
    serie: '2º',
    turma: 'B',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    alunos: 30,
    cor: '#00897B'
  },
  {
    id: 6,
    serie: '2º',
    turma: 'C',
    periodo: 'MATUTINO',
    tipo: 'ENSINO MÉDIO',
    alunos: 30,
    cor: '#1E88E5'
  }
]

const alunosIniciais: Aluno[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: index + 1,
    nome: 'Ana Beatriz Cardoso',
    matricula: '2026001',
    faltas:
      index === 6
        ? 0
        : index === 12
          ? 7
          : index === 17
            ? 14
            : index === 25
              ? 20
              : 2,
    limiteFaltas: 20,
    situacao: null
  })
)

function getTurmaById(id: number) {
  return turmas.find((turma) => turma.id === id)
}

function getCorFaltas(faltas: number) {
  if (faltas === 0) {
    return '#FFFFFF'
  }

  if (faltas < 10) {
    return '#27AE60'
  }

  if (faltas < 20) {
    return '#F1C40F'
  }

  return '#E3263E'
}

function getCorPresenca(percentual: number) {
  if (percentual < 25) {
    return '#E3263E'
  }

  if (percentual <= 75) {
    return '#F1C40F'
  }

  return '#27AE60'
}

interface ChamadaProps {
  params: {
    idTurma: string
  }
}

export default function Chamada({
  params
}: ChamadaProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const idTurma = Number(params.idTurma)
  const turma = getTurmaById(idTurma)

  const [alunos, setAlunos] = useState<Aluno[]>(
    alunosIniciais
  )

  const [cabecalhoCompacto, setCabecalhoCompacto] =
    useState(false)

  const [descricaoAula, setDescricaoAula] = useState('')

  const cabecalhoCompactoRef = useRef(false) //UseRef serve pra atualizar um objeto sem precisar renderizar de novo. Então dá pra compactar ele sem precisar carregar de novo.

  useEffect(() => {
    const elemento = scrollRef.current

    if (!elemento) {    
        return
    }

    let animationFrameId: number | null = null

    function verificarScroll() {
        if (animationFrameId !== null) {
        return
        }

        animationFrameId = requestAnimationFrame(() => {
        if (!elemento) {
            animationFrameId = null
            return
        }

        const scrollAtual = Math.max( //O Math.max garante que nunca será utilizado um valor menor que zero.
            0,
            elemento.scrollTop
        )

        const estaCompacto =
            cabecalhoCompactoRef.current

        let novoEstado = estaCompacto

        if (
            !estaCompacto &&
            scrollAtual >= 100
        ) {
            novoEstado = true
        }

        if (
            estaCompacto &&
            scrollAtual <= 5
        ) {
            novoEstado = false
        }

        if (
            novoEstado !==
            cabecalhoCompactoRef.current
        ) {
            cabecalhoCompactoRef.current =
            novoEstado

            setCabecalhoCompacto(novoEstado)
        }

        animationFrameId = null
        })
    }

    elemento.addEventListener(
        'scroll',
        verificarScroll,  //'passive: true' informa que essa função não vai tentar bloquear o scroll.
        { passive: true }
    )

    verificarScroll()

    return () => {  //"limpa" o useEffect
        elemento.removeEventListener( //Removendo o eventListener
        'scroll',
        verificarScroll
        )

        if (animationFrameId !== null) { //Cancelando frames pendentes.
        cancelAnimationFrame(animationFrameId)
        }
    }
    }, [])

  const totalAlunos = alunos.length

  const totalPresentes = useMemo(
    () =>
      alunos.filter(
        (aluno) => aluno.situacao === 'PRESENTE'
      ).length,
    [alunos]
  )

  const totalAusentes = useMemo(
    () =>
      alunos.filter(
        (aluno) => aluno.situacao === 'AUSENTE'
      ).length,
    [alunos]
  )

  const totalSemRegistro =
    totalAlunos - totalPresentes - totalAusentes

  const percentualPresenca =
    totalAlunos > 0
      ? (totalPresentes / totalAlunos) * 100
      : 0

  const corIndicadorPresenca =
    getCorPresenca(percentualPresenca) //Recebe a porcentagem de presença e retorna a cor referente ao valor.

  if (!turma) {
    return (
      <main className={styles.paginaChamada}>
        <div className={styles.header}>
          <Header />
        </div>

        <div className={styles.corpoPagina}>
          <aside className={styles.menuLateral}>
            <NavBar />
          </aside>

          <section className={styles.containerChamada}>
            Turma não encontrada.
          </section>
        </div>
      </main>
    )
  }

  function alterarSituacao(
    alunoId: number,
    situacao: Exclude<SituacaoPresenca, null>
  ) {
    setAlunos((estadoAtual) =>
      estadoAtual.map((aluno) => {
        if (aluno.id !== alunoId) {
          return aluno
        }

        /*
         * Se clicar novamente no mesmo botão,
         * o registro volta a ficar vazio.
         */
        if (aluno.situacao === situacao) {
          return {
            ...aluno,
            situacao: null
          }
        }

        return {
          ...aluno,
          situacao
        }
      })
    )
  }

  function marcarTodosPresentes() {
    setAlunos((estadoAtual) =>
      estadoAtual.map((aluno) => ({
        ...aluno,
        situacao: 'PRESENTE'
      }))
    )
  }

  function limparChamada() {
    setAlunos((estadoAtual) =>
      estadoAtual.map((aluno) => ({
        ...aluno,
        situacao: null
      }))
    )
  }

  function salvarChamada() {
    const dadosChamada = {
      turmaId: turma!.id,
      descricaoAula,
      presentes: alunos.filter(
        (aluno) => aluno.situacao === 'PRESENTE'
      ),
      ausentes: alunos.filter(
        (aluno) => aluno.situacao === 'AUSENTE'
      ),
      semRegistro: alunos.filter(
        (aluno) => aluno.situacao === null
      )
    }

    console.log('Chamada salva:', dadosChamada)
  }

  const nomeTurma = `${turma.serie}${turma.turma}`

  return (
    <main className={styles.paginaChamada}>
      <div className={styles.header}>
        <Header />
      </div>

      <div className={styles.corpoPagina}>
        <aside className={styles.menuLateral}>
          <NavBar />
        </aside>

        <section className={styles.containerChamada}>
          <div
            ref={scrollRef}
            className={styles.areaScroll}
          >
            <div className={styles.areaSticky}>
              <section
                className={`${styles.cabecalhoTurma} ${
                  cabecalhoCompacto
                    ? styles.cabecalhoCompacto
                    : ''
                }`}
                style={{
                  background: `linear-gradient(
                    105deg,
                    #001C33 0%,
                    #001C33 20%,
                    ${turma.cor} 100%
                  )`
                }}
              >
                <button
                  type="button"
                  className={styles.botaoVoltar}
                  onClick={() => router.back()}
                  aria-label="Voltar"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M15 4L7 12L15 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {!cabecalhoCompacto ? (
                  <>
                    <div
                      className={
                        styles.informacoesCabecalho
                      }
                    >
                      <h1
                        className={
                          styles.tituloTurma
                        }
                      >
                        Turma {nomeTurma}
                      </h1>

                      <p
                        className={
                          styles.tipoTurma
                        }
                      >
                        Ensino Médio{' '}
                        {turma.periodo ===
                        'MATUTINO'
                          ? 'Matutino'
                          : turma.periodo}
                      </p>

                      <p
                        className={
                          styles.dataChamada
                        }
                      >
                        Segunda, 24 de Agosto
                      </p>
                    </div>

                    <div
                      className={
                        styles.acoesCabecalho
                      }
                    >
                      <button
                        type="button"
                        className={
                          styles.botaoHistorico
                        }
                      >
                        HISTÓRICO DE CHAMADA

                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 9l5 5 5-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      <div
                        className={
                          styles.indicadorTurmaExpandido
                        }
                        title={`${percentualPresenca.toFixed(
                          0
                        )}% de presença`}
                      >
                        <span
                          style={{
                            width: `${percentualPresenca}%`,
                            backgroundColor:
                              corIndicadorPresenca
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={
                        styles.tituloCompacto
                      }
                    >
                      <strong>
                        Turma {nomeTurma}
                      </strong>

                      <span>
                        – Ensino Médio{' '}
                        {turma.periodo ===
                        'MATUTINO'
                          ? 'Matutino'
                          : turma.periodo}
                      </span>
                    </div>

                    <div
                      className={
                        styles.indicadorTurmaCompacto
                      }
                      title={`${percentualPresenca.toFixed(
                        0
                      )}% de presença`}
                    >
                      <span
                        style={{
                          width: `${percentualPresenca}%`,
                          backgroundColor:
                            corIndicadorPresenca
                        }}
                      />
                    </div>
                  </>
                )}
              </section>

              {/* INDICADORES */}
              <section
                className={styles.cardsIndicadores}
              >
                <div
                  className={styles.cardIndicador}
                >
                  <strong>{totalAlunos}</strong>
                  <span>Total de Alunos</span>
                </div>

                <div
                  className={styles.cardIndicador}
                >
                  <strong>
                    {totalPresentes}
                  </strong>
                  <span>Total Presentes</span>
                </div>

                <div
                  className={styles.cardIndicador}
                >
                  <strong>
                    {totalAusentes}
                  </strong>
                  <span>Total Ausentes</span>
                </div>

                <div
                  className={styles.cardIndicador}
                >
                  <strong>
                    {totalSemRegistro}
                  </strong>
                  <span>Sem Registro</span>
                </div>
              </section>

              {/* TÍTULO LISTA */}
              <section
                className={
                  styles.cabecalhoListaPresenca
                }
              >
                <h2>Lista de presença</h2>

                <div
                  className={
                    styles.acoesListaPresenca
                  }
                >
                  <button
                    type="button"
                    onClick={marcarTodosPresentes}
                  >
                    Marca todos Presentes
                  </button>

                  <button
                    type="button"
                    onClick={limparChamada}
                  >
                    Limpar
                  </button>
                </div>
              </section>
            </div>

            {/* ==================================================
                LISTA
            ================================================== */}

            <section className={styles.listaAlunos}>
              {alunos.map((aluno) => {
                const corFaltas = getCorFaltas(
                  aluno.faltas
                )

                return (
                  <article
                    key={aluno.id}
                    className={styles.alunoCard}
                  >
                    <div
                      className={
                        styles.numeroAluno
                      }
                    >
                      {String(aluno.id).padStart(
                        2,
                        '0'
                      )}
                    </div>

                    <div
                      className={
                        styles.controlesPresenca
                      }
                    >
                      <button
                        type="button"
                        className={`${styles.botaoSituacao} ${
                          aluno.situacao ===
                          'PRESENTE'
                            ? styles.presenteSelecionado
                            : ''
                        }`}
                        onClick={() =>
                          alterarSituacao(
                            aluno.id,
                            'PRESENTE'
                          )
                        }
                      >
                        <span>✓</span>
                        Presente
                      </button>

                      <button
                        type="button"
                        className={`${styles.botaoSituacao} ${
                          aluno.situacao ===
                          'AUSENTE'
                            ? styles.ausenteSelecionado
                            : ''
                        }`}
                        onClick={() =>
                          alterarSituacao(
                            aluno.id,
                            'AUSENTE'
                          )
                        }
                      >
                        <span>×</span>
                        Ausente
                      </button>
                    </div>

                    <div
                      className={
                        styles.dadosAluno
                      }
                    >
                      <strong>{aluno.nome}</strong>

                      <span>
                        Matrícula{' '}
                        {aluno.matricula}
                      </span>
                    </div>

                    <div
                      className={
                        styles.faltasAluno
                      }
                    >
                      <div
                        className={
                          styles.textoFaltas
                        }
                      >
                        <span>
                          Total de Faltas
                        </span>

                        <strong>
                          {String(
                            aluno.faltas
                          ).padStart(2, '0')}
                          /
                          {String(
                            aluno.limiteFaltas
                          ).padStart(2, '0')}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.trilhoFaltas
                        }
                      >
                        <span
                          style={{
                            backgroundColor:
                              corFaltas
                          }}
                        />
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>

            {/* ==================================================
                FINAL DA CHAMADA
            ================================================== */}

            <section className={styles.rodapeChamada}>
              <div
                className={
                  styles.descricaoContainer
                }
              >
                <textarea
                  value={descricaoAula}
                  maxLength={100}
                  placeholder="Descrição da Aula de hoje"
                  onChange={(event) =>
                    setDescricaoAula(
                      event.target.value
                    )
                  }
                />

                <span
                  className={
                    styles.contadorCaracteres
                  }
                >
                  {descricaoAula.length}/100
                </span>
              </div>

              <button
                type="button"
                className={
                  styles.botaoSalvarChamada
                }
                onClick={salvarChamada}
              >
                SALVAR CHAMADA
              </button>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}