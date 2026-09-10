'use client';

import styles from '../styles/TelaLogin.module.css';
import { useRouter } from "next/navigation"


export default function Page() {
  const router = useRouter()
  return (
    <div 
      className={styles.fundoGradiente}>
      
      <div
        className={styles.fundoTransparente}>
          
          <img src="images/logoBranco.png" alt="Logo"/>

          <div
            className={styles.login}>
            
            <text 
              className={styles.titulo}>Login</text>

            <div 
              className={styles.espacamentoTituloInpput}>
              
              <text 
                className={styles.texto}>Usuário</text>
              
              <input 
                className={styles.inputs} type="text" name="usuario" placeholder='Email ou RA'/>
            </div>

            <div 
              className={styles.espacamentoTituloInpput}>
            
              <text 
                className={styles.texto}>Senha</text>
              
              <input 
                className={styles.inputs} type='text' name='senha' placeholder='Senha'/>
            
            </div>

            <a 
              className={styles.link}>Esqueci minha senha</a>

            <button
              type='button'
              className={styles.botaoEntrar}
              onClick={() => router.push('/home')}>
              Entrar
            </button>
          </div>

      </div>
    
    </div>
  );
}