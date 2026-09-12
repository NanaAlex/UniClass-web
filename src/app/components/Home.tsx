import Header from './Header';
import NavBar from './NavBar';
import Carrossel from './Carrossel';
import ListaNotificacoes from './ListaNotificacoes';
import ListaTurmas from './ListaTurmas';
import styles from '../../styles/Home.module.css'

export default function Home() {
  return (
    <main>
      <div className={styles.headerHome}>
        <Header />
      </div>

      <div className={styles.telaHome}>
        <div className={styles.menuLateral}>
          <NavBar />
        </div>
        
        <div className={styles.conteudosHome}>
          <div className={styles.parteSuperior}>
            <div className={styles.textosTopo}>
              <div className={styles.olaProfessor}>
                <h1 className={styles.olaProfessorTexto}>Olá, Prof. João Gomes!</h1>
              </div>
              <div className={styles.data}>
                <h1 className={styles.dataTexto}>Terça - 15/07</h1>
              </div>
            </div>

            <Carrossel />
          </div>

          <div className={styles.parteInferior}>
            <ListaNotificacoes />
            <ListaTurmas />
          </div>
        </div>
        
      </div>
      
    </main>
  );
}