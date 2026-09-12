import Link from 'next/link'
import { CircleUserRound } from 'lucide-react'
import styles from '../../styles/Header.module.css'

export default function Header() {
  return (
    <div className={styles.container}>
      <div className={styles.logoHeader}>
        <span className={styles.textoHeader}>
          UniClass
        </span>
      </div>

      <div className={styles.perfilHeader}>
        <div className={styles.nomeProfessorHeader}>
          <span className={styles.textoNomeProfessorHeader}>
            João Gomes
          </span>
        </div>

        <Link
          href="/perfil"
          className={styles.iconePerfilHeader}
          aria-label="Abrir perfil do professor"
        >
          <CircleUserRound
            size={64}
            color="white"
            strokeWidth={2}
          />
        </Link>
      </div>
    </div>
  )
}