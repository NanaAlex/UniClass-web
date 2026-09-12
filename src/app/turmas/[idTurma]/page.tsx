'use client'

import { useRouter } from 'next/navigation'
import styles from '../../../styles/DetalhesDaTurma.module.css'
import Header from '../../components/Header'
import NavBar from '../../components/NavBar'

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

interface Documento {
  id: number
  turmaId: number
  nome: string
  tipo: 'pdf' | 'docx'
  arquivo: string
}

const turmas: Turma[] = [
  { id: 1, serie: '1º', turma: 'A', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#E53935', imagem: '/images/imgTurma.png' },
  { id: 2, serie: '1º', turma: 'B', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#F57C00', imagem: '/images/imgTurma.png' },
  { id: 3, serie: '1º', turma: 'C', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#FBC02D', imagem: '/images/imgTurma.png' },
  { id: 4, serie: '2º', turma: 'A', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#7CB342', imagem: '/images/imgTurma.png' },
  { id: 5, serie: '2º', turma: 'B', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#00897B', imagem: '/images/imgTurma.png' },
  { id: 6, serie: '2º', turma: 'C', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#1E88E5', imagem: '/images/imgTurma.png' },
  { id: 7, serie: '1º', turma: 'A', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#E53935', imagem: '/images/imgTurma.png' },
  { id: 8, serie: '1º', turma: 'B', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#F57C00', imagem: '/images/imgTurma.png' },
  { id: 9, serie: '1º', turma: 'C', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#FBC02D', imagem: '/images/imgTurma.png' },
  { id: 10, serie: '2º', turma: 'A', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#7CB342', imagem: '/images/imgTurma.png' },
  { id: 11, serie: '2º', turma: 'B', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#00897B', imagem: '/images/imgTurma.png' },
  { id: 12, serie: '2º', turma: 'C', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#1E88E5', imagem: '/images/imgTurma.png' }
]

const documentos: Documento[] = [
  { id: 1, turmaId: 1, nome: 'Aula 1 - dia 22/08', tipo: 'pdf', arquivo: '/documentos/aula1.pdf' },
  { id: 2, turmaId: 1, nome: 'Aula 2 - dia 23/08', tipo: 'docx', arquivo: '/documentos/aula2.pdf' },
  { id: 3, turmaId: 1, nome: 'Aula 3 - dia 24/08', tipo: 'pdf', arquivo: '/documentos/aula3.pdf' },
  { id: 4, turmaId: 1, nome: 'Aula 4 - dia 25/08', tipo: 'pdf', arquivo: '/documentos/aula4.pdf' },
  { id: 5, turmaId: 1, nome: 'Aula 5 - dia 26/08', tipo: 'docx', arquivo: '/documentos/aula5.pdf' },
  { id: 6, turmaId: 1, nome: 'Aula 6 - dia 27/08', tipo: 'pdf', arquivo: '/documentos/aula6.pdf' },
  { id: 7, turmaId: 1, nome: 'Aula 7 - dia 28/08', tipo: 'pdf', arquivo: '/documentos/aula7.pdf' },
  { id: 8, turmaId: 1, nome: 'Aula 8 - dia 29/08', tipo: 'docx', arquivo: '/documentos/aula8.pdf' },
  { id: 9, turmaId: 1, nome: 'Aula 9 - dia 30/08', tipo: 'pdf', arquivo: '/documentos/aula9.pdf' }
]

function getTurmaById(id: number): Turma | undefined {
  return turmas.find((turma) => turma.id === id)
}

function getDocumentosByTurmaId(turmaId: number): Documento[] {
  return documentos.filter((documento) => documento.turmaId === turmaId)
}

function DocumentoCard({
  documento,
  onAbrir,
  onExcluir
}: {
  documento: Documento
  onAbrir: (documento: Documento) => void
  onExcluir: (documento: Documento) => void
}) {
  const isPdf = documento.tipo === 'pdf'

  return (
    <div className={styles.cardDocumento}>
      <div
        className={`${styles.cabecalhoDocumento} ${
          isPdf ? styles.cabecalhoPdf : styles.cabecalhoDocx
        }`}
      >
        {isPdf ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
              fill="rgba(255,255,255,0.15)"
              stroke="#fff"
              strokeWidth="1.4"
            />
            <path
              d="M15 2v5h5"
              stroke="#fff"
              strokeWidth="1.4"
            />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="700"
              fill="#fff"
            >
              PDF
            </text>
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
              fill="rgba(255,255,255,0.15)"
              stroke="#fff"
              strokeWidth="1.4"
            />
            <path
              d="M15 2v5h5"
              stroke="#fff"
              strokeWidth="1.4"
            />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontSize="7"
              fontWeight="700"
              fill="#fff"
            >
              W
            </text>
          </svg>
        )}
      </div>

      <div className={styles.corpoDocumento}>
        <p className={styles.nomeDocumento}>
          {documento.nome}
        </p>

        <div className={styles.acoesDocumento}>
          <button
            type="button"
            className={styles.botaoAbrir}
            onClick={() => onAbrir(documento)}
          >
            Abrir
          </button>

          <button
            type="button"
            className={styles.botaoExcluirDocumento}
            onClick={() => onExcluir(documento)}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

interface DetalhesDaTurmaProps {
  params: {
    idTurma: string
  }
}

export default function DetalhesDaTurma({
  params
}: DetalhesDaTurmaProps) {
  const router = useRouter()

  const idTurma = Number(params.idTurma)
  const turma = getTurmaById(idTurma)

  if (!turma) {
    return (
      <main className={styles.detalhesDaTurma}>
        <div className={styles.headerDetalhesDaTurma}>
          <Header />
        </div>

        <div className={styles.telaDetalhesDaTurma}>
          <div className={styles.menuLateral}>
            <NavBar />
          </div>

          <div className={styles.containerDetalhes}>
            <p>Turma não encontrada.</p>
          </div>
        </div>
      </main>
    )
  }

  const documentosDaTurma = getDocumentosByTurmaId(turma.id)
  const nomeTurma = `${turma.serie}${turma.turma}`

  function handleVoltar() {
    router.back()
  }

  function handleAdicionarDocumento() {
    console.log(
      'Adicionar documento para a turma:',
      turma!.id
    )
  }

  function handleAbrirDocumento(documento: Documento) {
    console.log('Abrir documento:', documento)
  }

  function handleExcluirDocumento(documento: Documento) {
    console.log('Excluir documento:', documento)
  }

  function handleFazerChamada() {
    router.push(`/turmas/${turma!.id}/chamada`)
  }

  function handleLancarNotas() {
    router.push(`/turmas/${turma!.id}/notas`)
  }

  function handleMandarNotificacao() {
    console.log(
      'Enviar notificação para a turma:',
      turma!.id
    )
  }

  return (
    <main className={styles.detalhesDaTurma}>
      <div className={styles.headerDetalhesDaTurma}>
        <Header />
      </div>

      <div className={styles.telaDetalhesDaTurma}>
        <div className={styles.menuLateral}>
          <NavBar />
        </div>

        <div
          className={styles.containerDetalhes}
          style={{
            background: `linear-gradient(160deg, ${turma.cor} 0%, #001C33 100%)`
          }}
        >
          <section className={styles.banner}>
            <div
              className={styles.bannerImagem}
              style={{
                backgroundImage: `url(${turma.imagem})`
              }}
            >
              <div className={styles.bannerOverlay} />
            </div>

            <div className={styles.bannerConteudo}>
              <button
                type="button"
                className={styles.botaoVoltar}
                onClick={handleVoltar}
                aria-label="Voltar"
              >
                <span className={styles.setaVoltar}>
                  &lt;
                </span>
              </button>

              <div className={styles.bannerTextos}>
                <p className={styles.periodoTurma}>
                  {turma.tipo}
                  <br />
                  {turma.periodo}
                </p>

                <h1 className={styles.nomeTurmaGrande}>
                  {nomeTurma}
                </h1>
              </div>
            </div>
          </section>

          <section className={styles.conteudoInferior}>
            <div className={styles.documentosArea}>
              <div className={styles.documentosCabecalho}>
                <h2 className={styles.documentosTitulo}>
                  Documentos da Disciplina
                </h2>

                <button
                  type="button"
                  className={styles.botaoAdicionar}
                  onClick={handleAdicionarDocumento}
                >
                  ADICIONAR DOCUMENTO +
                </button>
              </div>

              <div className={styles.documentosGrid}>
                {documentosDaTurma.map((documento) => (
                  <DocumentoCard
                    key={documento.id}
                    documento={documento}
                    onAbrir={handleAbrirDocumento}
                    onExcluir={handleExcluirDocumento}
                  />
                ))}
              </div>
            </div>

            <aside className={styles.lateralDireita}>
              <div className={styles.mediaCard}>
                <p className={styles.mediaTitulo}>
                  Média da turma:
                </p>

                <p className={styles.mediaValor}>
                  {turma.media}
                </p>
              </div>

              <div className={styles.acoesLista}>
                <button
                  type="button"
                  className={styles.botaoAcao}
                  onClick={handleFazerChamada}
                >
                  <svg
                    className={styles.iconeAcao}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="4"
                      cy="6"
                      r="1.4"
                      fill="currentColor"
                    />
                    <circle
                      cx="4"
                      cy="12"
                      r="1.4"
                      fill="currentColor"
                    />
                    <circle
                      cx="4"
                      cy="18"
                      r="1.4"
                      fill="currentColor"
                    />
                    <path
                      d="M9 6h11M9 12h11M9 18h11"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  FAZER CHAMADA
                </button>

                <button
                  type="button"
                  className={styles.botaoAcao}
                  onClick={handleLancarNotas}
                >
                  <svg
                    className={styles.iconeAcao}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="3"
                      width="16"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M8 8h8M8 12h8M8 16h5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  LANÇAR NOTAS
                </button>

                <button
                  type="button"
                  className={styles.botaoAcao}
                  onClick={handleMandarNotificacao}
                >
                  <svg
                    className={styles.iconeAcao}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3a5 5 0 0 0-5 5v3.2c0 .8-.32 1.56-.88 2.12L5 14.5V16h14v-1.5l-1.12-1.18A3 3 0 0 1 17 11.2V8a5 5 0 0 0-5-5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M10 19a2 2 0 0 0 4 0"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>

                  ENVIAR NOTIFICAÇÃO
                </button>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  )
}