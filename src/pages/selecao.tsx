import React from "react";
import styles from "./Selecao.module.css";
import homeStyles from "./Home.module.css";
import pose from "../assets/pose.png";
import fita from "../assets/fita.png";
import fundoc from "../assets/fundoc.png";
import { useNavigate } from "react-router-dom";

const experiments = [
  {
    title: "TOHE",
    image: pose,
    alt: "Pessoa realizando uma atividade de atenção no computador",
    description:
      "O Teste de Organização de Histórias Emocionais (TOHE) é um instrumento psicológico de desempenho que avalia a inteligência emocional e a personalidade. O avaliando deve organizar figuras para formar histórias coerentes, escolhendo as reações dos personagens.",
  },
  {
    title: "Em breve..",
    image: fita,
    alt: "Fita de sinalização representando uma atividade de foco",
    description:
      "Novos experimentos de terapia e atenção podem ser adicionados no futuro.",
  },
];

const Selecao: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [colorFilter, setColorFilter] = React.useState("none");
  const [wideLetters, setWideLetters] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [previousSlide, setPreviousSlide] = React.useState(0);
  const [slideDirection, setSlideDirection] = React.useState<"next" | "previous">("next");
  const [isAnimating, setIsAnimating] = React.useState(false);
  const experiment = experiments[activeSlide];

  const pageClassName = [
    styles.page,
    colorFilter !== "none" ? homeStyles[colorFilter] : "",
    wideLetters ? homeStyles.wideLetters : "",
    highContrast ? homeStyles.highContrast : "",
  ].filter(Boolean).join(" ");

  const handleLogout = () => {
    localStorage.removeItem("consattentia-user-name");
    navigate("/");
  };

  const changeSlide = (direction: "next" | "previous") => {
    if (isAnimating) return;

    setPreviousSlide(activeSlide);
    setSlideDirection(direction);
    setActiveSlide((current) =>
      direction === "next"
        ? (current + 1) % experiments.length
        : (current - 1 + experiments.length) % experiments.length
    );
    setIsAnimating(true);
    window.setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <main className={pageClassName}>
      <header className={styles.header}>
        <button className={styles.brand} onClick={() => navigate("/home")}>
          <img src={fundoc} alt="ConsAttentia" />
        </button>
        <button
          className={styles.menuButton}
          aria-label="Abrir configurações"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <span></span><span></span><span></span>
        </button>
      </header>

      <section className={styles.experiment} aria-label={`Experimento ${experiment.title}`}>
        <h1>{experiment.title}</h1>
        <div className={styles.carousel}>
          <button
            className={styles.arrow}
            aria-label="Experimento anterior"
            disabled={isAnimating}
            onClick={() => changeSlide("previous")}
          >
            ‹
          </button>
          <button
            className={styles.imageFrameButton}
            aria-label="Abrir explicação do TOHE"
            onClick={() => navigate("/explicacao")}
            disabled={activeSlide !== 0 || isAnimating}
          >
            <div className={styles.imageFrame}>
            <img
              className={`${styles.carouselImage} ${styles.slideOut} ${previousSlide === 1 ? styles.fitaImage : ""} ${slideDirection === "next" ? styles.slideOutToLeft : styles.slideOutToRight}`}
              src={experiments[previousSlide].image}
              alt=""
            />
            <img
              key={`${activeSlide}-${slideDirection}`}
              className={`${styles.carouselImage} ${styles.slideIn} ${activeSlide === 1 ? styles.fitaImage : ""} ${slideDirection === "next" ? styles.slideInFromRight : styles.slideInFromLeft}`}
              src={experiment.image}
              alt={experiment.alt}
            />
            </div>
          </button>
          <button
            className={styles.arrow}
            aria-label="Próximo experimento"
            disabled={isAnimating}
            onClick={() => changeSlide("next")}
          >
            ›
          </button>
        </div>
        <p>{experiment.description}</p>
      </section>

      {isMenuOpen && (
        <>
          <button
            className={homeStyles.drawerOverlay}
            aria-label="Fechar configurações"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className={homeStyles.drawer} aria-label="Configurações de acessibilidade">
            <div className={homeStyles.drawerHeader}>
              <div>
                <span className={homeStyles.drawerKicker}>Personalize sua experiência</span>
                <h2>Configurações</h2>
              </div>
              <button
                className={homeStyles.closeButton}
                aria-label="Fechar configurações"
                onClick={() => setIsMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <section className={homeStyles.settingsSection}>
              <h3>Acessibilidade</h3>
              <div className={homeStyles.settingGroup}>
                <span className={homeStyles.settingLabel}>Filtros para daltonismo</span>
                <button className={colorFilter === "protanopia" ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setColorFilter(colorFilter === "protanopia" ? "none" : "protanopia")}>
                  Protanopia
                </button>
                <button className={colorFilter === "deuteranopia" ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setColorFilter(colorFilter === "deuteranopia" ? "none" : "deuteranopia")}>
                  Deuteranopia
                </button>
                <button className={colorFilter === "tritanopia" ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setColorFilter(colorFilter === "tritanopia" ? "none" : "tritanopia")}>
                  Tritanopia
                </button>
              </div>
              <button className={wideLetters ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setWideLetters(!wideLetters)}>
                Espaçamento entre letras
              </button>
              <button className={highContrast ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setHighContrast(!highContrast)}>
                Alto contraste
              </button>
            </section>

            <button className={homeStyles.logoutButton} onClick={handleLogout}>
              Sair e voltar para o login
            </button>
          </aside>
        </>
      )}
    </main>
  );
};

export default Selecao;
