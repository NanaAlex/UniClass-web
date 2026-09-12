'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'   // ⬅️ import adicionado

import styles from '../../styles/ListagemDeTurmas.module.css'

import Header from '../components/Header'
import NavBar from '../components/NavBar'


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
  { id: 12, serie: '2º', turma: 'C', periodo: 'MATUTINO', tipo: 'ENSINO MÉDIO', media: 86.5, alunos: 30, cor: '#1E88E5', imagem: '/images/imgTurma.png' },
]

export default function listagemDeTurmas(){
    const [turmasDoDiaAtivo, setTurmasDoDiaAtivo] = useState(false)
    const router = useRouter()   // ⬅️ hook adicionado

    return(
        <main className={styles.listagemDeTurmas}>
            <div className={styles.headerListagemDeTurmas}>
                <Header/>
            </div>

            <div className={styles.telaListagemDeTurmas}>
                <div className={styles.menuLateral}>
                    <NavBar/>
                </div>

                <div className={styles.containerTurmas}>
                    <div className={styles.parteSuperior}>
                        <div className={styles.cabecalhoConteudo}>
                            <h1 className={styles.tituloPagina}>
                                Turmas
                            </h1> 
                        </div>

                        <div className={styles.barraFiltros}>
                            <select className={styles.filtro} defaultValue="">
                                <option value="" disabled>Série</option>
                            </select>

                            <select className={styles.filtro} defaultValue="">
                                <option value="" disabled>Turma</option>
                            </select>

                            <select className={styles.filtro} defaultValue="">
                                <option value="" disabled>Período</option>
                            </select>

                            <button
                                type="button"
                                className={`${styles.botaoTurmasDoDia} ${turmasDoDiaAtivo ? styles.botaoTurmasDoDiaAtivo : ''}`}
                                onClick={() => setTurmasDoDiaAtivo(!turmasDoDiaAtivo)}
                            >
                                TURMAS DO DIA
                            </button>

                            <button type="button" className={styles.botaoPesquisar} aria-label="Pesquisar">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/>
                                    <line x1="16.4142" y1="16" x2="21" y2="20.5858" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className={styles.parteInferior}>
                        <div className={styles.listaTurmas}>
                            {turmas.map((turma) => (
                                <div
                                    key={turma.id}
                                    className={styles.cardTurma}
                                    style={{ borderColor: turma.cor }}
                                >
                                    <div
                                        className={styles.imagemTurma}
                                        style={{
                                            backgroundImage: `linear-gradient(to bottom, ${turma.cor}CC 0%, ${turma.cor}33 100%), url(${turma.imagem})`
                                        }}
                                    />
                                    <div className={styles.infoTurma}>
                                        <div className={styles.infoTurmaTopo}>
                                            <span className={styles.tipoTurma}>
                                                {turma.tipo} {turma.periodo}
                                            </span>

                                            <div className={styles.mediaTurma}>
                                                <span className={styles.labelMedia}>MÉDIA</span>
                                                <span className={styles.valorMedia}>{turma.media}</span>
                                            </div>
                                        </div>

                                        <h2 className={styles.nomeTurma} style={{ color: turma.cor }}>
                                            {turma.serie} {turma.turma}
                                        </h2>

                                        <div className={styles.infoTurmaBase}>
                                            <span className={styles.quantidadeAlunos}>
                                                {turma.alunos} alunos
                                            </span>

                                            <button
                                                type="button"
                                                className={styles.botaoDetalhes}
                                                onClick={() => router.push(`/turmas/${turma.id}`)}
                                            >
                                                MAIS DETALHES ➝
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}