'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '../../styles/ListaTurmas.module.css';

export default function ListaTurmas() {
    const listaRef = useRef<HTMLDivElement | null>(null);

    const [podeVoltar, setPodeVoltar] = useState(false);
    const [podeAvancar, setPodeAvancar] = useState(false);

    const turmas = [
        {
            id: 1,
            nome: 'Turma 8º A',
            ensino: 'ENSINO FUNDAMENTAL II . MATUTINO',
            alunos: 28,
            horario: '8:30',
            cor: '#FF0000',
            imagem: '/images/turma.jpg'
        },
        {
            id: 2,
            nome: 'Turma 8º B',
            ensino: 'ENSINO FUNDAMENTAL II . MATUTINO',
            alunos: 28,
            horario: '9:20',
            cor: '#FF6500',
            imagem: '/images/turma.jpg'
        },
        {
            id: 3,
            nome: 'Turma 8º C',
            ensino: 'ENSINO FUNDAMENTAL II . VESPERTINO',
            alunos: 30,
            horario: '10:10',
            cor: '#006EFF',
            imagem: '/images/turma.jpg'
        },
        {
            id: 4,
            nome: 'Turma 9º A',
            ensino: 'ENSINO FUNDAMENTAL II . VESPERTINO',
            alunos: 25,
            horario: '13:30',
            cor: '#8A2BE2',
            imagem: '/images/turma.jpg'
        }
    ];

    function atualizarSetas() {
        if (!listaRef.current) return;

        const lista = listaRef.current;

        const estaNoInicio = lista.scrollLeft <= 2;
        const estaNoFim =
            lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 2;

        setPodeVoltar(!estaNoInicio);
        setPodeAvancar(!estaNoFim);
    }

    function obterDistanciaScroll() {
        if (!listaRef.current) return 0;

        const primeiraTurma =
            listaRef.current.firstElementChild as HTMLElement | null;

        if (!primeiraTurma) return 0;

        const larguraTurma = primeiraTurma.getBoundingClientRect().width;

        const estiloLista = window.getComputedStyle(listaRef.current);
        const gap = parseFloat(estiloLista.columnGap) || 0;

        return larguraTurma + gap;
    }

    function avancarTurmas() {
        if (!listaRef.current) return;

        listaRef.current.scrollBy({
            left: obterDistanciaScroll(),
            behavior: 'smooth'
        });
    }

    function voltarTurmas() {
        if (!listaRef.current) return;

        listaRef.current.scrollBy({
            left: -obterDistanciaScroll(),
            behavior: 'smooth'
        });
    }

    useEffect(() => {
        atualizarSetas(); }, []);

    return (
        <div className={styles.container}>
            <div className={styles.cabecalhoTurmas}>
                <h2 className={styles.tituloTurmas}>
                    Suas Turmas
                </h2>

                <div className={styles.verTodas}>
                    <span>Ver Todas</span>
                    <Plus size={22} strokeWidth={4} />
                </div>
            </div>

            <div className={styles.conteudoTurmas}>

                {podeVoltar && (
                    <button
                        className={`${styles.setaTurmas} ${styles.setaAnterior}`}
                        onClick={voltarTurmas}
                        aria-label="Turmas anteriores"
                    >
                        <ChevronLeft size={38} strokeWidth={3} />
                    </button>
                )}

                <div
                    ref={listaRef}
                    className={styles.listaTurmas}
                    onScroll={atualizarSetas}
                >
                    {turmas.map((turma) => (
                        <div
                            key={turma.id}
                            className={styles.turma}
                            style={
                                {
                                    '--cor-turma': turma.cor
                                } as CSSProperties
                            }
                        >
                            <div
                                className={styles.imagemTurma}
                                style={{
                                    backgroundImage: `url(${turma.imagem})`
                                }}
                            >
                                <div className={styles.gradienteTurma} />
                            </div>

                            <div className={styles.informacoesTurma}>
                                <span className={styles.tipoEnsino}>
                                    {turma.ensino}
                                </span>

                                <h3 className={styles.nomeTurma}>
                                    {turma.nome}
                                </h3>

                                <div className={styles.detalhesTurma}>
                                    <span>
                                        {turma.alunos} alunos
                                    </span>

                                    <span>
                                        Hoje: {turma.horario}
                                    </span>
                                </div>

                                <button className={styles.botaoChamada}>
                                    FAZER CHAMADA
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {podeAvancar && (
                    <button
                        className={`${styles.setaTurmas} ${styles.setaProxima}`}
                        onClick={avancarTurmas}
                        aria-label="Próximas turmas"
                    >
                        <ChevronRight size={38} strokeWidth={3} />
                    </button>
                )}

            </div>
        </div>
    );
}