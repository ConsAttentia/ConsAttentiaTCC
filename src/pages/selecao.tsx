import React from "react";
import styles from "./Selecao.module.css";
import pose from "../assets/pose.png";
import fita from "../assets/fita.png";
import fundoc from "../assets/fundoc.png";
import { useNavigate } from "react-router-dom";
import MenuConta from "../componentes/MenuConta";

const experiments = [
  {
    title: "TOHE",
    image: pose,
    route: "/tohe",
    alt: "Pessoa realizando uma atividade de atenção no computador",
    description:
      "O Teste de Organização de Histórias Emocionais (TOHE) é um instrumento psicológico de desempenho que avalia a inteligência emocional e a personalidade. O avaliando deve organizar figuras para formar histórias coerentes, escolhendo as reações dos personagens.",
  },
  {
    title: "AATS",
    image: fita,
    route: "/aats",
    alt: "Fita de sinalização representando uma atividade de foco",
    description:
      "Atividade de Atenção Sustentada: acompanhe palavras em áudio e responda aos critérios de cada etapa para exercitar o foco contínuo.",
  },
];

const Selecao: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = React.useState(0);
  const experiment = experiments[activeSlide];

  const changeSlide = (direction: "next" | "previous") => {
    setActiveSlide((current) =>
      direction === "next"
        ? (current + 1) % experiments.length
        : (current - 1 + experiments.length) % experiments.length
    );
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button className={styles.brand} onClick={() => navigate("/home")}>
          <img src={fundoc} alt="ConsAttentia" />
        </button>
        <MenuConta />
      </header>

      <section className={styles.experiment} aria-label={`Experimento ${experiment.title}`}>
        <h1>{experiment.title}</h1>
        <div className={styles.carousel}>
          <button
            className={styles.arrow}
            aria-label="Experimento anterior"
            onClick={() => changeSlide("previous")}
          >
            ‹
          </button>
          <button
            className={styles.imageFrameButton}
            aria-label={`Abrir ${experiment.title}`}
            onClick={() => navigate(experiment.route)}
          >
            <div className={styles.imageFrame}>
              <img
                className={`${styles.carouselImage} ${activeSlide === 1 ? styles.fitaImage : ""}`}
                src={experiment.image}
                alt={experiment.alt}
              />
            </div>
          </button>
          <button
            className={styles.arrow}
            aria-label="Próximo experimento"
            onClick={() => changeSlide("next")}
          >
            ›
          </button>
        </div>
        <p>{experiment.description}</p>
      </section>

    </main>
  );
};

export default Selecao;
