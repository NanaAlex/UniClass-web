'use client';

import { useRef, useState } from 'react';
import styles from '../../styles/ListaNotificacoes.module.css';
import { Bell, Plus } from 'lucide-react';

export default function ListaNotificacoes() {
    const listaRef = useRef<HTMLDivElement | null>(null);

    const [arrastando, setArrastando] = useState<boolean>(false);
    const [inicioY, setInicioY] = useState<number>(0);
    const [scrollInicial, setScrollInicial] = useState<number>(0);

    function iniciarArrasto(e: React.MouseEvent<HTMLDivElement>) {
        if (!listaRef.current) return;

        setArrastando(true);

        /* e.clientY retorna a posição vertical do mouse
           no momento em que foi ativado o scroll */
        setInicioY(e.clientY);

        /* Guarda a posição atual do scroll */
        setScrollInicial(listaRef.current.scrollTop);
    }

    function arrastar(e: React.MouseEvent<HTMLDivElement>) {
        if (!arrastando || !listaRef.current) return;

        const distancia = e.clientY - inicioY;

        listaRef.current.scrollTop =
            scrollInicial - distancia;
    }

    function pararArrasto() {
        setArrastando(false);
    }

    return (
        <div className={styles.container}>

            <div className={styles.textoNotificacoes}>
                <Bell
                    size={28}
                    strokeWidth={2}
                    className={styles.iconeSino}
                />

                <h2>Notificações</h2>
            </div>

            <div className={styles.painelNotificacoes}>

                <div
                    ref={listaRef}
                    className={styles.listaDeNotificacoes}
                    onMouseDown={iniciarArrasto}
                    onMouseMove={arrastar}
                    onMouseUp={pararArrasto}
                    onMouseLeave={pararArrasto}
                >

                    <div className={styles.notificacao}>
                        <div className={styles.cabecalhoNotificacao}>
                            <span className={styles.tituloNotificacao}>
                                Frequência pendente
                            </span>

                            <span className={styles.dataEnvio}>
                                Há 20 minutos
                            </span>

                            <span className={styles.indicadorVisualizacao} />
                        </div>

                        <span className={styles.conteudoNotificacao}>
                            Olá, professor(a). A frequência da aula de hoje ainda não foi ...
                        </span>
                    </div>


                    <div className={styles.notificacao}>
                        <div className={styles.cabecalhoNotificacao}>
                            <span className={styles.tituloNotificacao}>
                                Nova atividade entregue
                            </span>

                            <span className={styles.dataEnvio}>
                                Há 52 minutos
                            </span>

                            <span className={styles.indicadorVisualizacao} />
                        </div>

                        <span className={styles.conteudoNotificacao}>
                            Olá, professor(a). Há novas atividades enviadas pelos alunos ...
                        </span>
                    </div>


                    <div className={styles.notificacao}>
                        <div className={styles.cabecalhoNotificacao}>
                            <span className={styles.tituloNotificacao}>
                                Nova atividade entregue
                            </span>

                            <span className={styles.dataEnvio}>
                                Há 21 horas
                            </span>
                        </div>

                        <span className={styles.conteudoNotificacao}>
                            Olá, professor(a). Há novas atividades enviadas pelos alunos ...
                        </span>
                    </div>


                    <div className={styles.notificacao}>
                        <div className={styles.cabecalhoNotificacao}>
                            <span className={styles.tituloNotificacao}>
                                Nova atividade entregue
                            </span>

                            <span className={styles.dataEnvio}>
                                Há 2 dias
                            </span>
                        </div>

                        <span className={styles.conteudoNotificacao}>
                            Olá, professor(a). Há novas atividades enviadas pelos alunos ...
                        </span>
                    </div>

                    <div className={styles.notificacao}>
                        <div className={styles.cabecalhoNotificacao}>
                            <span className={styles.tituloNotificacao}>
                                Nova atividade entregue
                            </span>

                            <span className={styles.dataEnvio}>
                                Há 3 dias
                            </span>
                        </div>

                        <span className={styles.conteudoNotificacao}>
                            Olá, professor(a). Há novas atividades enviadas pelos alunos ...
                        </span>
                    </div>

                </div>


                <div className={styles.verMais}>
                    <span>Ver mais</span>

                    <Plus
                        size={22}
                        strokeWidth={3}
                    />
                </div>

            </div>

        </div>
    );
}