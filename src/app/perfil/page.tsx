'use client'
import { useRouter } from 'next/navigation'

import {
  ChangeEvent,
  useRef,
  useState
} from 'react'

import Header from '../components/Header'
import styles from '../../styles/PerfilProfessor.module.css'

interface PerfilProfessor {
  nome: string
  cargo: string
  matricula: string
  email: string
  dataNascimento: string
  whatsapp: string
  formacao: string
  admissao: string

  cpf: string
  rg: string
  celular: string
  emailPessoal: string

  rua: string
  numero: string
  bairro: string
  estado: string
  cep: string
  complemento: string
  pontoReferencia: string

  emergenciaNome: string
  emergenciaCpf: string
  emergenciaCelular: string
  emergenciaVinculo: string
}

const dadosIniciais: PerfilProfessor = {
  nome: 'João Henrique Gomez Silva',
  cargo: 'Mestre em Matemática',
  matricula: 'PROF-01234-5',

  email: 'joaoGoSilveira@edu.com',
  dataNascimento: '05/11/1981',
  whatsapp: '(11) 1234-5678',

  formacao:
    'Mestre em Matemática pela Universidade de São Paulo (USP), com graduação em Licenciatura em Matemática pela Universidade Estadual de Campinas (UNICAMP).',

  admissao: '21/01/2015',

  cpf: '123.456.789-00',
  rg: '1234567-8',
  celular: '(11) 1234-5678',
  emailPessoal: 'joaoGoSilveira@edu.com',

  rua: 'João Gomez Silva',
  numero: '1234',
  bairro: 'zona 012',
  estado: 'Paraná',
  cep: '12.345-678',
  complemento: 'casa A',
  pontoReferencia: 'casa vermelha',

  emergenciaNome: 'Viviam Menezes Gomes',
  emergenciaCpf: '123.456.789-00',
  emergenciaCelular: '(11) 1234-5678',
  emergenciaVinculo: 'Esposa'
}

