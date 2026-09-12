'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../../styles/Carrossel.module.css';

export default function Carrossel() {

  const slides = [
    {
      imagem: '/images/volta-aulas.jpg',
      tipo: 'Aviso',
      titulo: 'Volta as Aulas 2026',
      destaque: 'Atenção Professores!',
      descricao:
        'Revise suas turmas, conteúdos e planejamentos para deixar tudo pronto para o início do semestre.',
      data: '27 de setembro de 2026',
    },

    {
      imagem: '/images/reuniao.jpg',
      tipo: 'Aviso',
      titulo: 'Reunião Pedagógica',
      destaque: 'Atenção Professores!',
      descricao:
        'Participe da reunião pedagógica para alinhamento das atividades do próximo semestre.',
      data: '30 de setembro de 2026',
    },

    {
      imagem: '/images/evento.jpg',
      tipo: 'Evento',
      titulo: 'Semana Acadêmica',
      destaque: 'Não fique de fora!',
      descricao:
        'Confira a programação da semana acadêmica e participe das atividades.',
      data: '05 de outubro de 2026',
    },
  ];

  const [slideAtual, setSlideAtual] = useState(0);

  function proximoSlide() {
    setSlideAtual((slideAtual + 1) % slides.length);
  }

  function slideAnterior() {
    setSlideAtual(
      slideAtual === 0 ? slides.length - 1 : slideAtual - 1
    );
  }

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideAtual((atual) => (atual + 1) % slides.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const slide = slides[slideAtual];

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${slide.imagem})`,
      }}
    >

      {/* Sombra azul no carrosel*/}
      <div className={styles.sombra}></div>


      {/* SETA DA ESQUERDA */}
      <button
        className={`${styles.seta} ${styles.setaEsquerda}`}
        onClick={slideAnterior}
      >
        <ChevronLeft size={48} strokeWidth={3} />
      </button>


      {/* CONTEÚDO */}
      <div className={styles.conteudo}>

        <span className={styles.aviso}>
          {slide.tipo}
        </span>

        <h1 className={styles.titulo}>
          {slide.titulo}
        </h1>

        <h3 className={styles.destaque}>
          {slide.destaque}
        </h3>

        <p className={styles.descricao}>
          {slide.descricao}
        </p>

        <p className={styles.data}>
          {slide.data}
        </p>

      </div>


      {/* SETA DA DIREITA */}
      <button
        className={`${styles.seta} ${styles.setaDireita}`}
        onClick={proximoSlide}
      >
        <ChevronRight size={48} strokeWidth={3} />
      </button>


      {/* BOLINHAS */}
      <div className={styles.indicadores}>

        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicador} ${
              slideAtual === index ? styles.indicadorAtivo : ''
            }`}
            onClick={() => setSlideAtual(index)}
          />
        ))}

      </div>

    </div>
  );
}