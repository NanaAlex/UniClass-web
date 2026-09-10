'use client';

import { usePathname, useRouter } from 'next/navigation';

import styles from '../../styles/NavBar.module.css';

interface ItemMenu {
    nome: string;
    rota: string;
    iconeBranco: string;
    iconePreto: string;
}

const itensSuperiores: ItemMenu[] = [
    {
        nome: 'Notificações',
        rota: '/notificacoes',
        iconeBranco: '/icons/notificacoesBranco.svg',
        iconePreto: '/icons/notificacoesPreto.svg',
    },
    {
        nome: 'Tela Inicial',
        rota: '/home',
        iconeBranco: '/icons/telaInicialBranco.svg',
        iconePreto: '/icons/telaInicialPreto.svg',
    },
    {
        nome: 'Turmas',
        rota: '/turmas',
        iconeBranco: '/icons/turmaBranco.svg',
        iconePreto: '/icons/turmaPreto.svg',
    },
    {
        nome: 'Chamada',
        rota: '/chamada',
        iconeBranco: '/icons/chamadaBranco.svg',
        iconePreto: '/icons/chamadaPreto.svg',
    },
    {
        nome: 'Documentos',
        rota: '/documentos',
        iconeBranco: '/icons/boletimBranco.svg',
        iconePreto: '/icons/boletimPreto.svg',
    },
];

const configuracoes: ItemMenu = {
    nome: 'Configurações',
    rota: '/configuracoes',
    iconeBranco: '/icons/configuracoesBranco.svg',
    iconePreto: '/icons/configuracoesPreto.svg',
};

export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname();

    const estaSelecionado = (rota: string) => {
        if (rota === '/') {
            return pathname === '/';
        }

        return pathname.startsWith(rota);
    };

    return (
        <div className={styles.container}>
            <div className={styles.barraSuperior}>
                {itensSuperiores.map((item) => {
                    const selecionado = estaSelecionado(item.rota);

                    return (
                        <div
                            key={item.rota}
                            className={`${styles.itemBarraLateral} ${
                                selecionado ? styles.itemSelecionado : ''
                            }`}
                            onClick={() => router.push(item.rota)}
                        >
                            <div className={styles.iconeItemBarraLateral}>
                                <img
                                    src={
                                        selecionado
                                            ? item.iconePreto
                                            : item.iconeBranco
                                    }
                                    alt=""
                                    className={styles.iconeMenu}
                                />
                            </div>

                            <div className={styles.nomeItemBarraLateral}>
                                <span>{item.nome}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.barraInferior}>
                <div
                    className={`${styles.itemBarraLateral} ${
                        estaSelecionado(configuracoes.rota)
                            ? styles.itemSelecionado
                            : ''
                    }`}
                    onClick={() => router.push(configuracoes.rota)}
                >
                    <div className={styles.iconeItemBarraLateral}>
                        <img
                            src={
                                estaSelecionado(configuracoes.rota)
                                    ? configuracoes.iconePreto
                                    : configuracoes.iconeBranco
                            }
                            alt=""
                            className={styles.iconeMenu}
                        />
                    </div>

                    <div className={styles.nomeItemBarraLateral}>
                        <span>{configuracoes.nome}</span>
                    </div>
                </div>

                <div
                    className={`${styles.itemBarraLateral} ${styles.itemSair}`}
                >
                    <div className={styles.iconeItemBarraLateral}>
                        <img
                            src="/icons/sairBranco.svg"
                            alt=""
                            className={styles.iconeMenu}
                        />
                    </div>

                    <div className={styles.nomeItemBarraLateral}>
                        <span>Sair</span>
                    </div>
                </div>
            </div>
        </div>
    );
}