export default function PerfilProfessor() {
  const router = useRouter()

  function handleVoltar() {
    router.back()
  }
  /*
   * dadosSalvos:
   * representam os dados efetivamente salvos.
   */
  const [dadosSalvos, setDadosSalvos] =
    useState<PerfilProfessor>(dadosIniciais)

  /*
   * dadosEdicao:
   * são uma cópia temporária usada enquanto
   * o usuário está editando.
   */
  const [dadosEdicao, setDadosEdicao] =
    useState<PerfilProfessor>(dadosIniciais)

  const [editando, setEditando] =
    useState(false)

  /*
   * Foto efetivamente salva.
   */
  const [fotoSalva, setFotoSalva] = useState(
    '/images/perfilProfessor.png'
  )

  /*
   * Nova foto ainda não salva.
   */
  const [fotoPendente, setFotoPendente] =
    useState<string | null>(null)

  const inputFotoRef =
    useRef<HTMLInputElement>(null)

  /*
   * Enquanto está editando usamos os dados temporários.
   * Fora da edição usamos os dados salvos.
   */
  const dados = editando
    ? dadosEdicao
    : dadosSalvos

  /*
   * Se existe foto pendente, mostramos a prévia.
   * Caso contrário mostramos a foto já salva.
   */
  const fotoExibida =
    fotoPendente ?? fotoSalva

  function alterarCampo(
    campo: keyof PerfilProfessor,
    valor: string
  ) {
    setDadosEdicao((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor
    }))
  }

  /*
   * Clicar no lápis da foto também
   * coloca a tela em modo de edição.
   */
  function abrirSeletorFoto() {

    if (!editando) {
      setDadosEdicao(dadosSalvos)
      setEditando(true)
    }

    inputFotoRef.current?.click()
  }

  function alterarFoto(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo =
      event.target.files?.[0]

    if (!arquivo) {
      return
    }
     
    const novaFoto =
      URL.createObjectURL(arquivo)

    setFotoPendente(novaFoto)
  }

  function editarOuSalvar() {

    /*
     * Se ainda não está editando,
     * entra no modo de edição.
     */
    if (!editando) {
      setDadosEdicao(dadosSalvos)
      setEditando(true)

      return
    }

    /*
     * Caso já esteja editando,
     * salva as alterações.
     */
    setDadosSalvos(dadosEdicao)

    /*
     * A nova foto só é salva aqui.
     */
    if (fotoPendente) {
      setFotoSalva(fotoPendente)
      setFotoPendente(null)
    }


    setEditando(false)
  }

  return (
    <main className={styles.paginaPerfil}>

      <div className={styles.headerPerfil}>
        <Header />
      </div>

      <section className={styles.areaPerfil}>

        <div className={styles.containerPerfil}>

          {/* ==========================================
              CARD ESQUERDO
          ========================================== */}

          <section className={styles.cardPerfil}>
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
            </div>
            <div className={styles.topoPerfil}>

              {/* FOTO */}

              <div className={styles.areaFoto}>

                <img
                  src={fotoExibida}
                  className={styles.fotoProfessor}
                />

                <button
                  type="button"
                  className={`${styles.botaoEditarFoto} ${
                    fotoPendente
                      ? styles.botaoEditarFotoAtivo
                      : ''
                  }`}
                  onClick={abrirSeletorFoto}
                  aria-label="Alterar foto do perfil"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 20h4l11-11-4-4L4 16v4Z"
                      fill="currentColor"
                    />

                    <path
                      d="M13.7 6.3l4 4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </button>

                <input
                  ref={inputFotoRef}
                  type="file"
                  accept="image/*"
                  className={styles.inputFoto}
                  onChange={alterarFoto}
                />
              </div>

              {/* RESUMO */}

              <div className={styles.resumoProfessor}>

                <div className={styles.grupoResumo}>
                  <span>Professor</span>

                  {editando ? (
                    <input
                      className={styles.inputResumo}
                      value={dados.nome}
                      onChange={(event) =>
                        alterarCampo(
                          'nome',
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {dados.nome}
                    </strong>
                  )}
                </div>

                <div className={styles.grupoResumo}>
                  <span>
                    Cargo/Disciplina
                  </span>

                  {editando ? (
                    <input
                      className={styles.inputResumo}
                      value={dados.cargo}
                      onChange={(event) =>
                        alterarCampo(
                          'cargo',
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {dados.cargo}
                    </strong>
                  )}
                </div>

                <div className={styles.grupoResumo}>
                  <span>Matrícula</span>

                  {editando ? (
                    <input
                      className={styles.inputResumo}
                      value={dados.matricula}
                      onChange={(event) =>
                        alterarCampo(
                          'matricula',
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {dados.matricula}
                    </strong>
                  )}
                </div>

              </div>
            </div>

            {/* ==========================================
                INFORMAÇÕES ESQUERDA
            ========================================== */}

            <div className={styles.corpoPerfil}>

              <div
                className={
                  styles.gridInformacoesPerfil
                }
              >

                <CampoInformacao
                  titulo="NOME COMPLETO"
                  valor={dados.nome}
                  editando={editando}
                  onChange={(valor) =>
                    alterarCampo(
                      'nome',
                      valor
                    )
                  }
                />

                <CampoInformacao
                  titulo="EMAIL PARA CONTATO"
                  valor={dados.email}
                  editando={editando}
                  onChange={(valor) =>
                    alterarCampo(
                      'email',
                      valor
                    )
                  }
                />

                <CampoInformacao
                  titulo="DATA DE NASCIMENTO"
                  valor={dados.dataNascimento}
                  editando={editando}
                  onChange={(valor) =>
                    alterarCampo(
                      'dataNascimento',
                      valor
                    )
                  }
                />

                <CampoInformacao
                  titulo="WHATSAPP"
                  valor={dados.whatsapp}
                  editando={editando}
                  onChange={(valor) =>
                    alterarCampo(
                      'whatsapp',
                      valor
                    )
                  }
                />

              </div>

              {/* FORMAÇÃO */}

              <div
                className={
                  styles.informacaoFormacao
                }
              >

                <span
                  className={
                    styles.tituloInformacao
                  }
                >
                  FORMAÇÃO
                </span>

                {editando ? (
                  <textarea
                    value={dados.formacao}
                    onChange={(event) =>
                      alterarCampo(
                        'formacao',
                        event.target.value
                      )
                    }
                    className={
                      styles.textareaFormacao
                    }
                  />
                ) : (
                  <p>
                    {dados.formacao}
                  </p>
                )}

              </div>

              <CampoInformacao
                titulo="ADMISSÃO"
                valor={dados.admissao}
                editando={editando}
                onChange={(valor) =>
                  alterarCampo(
                    'admissao',
                    valor
                  )
                }
              />

            </div>

          </section>

          {/* ==========================================
              CARD DIREITO
          ========================================== */}

          <section
            className={`${styles.cardPerfil} ${styles.cardDados}`}
          >

            <div className={styles.conteudoDados}>

              <h1
                className={
                  styles.tituloDadosPessoais
                }
              >
                Meus dados pessoais
              </h1>

              {/* DADOS PESSOAIS */}

              <div
                className={
                  styles.gridCamposPrincipais
                }
              >

                <CampoInput
                  label="CPF"
                  value={dados.cpf}
                  disabled={!editando}
                  onChange={(valor) =>
                    alterarCampo(
                      'cpf',
                      valor
                    )
                  }
                />

                <CampoInput
                  label="RG"
                  value={dados.rg}
                  disabled={!editando}
                  onChange={(valor) =>
                    alterarCampo(
                      'rg',
                      valor
                    )
                  }
                />

                <CampoInput
                  label="Celular"
                  value={dados.celular}
                  disabled={!editando}
                  onChange={(valor) =>
                    alterarCampo(
                      'celular',
                      valor
                    )
                  }
                />

                <CampoInput
                  label="Email"
                  value={dados.emailPessoal}
                  disabled={!editando}
                  onChange={(valor) =>
                    alterarCampo(
                      'emailPessoal',
                      valor
                    )
                  }
                />

              </div>

              {/* ENDEREÇO */}

              <div className={styles.secaoDados}>

                <h2>Endereço</h2>

                <div
                  className={
                    styles.gridEndereco
                  }
                >

                  <div
                    className={
                      styles.campoRua
                    }
                  >
                    <CampoInput
                      label="Rua"
                      value={dados.rua}
                      disabled={!editando}
                      onChange={(valor) =>
                        alterarCampo(
                          'rua',
                          valor
                        )
                      }
                    />
                  </div>

                  <CampoInput
                    label="Número"
                    value={dados.numero}
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'numero',
                        valor
                      )
                    }
                  />

                  <CampoInput
                    label="Bairro"
                    value={dados.bairro}
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'bairro',
                        valor
                      )
                    }
                  />

                  <CampoInput
                    label="Estado"
                    value={dados.estado}
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'estado',
                        valor
                      )
                    }
                  />

                  <CampoInput
                    label="CEP"
                    value={dados.cep}
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'cep',
                        valor
                      )
                    }
                  />

                  <CampoInput
                    label="Complemento"
                    value={dados.complemento}
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'complemento',
                        valor
                      )
                    }
                  />

                  <div
                    className={
                      styles.campoReferencia
                    }
                  >
                    <CampoInput
                      label="Ponto de referência"
                      value={
                        dados.pontoReferencia
                      }
                      disabled={!editando}
                      onChange={(valor) =>
                        alterarCampo(
                          'pontoReferencia',
                          valor
                        )
                      }
                    />
                  </div>

                </div>

              </div>

              {/* CONTATO DE EMERGÊNCIA */}

              <div className={styles.secaoDados}>

                <h2>
                  Contato de Emergência
                </h2>

                <div
                  className={
                    styles.gridEmergencia
                  }
                >

                  <CampoInput
                    label="Nome Completo"
                    value={
                      dados.emergenciaNome
                    }
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'emergenciaNome',
                        valor
                      )
                    }
                  />

                  <CampoInput
                    label="CPF"
                    value={
                      dados.emergenciaCpf
                    }
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'emergenciaCpf',
                        valor
                      )
                    }
                  />

                  <CampoInput
                    label="Celular"
                    value={
                      dados.emergenciaCelular
                    }
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'emergenciaCelular',
                        valor
                      )
                    }
                  />

                  <CampoInput
                    label="Vínculo"
                    value={
                      dados.emergenciaVinculo
                    }
                    disabled={!editando}
                    onChange={(valor) =>
                      alterarCampo(
                        'emergenciaVinculo',
                        valor
                      )
                    }
                  />

                </div>
              </div>

            </div>

            {/* ÚNICO BOTÃO DE EDIÇÃO */}

            <button
              type="button"
              className={`${styles.botaoEditar} ${
                editando
                  ? styles.botaoSalvar
                  : ''
              }`}
              onClick={editarOuSalvar}
            >
              {editando
                ? 'Salvar'
                : 'Editar'}
            </button>

          </section>

        </div>

      </section>

    </main>
  )
}

/* ==========================================================
   CAMPO ESQUERDO
========================================================== */

function CampoInformacao({
  titulo,
  valor,
  editando,
  onChange
}: {
  titulo: string
  valor: string
  editando: boolean
  onChange: (valor: string) => void
}) {

  return (
    <div className={styles.campoInformacao}>

      <span className={styles.tituloInformacao}>
        {titulo}
      </span>

      {editando ? (
        <input
          type="text"
          value={valor}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className={styles.inputEdicaoPerfil}
        />
      ) : (
        <strong>
          {valor}
        </strong>
      )}

    </div>
  )
}

/* ==========================================================
   INPUT DIREITO
========================================================== */

function CampoInput({
  label,
  value,
  disabled,
  onChange
}: {
  label: string
  value: string
  disabled: boolean
  onChange: (valor: string) => void
}) {

  return (
    <label className={styles.campoInput}>

      <span>{label}</span>

      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />

    </label>
  )
}